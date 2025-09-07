
import { Branch, BranchFilter, BranchInput, BranchUpdateInput } from "../types/branch";
import { Pagination } from "../types/common";
import { SCOPES, COLLECTIONS, WORK_TIMES } from "../../common/constants/consts";
import { CouchbaseDB } from "../../database/couchbaseUtils";
import { generateUUID } from "../../common/utils/util";
import AppError from "../../common/errors";
import omit from "lodash/omit";
import { IAccountResponse } from "src/entities/accountEntity";
import { isSystemStaff } from "../middleware/permissionMiddleware";
import { create } from "lodash";

const orgScope = SCOPES.ORG;
const branchCollection = COLLECTIONS.BRANCH;

const branchCollectionFullName = CouchbaseDB.getCollectionFullName(
    orgScope,
    branchCollection
);

/**
 * find branches with filter and pagination
 * @param filter 
 * @param pagination 
 * @returns 
 */
export const branchServiceFind = async (filter: BranchFilter, pagination: Pagination) => {
  const { page, pageSize } = pagination;
  const offset = (page - 1) * pageSize;
  // 构建 WHERE 子句
  const where: string[] = [];
  const params: Record<string, any> = {};
  console.log("Filter received in branchServiceFind:", filter);

  if (filter.name) {
    where.push("name LIKE $name");
    params.name = `%${filter.name}%`;
  }
  if (filter.status) {
    where.push("status = $status");
    params.status = filter.status;
  }
  // ...其它 filter
// 排除status是deleted，只查询active和inactive的分店
    where.push("status != 'deleted'");
  // 添加status是
    where.push("type = $type");
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // 查询总数
  const countSql = `SELECT COUNT(*) AS total FROM ${branchCollectionFullName} ${whereClause}`;
  params.type = branchCollection; // 确保查询的是分店集合
  console.log("Executing count query:", countSql, "with params:", params);
  const countResult = await CouchbaseDB.query(countSql, { parameters: params });

  const total = countResult.rows[0]?.total ?? 0;

  // 查询分页数据
  const sql = `
    SELECT META().id, name, address, openTime, closeTime, contactName, contactNumber, description, status, createdAt, updatedAt
    FROM ${branchCollectionFullName}
    ${whereClause}
    ORDER BY createdAt DESC
    LIMIT $pageSize OFFSET $offset
  `;
//   console.log("Executing branch query:", sql, "with params:", { ...params, pageSize, offset });
  const result = await CouchbaseDB.query(sql, {
    parameters: { ...params, pageSize, offset, type: branchCollection }
  });
  console.log("Branch query result:", result);

  const items = result.rows.map((row: Branch) => {
    if (row && row?.id.includes("::")) {
      row.id = row?.id.split("::")[1]; // 提取实际的ID部分
      return row;
    }
  });

  return {
    items,
    total,
    page,
    pageSize
  };
};

/**
 * get branch by id
 * @param id 
 * @returns 
 */
export const getBranchById = async (id: string) => {
  const res = await CouchbaseDB.get(
    orgScope,
    branchCollection,
    `${branchCollection}::${id}`
  );
  return res?.content;
}

const virafyBranchName = async(name: string): Promise<string> => {
    const res = await CouchbaseDB.query(`SELECT name FROM ${branchCollectionFullName} WHERE name = $name AND type = $type LIMIT 1`, { parameters: { name, type: branchCollection } });
    console.log("=========virafyBranchName query result:", res);
    // 如果查询结果有数据，说明同名分店已存在
    if (res.rows.length > 0) {
      throw AppError.keyAlreadyExists('Branch name already exists');
      // throw AppError.keyAlreadyExists('分店名称已存在');
    }
    return name;
}

export const createBranch = async (branch: BranchInput, accoutId: string) => {
    
    // 校验同名分店
    await virafyBranchName(branch.name);

  const now = Date.now();
  const id = generateUUID();
  const newBranch = {
    ...branch,
    status: branch.status || 'active',
    createdAt: now,
    updatedAt: now,
    type: branchCollection, // 用于N1QL查询过滤
    id,
    openTime: branch.openTime || WORK_TIMES.OPEN_HOUR.toString(),
    closeTime: branch.closeTime || WORK_TIMES.CLOSE_HOUR.toString(),
  };
  const key = `${branchCollection}::${id}`; 
  await CouchbaseDB.upsert(
    orgScope,
    branchCollection,
    key,
    newBranch
  );
  return newBranch;
}

export const updateBranch = async (id: string, branch: BranchUpdateInput, account: IAccountResponse) => {
  const { id: accountId, role } = account;
  if (!accountId) {
    throw AppError.badRequest('Account ID is required for update');
  }
    const oldbranch = await getBranchById(id);
  if (!oldbranch) {
    throw AppError.notFound('Branch not found');
  }
  if (branch.name && branch.name !== oldbranch.name) {
    // 如果更新了名字，校验同名分店
    await virafyBranchName(branch.name);
  }

  const isSystem = isSystemStaff(role);
  if (!isSystem) {
    // 普通用户不能更新分店状态为 deleted
    if (branch.status === 'deleted') {
      throw AppError.forbidden('Forbidden: insufficient permissions to set status to deleted');
    }
  }

  const maintenanceLogItem = {
    id: `maintenance::${generateUUID()}`,
    backUp: JSON.stringify(omit(oldbranch, ['maintenanceLogs'])), // 维护前的分店数据快照，排除维护记录本身，避免嵌套过深
    accountId,
    performedAt: Date.now(),
  };

  // 如果已有维护记录，追加到数组前面，否则创建新数组
  const maintenanceLogs = oldbranch.maintenanceLogs ? [maintenanceLogItem, ...oldbranch.maintenanceLogs] : [maintenanceLogItem];

  let updatedBranch = {
    ...oldbranch,
    ...branch,
    name: branch.name || oldbranch.name,
    address: branch.address || oldbranch.address,
    contactName: branch.contactName || oldbranch.contactName,
    contactNumber: branch.contactNumber || oldbranch.contactNumber,
    status: branch.status || oldbranch.status,
    openTime: branch.openTime || oldbranch.openTime,
    closeTime: branch.closeTime || oldbranch.closeTime,
    createdAt: oldbranch.createdAt,
    updatedAt: Date.now(),
    maintenanceLogs,
    type: branchCollection // 用于N1QL查询过滤
  };
  console.log('=====updateBranch===>>>', updateBranch)
   const res =await CouchbaseDB.upsert(
    orgScope,
    branchCollection,
    `${branchCollection}::${id}`,
    updatedBranch
  );
  if (!isSystem) {
    // 普通用户不能看到维护记录
    updatedBranch = omit(updatedBranch, ['maintenanceLogs']);
  }
//   console.log("Update branch result:", res);
  return updatedBranch;
}

export const deleteBranch = async (id: string, account: IAccountResponse) => {
    const res = await updateBranch(id, { status: 'deleted' }, account);
    if (res && res.status == 'deleted') {
        return true;
    }
    return false;
}