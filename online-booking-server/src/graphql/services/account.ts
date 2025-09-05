import bcrypt from 'bcryptjs';
import { omit } from 'lodash';

import { Account, AccountInput, AccountUpdateInput, AccountFilter, AccountListResult } from '../types/account';
import { CouchbaseDB } from '../../database/couchbaseUtils';
import { COLLECTIONS, SCOPES, EnvKeys } from '../../common/constants/consts';
import AppError from '../../common/errors';
import { generateUUID } from '../../common/utils/util';
import { logger } from '../../common/utils/logger';
import { _getConfigByKey_ } from '../../common/config';
import { isAdmin, isSystemStaff } from '../middleware/permissionMiddleware';
import { IAccountResponse } from '../../entities/accountEntity';

const userScope = SCOPES.USER;
const accountCollection = COLLECTIONS.ACCOUNT;
const accountCollectionFullName = CouchbaseDB.getCollectionFullName(
  userScope,
  accountCollection
);

/**
 * 创建账户
 */
export const createAccount = async (input: AccountInput): Promise<Account> => {
  const { mobile, password, role, status, username } = input;
  
  if (!mobile || !password) {
    throw AppError.paramsError('Mobile and password are required');
  }

  // 检查手机号是否已存在
  const existingAccount = await getAccountByMobile(mobile);
  if (existingAccount) {
    throw AppError.keyAlreadyExists('Mobile number already registered');
  }

  // 获取密码盐值
  const pwdSalt = _getConfigByKey_(EnvKeys.PWD_SALT, 3);
  if (!pwdSalt) {
    logger.error('PWD_SALT is not configured');
    throw AppError.internal('Password salt not configured');
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, pwdSalt);
  
  const now = Date.now();
  const id = generateUUID();
  const userId = generateUUID();
  const key = `${accountCollection}::${id}`;

  const newAccount: Account = {
    id,
    mobile,
    password: hashedPassword,
    role: role || 'customer',
    status: status || 'active',
    username,
    userId,
    createdAt: now,
    updatedAt: now,
    type: accountCollection,
  };

  await CouchbaseDB.upsert(userScope, accountCollection, key, newAccount);
  
  // 返回时不包含密码和内部字段
  return omit(newAccount, ['password', 'type']) as Account;
};

/**
 * 更新账户
 */
export const updateAccount = async (
  id: string, 
  update: AccountUpdateInput, 
  currentUser: IAccountResponse
): Promise<Account | null> => {
  const key = `${accountCollection}::${id}`;
  const res = await CouchbaseDB.get(userScope, accountCollection, key);
  
  if (!res?.content) {
    throw AppError.notFound('Account not found');
  }

  const account = res.content as Account;
  const now = Date.now();

  // 权限检查：只有系统管理员可以修改其他用户，用户只能修改自己的部分信息
  const isSystem = isSystemStaff(currentUser.role);
  if (!isSystem && account.id !== currentUser.id) {
    throw AppError.forbidden('You can only update your own account');
  }

  // 非系统管理员只能修改用户名，不能修改状态
  if (!isSystem && update.status) {
    throw AppError.forbidden('You cannot change account status');
  }

  const updateData: Partial<Account> = {
    ...update,
    updatedAt: now,
  };

  // 如果更新密码，需要加密
  if (update.password) {
    const pwdSalt = _getConfigByKey_(EnvKeys.PWD_SALT, 3);
    if (!pwdSalt) {
      logger.error('PWD_SALT is not configured');
      throw AppError.internal('Password salt not configured');
    }
    updateData.password = await bcrypt.hash(update.password, pwdSalt);
  }

  const updatedAccount: Account = {
    ...account,
    ...updateData,
  };

  await CouchbaseDB.upsert(userScope, accountCollection, key, updatedAccount);
  
  // 返回时不包含密码和内部字段
  return omit(updatedAccount, ['password', 'type']) as Account;
};

/**
 * 根据ID获取账户
 */
export const getAccountById = async (id: string): Promise<Account | null> => {
  const key = `${accountCollection}::${id}`;
  const res = await CouchbaseDB.get(userScope, accountCollection, key);
  
  if (!res?.content) {
    return null;
  }

  // 返回时不包含密码和内部字段
  return omit(res.content, ['password', 'type']) as Account;
};

/**
 * 根据手机号获取账户（内部使用，包含密码）
 */
export const getAccountByMobile = async (mobile: string): Promise<Account | null> => {
  try {
    const result = await CouchbaseDB.query(
      `SELECT a.* FROM ${accountCollectionFullName} AS a 
       WHERE a.type = $type AND a.mobile = $mobile 
       LIMIT 1`,
      {
        parameters: {
          type: accountCollection,
          mobile,
        },
      }
    );
    
    if (result.rows.length > 0) {
      return result.rows[0] as Account;
    }
    return null;
  } catch (err) {
    logger.error('Error querying account by mobile:', err);
    throw AppError.internal('Database query error');
  }
};

/**
 * 获取账户列表
 */
export const listAccounts = async (
  filter: AccountFilter = {},
  page = 1,
  pageSize = 20,
  account: Account
): Promise<AccountListResult> => {
  const where: string[] = [`type = $type`];
  const params: Record<string, any> = {
    type: accountCollection,
  };

  if (filter.mobile) {
    where.push('mobile LIKE $mobile');
    params.mobile = `%${filter.mobile}%`;
  }
  // 只有系统管理员可以查看所有账户
  if (isAdmin(account.role) && filter.role) {
    where.push('role = $role');
    params.role = filter.role;
  } else {
    // 非管理员只能查看非管理员账户
    where.push('role != $adminRole');
    params.adminRole = 'admin';
  }
  
  if (filter.status) {
    where.push('status = $status');
    params.status = filter.status;
  }
  
  if (filter.createdFrom !== undefined) {
    where.push('createdAt >= $createdFrom');
    params.createdFrom = filter.createdFrom;
  }
  
  if (filter.createdTo !== undefined) {
    where.push('createdAt <= $createdTo');
    params.createdTo = filter.createdTo;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * pageSize;

  // 获取总数
  const countSql = `SELECT COUNT(*) AS total FROM ${accountCollectionFullName} ${whereClause}`;
  const countResult = await CouchbaseDB.query(countSql, { parameters: params });
  const total = countResult.rows[0]?.total ?? 0;

  // 获取数据
  const sql = `
    SELECT META().id, *
    FROM ${accountCollectionFullName}
    ${whereClause}
    ORDER BY createdAt DESC
    LIMIT $pageSize OFFSET $offset
  `;
  
  const result = await CouchbaseDB.query(sql, {
    parameters: { ...params, pageSize, offset }
  });

  // 处理结果，移除密码和内部字段
  const items: Account[] = result.rows.map((row: any) => {
    const account = row[accountCollection] || row;
    return omit(account, ['password', 'type']) as Account;
  });

  return {
    total,
    items,
    page,
    pageSize,
  };
};

/**
 * 删除账户
 */
export const deleteAccount = async (id: string): Promise<boolean> => {
  const key = `${accountCollection}::${id}`;
  try {
    await CouchbaseDB.remove(userScope, accountCollection, key);
    return true;
  } catch (error) {
    logger.error('Error deleting account:', error);
    return false;
  }
};
