import { Table, TableInput, TableUpdateInput, TableFilter, TableListResult, TableBookingFilter } from "../types/table";
import { sortBy } from "lodash";

import { CouchbaseDB } from "../../database/couchbaseUtils";
import { generateUUID } from "../../common/utils/util";
import AppError from "../../common/errors";
import { COLLECTIONS, DEFAULTS, SCOPES, WORK_TIMES } from "../../common/constants/consts";
import { logger } from "../../common/utils/logger";


const tableScop = SCOPES.BUSINESS;
const tableCollection = COLLECTIONS.TABLE;

const tableCollectionFullName = CouchbaseDB.getCollectionFullName(
  tableScop,
  tableCollection
);

const defaultTurntableCycle = DEFAULTS.DEFT_TURNTABLE_CYCLE; // 默认翻台周期，单位分钟

/**
 * check if a table is can be assigned
 * (available status is 'free' or 'cleaning') 
 * @param id <required> table id
 * @param branchId <optional> when provided, also check if the table belongs to the branch
 * @returns 
 */
export const isAvailableTable = async (id: string, branchId?: string): Promise<boolean> => {
  const key = `${tableCollection}::${id}`;
  const doc = await CouchbaseDB.get(tableScop, tableCollection, key);
  if (!doc) return false;
  const data: Table = doc.content;
  // 当传入 branchId 时，验证是否匹配
  if (branchId && branchId !== data.branchId) return false;
  // 检查状态，仅 free 和 cleaning 状态的桌子可用
  return ['free', 'cleaning'].includes(data.status);
};

  export const createTable = async (branchId: string, input: TableInput, accountId: string): Promise<Table> => {
    const now = Date.now();
    const id = generateUUID();
    const key = `${tableCollection}::${id}`;
    const { turntableCycle } = input;
    if (!branchId || !input.name || input.size <= 0 || !turntableCycle || !accountId) {
      throw AppError.paramsError("Missing required table fields");
    }
    // turntableCycle 至少 60 分钟
    if (turntableCycle < defaultTurntableCycle) {
      throw AppError.paramsError(`Invalid turntableCycle, must be positive, at least ${defaultTurntableCycle} minutes`);
    }

    // 检查 size 是否有效
    if (input.size < 1) {
      throw AppError.paramsError("Table size must be at least 1");
    }
    // 检查 maxSize 是否有效
    if (input.maxSize !== undefined && input.maxSize <= input.size) {
      throw AppError.paramsError("Table maxSize must be greater than size");
    }
    // 检查name是否重复
    const existingTables = await findTables({ branchId, name: input.name }, 1, 1, true);
    if (existingTables.total > 0) {
      throw AppError.keyAlreadyExists("Table name already exists in this branch");
    }

    const newTable: Table = {
      id,
      branchId,
      name: input.name,
      size: input.size,
      maxSize: input.maxSize,
      location: input.location,
      status: input.status || "free",
      description: input.description,
      tags: input.tags,
      turntableCycle: turntableCycle || 150, // 默认翻台周期 150 分钟
      createdAt: now,
      updatedAt: now,
      createdBy: accountId,
      type: tableCollection,
    };
    await CouchbaseDB.upsert(tableScop, tableCollection, key, newTable);
    return newTable;
  };

  const validStatusChanges: Record<string, string[]> = {
    free: ['reserved', 'booked', 'maintenance', 'unavailable'],
    reserved: ['booked', 'free', 'maintenance', 'unavailable'],
    booked: ['confirmed', 'occupied', 'free', 'cleaning', 'maintenance', 'unavailable'],
    confirmed: ['occupied', 'free', 'cleaning', 'maintenance', 'unavailable'],
    occupied: ['cleaning', 'free', 'maintenance', 'unavailable'],
    cleaning: ['free', 'maintenance', 'unavailable'],
    maintenance: ['free', 'unavailable'],
    unavailable: ['free']
  };

  export const updateTable = async(id: string, update: TableUpdateInput, accountId: string): Promise<Table | null> =>{
    console.log('Update Table called with id:', id, 'update:', update, 'accountId:', accountId);
    const key = `${tableCollection}::${id}`;
    console.log('Generated key for update:', key);
    const doc = await CouchbaseDB.get(tableScop, tableCollection, key);
    logger.info(`Fetched document for update: ${JSON.stringify(doc)}`);
    if (!doc) throw AppError.notFound('Table not found');
    const data: Table = doc.content;

    console.log('Current Table Data:', data);
    // 如果更新状态，检查新状态是否合法
    if (update.status && !['free', 'reserved', 'booked', 'confirmed', 'occupied', 'cleaning', 'maintenance', 'unavailable'].includes(update.status)) {
      throw AppError.paramsError("Invalid table status");
    }
    // 检查状态变更是否合法
    if (update.status && data.status !== update.status) {
      const allowedStatuses = validStatusChanges[data.status] || [];
      if (!allowedStatuses.includes(update.status)) {
        throw AppError.paramsError(`Invalid status transition from ${data.status} to ${update.status}`);
      }
    }

    // turntableCycle 至少 60 分钟
    if (update.turntableCycle !== undefined && update.turntableCycle < 60) {
      throw AppError.paramsError(`Invalid turntableCycle, must be positive, at least ${defaultTurntableCycle} minutes`);
    }

    // 检查 size 是否有效
    if (update.size !== undefined && update.size < 1) {
      throw AppError.paramsError("Table size must be at least 1");
    }
    // 检查 maxSize 是否有效
    if (update.maxSize !== undefined && update.size !== undefined && update.maxSize <= update.size) {
      throw AppError.paramsError("Table maxSize must be greater than size");
    }

    const updated: Table = {
      id: data.id,
      branchId: data.branchId,
      name: update.name ?? data.name,
      size: update.size ?? data.size,
      maxSize: update.maxSize ?? data.maxSize,
      location: update.location ?? data.location,
      status: update.status ?? data.status,
      description: update.description ?? data.description,
      tags: update.tags ?? data.tags,
      turntableCycle: update.turntableCycle ?? data.turntableCycle,
      createdAt: data.createdAt,
      updatedAt: Date.now(),
      type: data.type,
      createdBy: data.createdBy,
      updatedBy: accountId,
    };
    if (update.status === 'occupied') {
      updated.lastOccupiedAt = Date.now();
    }
    if (update.status === 'cleaning') {
      updated.lastCleanedAt = Date.now();
    }
    logger.info(`Updating table ${id} with data: ${JSON.stringify(updated)}`);
    const a = await CouchbaseDB.upsert(tableScop, tableCollection, key, updated);
    logger.info(`Update result: ${JSON.stringify(a), null, 2}`);
    return updated;
  };

  export const deleteTable = async (id: string, accountId: string): Promise<boolean> => {
    const key = `${tableCollection}::${id}`;
    // Check existence
    const doc = await CouchbaseDB.get(tableScop, tableCollection, key);
    if (!doc) throw AppError.notFound('Table not found');
    // todo: if has booking, prevent deletion (omitted for brevity)
    
    try {
        await CouchbaseDB.upsert(tableScop, tableCollection, key, { ...doc.content, status: 'unavailable', updatedAt: Date.now(), updatedBy:  accountId});
    //   await CouchbaseDB.remove(tableScop, tableCollection, key);
      return true;
    } catch {
      return false;
    }
  };

  export const getTableById = async (id: string) => {
    const key = `${tableCollection}::${id}`;
    const doc = await CouchbaseDB.get(tableScop, tableCollection, key);
    if (!doc) throw AppError.notFound('Table not found');
    // Adjust extraction as per actual CouchbaseDB.get return shape
    return doc?.content;
  };

  export const findTables = async(
    filter: TableFilter = {},
    page = 1,
    pageSize = 20,
    closeLike = false
  ): Promise<TableListResult> => {
    console.log('=======findTables called with filter:', filter, 'page:', page, 'pageSize:', pageSize, 'closeLike:', closeLike);
    const where: string[] = [];
    const { branchId } = filter;
    const params: Record<string, any> = {};

    if (branchId) {
      where.push("branchId = $branchId");
      params.branchId = branchId;
    }
    if (filter.name) {
      if (closeLike) {
        where.push("name = $name");
        params.name = filter.name;
      } else {
        where.push("name LIKE $name");
        params.name = `%${filter.name}%`;
      }
    }
    if (filter.location) {
      where.push("location = $location");
      params.location = filter.location;
    }
    if (filter.status) {
      where.push("status = $status");
      params.status = filter.status;
    }
    if (filter.sizeMin !== undefined) {
      where.push("size >= $sizeMin");
      params.sizeMin = filter.sizeMin;
    }
    if (filter.sizeMax !== undefined) {
      where.push("(size <= $sizeMax OR maxSize <= $sizeMax)");
      params.sizeMax = filter.sizeMax;
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (page - 1) * pageSize;

    console.log('Final whereClause:', whereClause, 'with params:', params);
    // 查询总数
    const countSql = `SELECT COUNT(*) AS total FROM ${tableCollectionFullName} ${whereClause}`;
    const countResult = await CouchbaseDB.query(countSql, { parameters: params });
    const total = countResult.rows[0]?.total ?? 0;

    // 查询分页数据
    const sql = `
      SELECT META().id, *
      FROM ${tableCollectionFullName}
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT $pageSize OFFSET $offset
    `;
    const result = await CouchbaseDB.query(sql, {
      parameters: { ...params, pageSize, offset }
    });

    const items: Table[] = result.rows.map((row: any) => row[tableCollection] || row);

    return {
      total,
      items,
      page,
      pageSize,
    };


  };

/**
 * 查询可用餐桌
 * @param branchId 分店ID
 * @param filter TableBookingFilterInput
 * @param page 分页
 * @param pageSize 分页
 * @returns TablePage
 */
export const availableTables = async (
  branchId: string,
  filter: TableBookingFilter,
  page = 1,
  pageSize = 20
): Promise<TableListResult> => {
  if (!branchId) throw AppError.paramsError("branchId is required");
  
  const bookingCollection = COLLECTIONS.BOOKING;
  const bookingCollectionFullName = CouchbaseDB.getCollectionFullName(tableScop, bookingCollection);
  const defaultTurntableCycle = 150; // 默认翻台周期，单位分钟
  
  // 1. 计算目标时间段
  const startTime = filter.startTime; // 预订时间（毫秒）
  if (!startTime) throw AppError.paramsError("startTime is required");

  // 22:00 当天时间戳
  const date = new Date(startTime);
  date.setHours(WORK_TIMES.CLOSE_HOUR, 0, 0, 0);
  const endOfDay = date.getTime();

  // 2. 查询所有符合条件的桌子（排除 maintenance/unavailable）
  const unavailableStatuses = ['maintenance', 'unavailable'];
  const tableWhere: string[] = [
    "branchId = $branchId",
    `status NOT IN ${unavailableStatuses}`
  ];
  const tableParams: Record<string, any> = { branchId };

  if (filter?.minSize !== undefined) {
    tableWhere.push("size >= $sizeMin");
    tableParams.sizeMin = filter.minSize;
  }
  if (filter.maxSize !== undefined) {
    tableWhere.push("(size <= $sizeMax OR maxSize <= $sizeMax)");
    tableParams.sizeMax = filter.maxSize;
  }
  if (filter.location) {
    tableWhere.push("location = $location");
    tableParams.location = filter.location;
  }
  console.log('Filter name:', filter.name);
  if (filter.name) {
    tableWhere.push("name LIKE $name");
    tableParams.name = `%${filter.name}%`;
  }

  const tableWhereClause = tableWhere.length ? `WHERE ${tableWhere.join(" AND ")}` : "";
  const tableSql = `
    SELECT META().id, *
    FROM ${tableCollectionFullName}
    ${tableWhereClause}
  `;
  console.log('tableWhereClause:', tableWhereClause);
  console.log('tableSql:', tableSql);
  const tableResult = await CouchbaseDB.query(tableSql, { parameters: tableParams });
  console.log("Table SQL Params=========>>>>>:", tableParams);

  // 过滤掉 maintenance/unavailable 状态的桌子
  const allTables: Table[] = tableResult.rows.map((row: any) => {
    if (!unavailableStatuses.includes(row.status)){
      return {...row};
    }
  });

  if (allTables.length === 0) {
    return { total: 0, items: [], page, pageSize };
  }

  // 3. 查询该时间段内有 confirmed booking 的桌子
  // 记录每个桌子的翻桌周期
  const tableIdToCycle: Record<string, number> = {};
  allTables.forEach(t => {
    tableIdToCycle[t.id] = t.turntableCycle || defaultTurntableCycle;
  });

  // 计算每个桌子的可用结束时间
  // 只查 startTime ~ (endOfDay - turntableCycle)
  const availableTableIds = allTables
    .filter(t => startTime <= endOfDay - (t.turntableCycle || defaultTurntableCycle) * 60 * 1000)
    .map(t => t.id);

  if (availableTableIds.length === 0) {
    return { total: 0, items: [], page, pageSize };
  }

  // 查询这些桌子在该时间段内的 confirmed booking
  const bookingWhere = `
    tableId IN $tableIds
    AND status = 'confirmed'
    AND bookingTime >= $bookingTime
    AND bookingTime < $endOfDay
    AND tableId IS NOT MISSING
    AND isDeleted != true
  `;
  const bookingParams = {
    tableIds: availableTableIds,
    startTime,
    endOfDay
  };
  const bookingSql = `
    SELECT tableId, bookingTime
    FROM ${bookingCollectionFullName}
    WHERE ${bookingWhere}
  `;
  const bookingResult = await CouchbaseDB.query(bookingSql, { parameters: bookingParams });
  const bookedTableIds = new Set<string>();
  for (const row of bookingResult.rows) {
    const tId = row.tableId;
    const tCycle = tableIdToCycle[tId] || defaultTurntableCycle;
    // booking 结束时间
    const bookingEnd = row.bookingTime + tCycle * 60 * 1000;
    // 如果 bookingTime <= 目标 bookingTime < bookingEnd，则占用
    if (startTime >= row.bookingTime && startTime < bookingEnd) {
      bookedTableIds.add(tId);
    }
  }

  // 4. 过滤掉已被占用的桌子
  let availableTables = allTables.filter(t => !bookedTableIds.has(t.id));
  // 过滤掉 maintenance/unavailable 状态的桌子
  availableTables = availableTables.filter((it) => {
    if (!['maintenance', 'unavailable'].includes(it.status)){
      return it;
    }
  });

  // 5. 按 size 与 filter.size 的差值升序排序（更接近需求的排前面）
  if (filter.size !== undefined) {
    // 先按与目标 size 的差值排序
    availableTables = availableTables.sort(
      (a, b) => Math.abs((a.size ?? 0) - filter.size) - Math.abs((b.size ?? 0) - filter.size)
    );
    // 再按实际 size 排序，确保更小的桌子排前面
    availableTables = availableTables.sort(
      (a, b) => a.size - b.size
    );
  }

  // 6. 分页
  const total = availableTables.length;
  const items = availableTables.slice((page - 1) * pageSize, page * pageSize);

  return {
    total,
    items,
    page,
    pageSize
  };
};


