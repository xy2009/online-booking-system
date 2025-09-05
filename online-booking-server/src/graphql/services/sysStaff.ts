import { omit } from 'lodash';

import { SysStaff, SysStaffInput, SysStaffUpdateInput, SysStaffFilter, SysStaffListResult } from '../types/sysStaff';
import { CouchbaseDB } from '../../database/couchbaseUtils';
import { COLLECTIONS, SCOPES } from '../../common/constants/consts';
import AppError from '../../common/errors';
import { generateUUID } from '../../common/utils/util';
import { logger } from '../../common/utils/logger';
import { isSystemStaff } from '../middleware/permissionMiddleware';
import { IAccountResponse } from '../../entities/accountEntity';

const businessScope = SCOPES.BUSINESS;
const staffCollection = COLLECTIONS.STAFF;
const staffCollectionFullName = CouchbaseDB.getCollectionFullName(
  businessScope,
  staffCollection
);

/**
 * 创建员工
 */
export const createSysStaff = async (
  input: SysStaffInput, 
  accountId: string, 
  branchId: string,
  currentUser: IAccountResponse
): Promise<SysStaff> => {
  const { name, position, contactNumber, email, status, hireDate } = input;
  
  if (!name || !position || !hireDate) {
    throw AppError.paramsError('Name, position, and hire date are required');
  }

  // 只有系统管理员可以创建员工
  if (!isSystemStaff(currentUser.role)) {
    throw AppError.forbidden('Only system staff can create employees');
  }

  const now = Date.now();
  const id = generateUUID();
  const key = `${staffCollection}::${id}`;

  const newStaff: SysStaff = {
    id,
    accountId,
    branchId,
    name,
    sex: 'male', // 默认值，可以后续通过更新修改
    position,
    contactNumber,
    email,
    status: status || 'active',
    hireDate,
    createdAt: now,
    updatedAt: now,
    type: staffCollection,
  };

  await CouchbaseDB.upsert(businessScope, staffCollection, key, newStaff);
  
  // 返回时不包含内部字段
  return omit(newStaff, ['type']) as SysStaff;
};

/**
 * 更新员工信息
 */
export const updateSysStaff = async (
  id: string, 
  update: SysStaffUpdateInput, 
  currentUser: IAccountResponse
): Promise<SysStaff | null> => {
  const key = `${staffCollection}::${id}`;
  const res = await CouchbaseDB.get(businessScope, staffCollection, key);
  
  if (!res?.content) {
    throw AppError.notFound('Staff member not found');
  }

  // 只有系统管理员可以更新员工信息
  if (!isSystemStaff(currentUser.role)) {
    throw AppError.forbidden('Only system staff can update employee information');
  }

  const staff = res.content as SysStaff;
  const now = Date.now();

  // 如果状态更新为 terminated，自动设置离职日期
  const updateData: Partial<SysStaff> = {
    ...update,
    updatedAt: now,
  };

  if (update.status === 'terminated' && !staff.terminationDate) {
    updateData.terminationDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 格式
  }

  const updatedStaff: SysStaff = {
    ...staff,
    ...updateData,
  };

  await CouchbaseDB.upsert(businessScope, staffCollection, key, updatedStaff);
  
  // 返回时不包含内部字段
  return omit(updatedStaff, ['type']) as SysStaff;
};

/**
 * 根据ID获取员工
 */
export const getSysStaffById = async (id: string): Promise<SysStaff | null> => {
  const key = `${staffCollection}::${id}`;
  const res = await CouchbaseDB.get(businessScope, staffCollection, key);
  
  if (!res?.content) {
    return null;
  }

  // 返回时不包含内部字段
  return omit(res.content, ['type']) as SysStaff;
};

/**
 * 获取员工列表
 */
export const listSysStaffs = async (
  filter: SysStaffFilter = {},
  page = 1,
  pageSize = 20
): Promise<SysStaffListResult> => {
  const where: string[] = [`type = $type`];
  const params: Record<string, any> = {
    type: staffCollection,
  };

  if (filter.name) {
    where.push('name LIKE $name');
    params.name = `%${filter.name}%`;
  }
  
  if (filter.position) {
    where.push('position LIKE $position');
    params.position = `%${filter.position}%`;
  }
  
  if (filter.status) {
    where.push('status = $status');
    params.status = filter.status;
  }
  
  if (filter.hireDateFrom) {
    where.push('hireDate >= $hireDateFrom');
    params.hireDateFrom = filter.hireDateFrom;
  }
  
  if (filter.hireDateTo) {
    where.push('hireDate <= $hireDateTo');
    params.hireDateTo = filter.hireDateTo;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * pageSize;

  // 获取总数
  const countSql = `SELECT COUNT(*) AS total FROM ${staffCollectionFullName} ${whereClause}`;
  const countResult = await CouchbaseDB.query(countSql, { parameters: params });
  const total = countResult.rows[0]?.total ?? 0;

  // 获取数据
  const sql = `
    SELECT META().id, *
    FROM ${staffCollectionFullName}
    ${whereClause}
    ORDER BY createdAt DESC
    LIMIT $pageSize OFFSET $offset
  `;
  
  const result = await CouchbaseDB.query(sql, {
    parameters: { ...params, pageSize, offset }
  });

  // 处理结果，移除内部字段
  const items: SysStaff[] = result.rows.map((row: any) => {
    const staff = row[staffCollection] || row;
    return omit(staff, ['type']) as SysStaff;
  });

  return {
    total,
    items,
    page,
    pageSize,
  };
};

/**
 * 删除员工
 */
export const deleteSysStaff = async (id: string): Promise<boolean> => {
  const key = `${staffCollection}::${id}`;
  try {
    await CouchbaseDB.remove(businessScope, staffCollection, key);
    return true;
  } catch (error) {
    logger.error('Error deleting staff member:', error);
    return false;
  }
};

/**
 * 根据账户ID获取员工信息
 */
export const getSysStaffByAccountId = async (accountId: string): Promise<SysStaff | null> => {
  try {
    const result = await CouchbaseDB.query(
      `SELECT s.* FROM ${staffCollectionFullName} AS s 
       WHERE s.type = $type AND s.accountId = $accountId 
       LIMIT 1`,
      {
        parameters: {
          type: staffCollection,
          accountId,
        },
      }
    );
    
    if (result.rows.length > 0) {
      return omit(result.rows[0], ['type']) as SysStaff;
    }
    return null;
  } catch (err) {
    logger.error('Error querying staff by account ID:', err);
    throw AppError.internal('Database query error');
  }
};

/**
 * 根据门店ID获取员工列表
 */
export const getSysStaffsByBranchId = async (branchId: string): Promise<SysStaff[]> => {
  try {
    const result = await CouchbaseDB.query(
      `SELECT s.* FROM ${staffCollectionFullName} AS s 
       WHERE s.type = $type AND s.branchId = $branchId 
       ORDER BY s.createdAt DESC`,
      {
        parameters: {
          type: staffCollection,
          branchId,
        },
      }
    );
    
    return result.rows.map((row: any) => omit(row, ['type']) as SysStaff);
  } catch (err) {
    logger.error('Error querying staff by branch ID:', err);
    throw AppError.internal('Database query error');
  }
};
