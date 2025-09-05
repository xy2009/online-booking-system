import { omit } from 'lodash';

import { Booking, BookingInput, BookingUpdateInput, BookingFilter, BookingListResult, BookingMaintenance, BookingStatus, BookingAction } from '../types/booking';
import { CouchbaseDB } from '../../database/couchbaseUtils';
import { COLLECTIONS, SCOPES, WORK_TIMES } from '../../common/constants/consts';
import AppError from '../../common/errors';
import { generateUUID } from '../../common/utils/util';
import { logger } from '../../common/utils/logger';
import { getTableById, isAvailableTable } from './table';
import { IAccountResponse } from '../../entities/accountEntity';
import { isSystemStaff } from '../middleware/permissionMiddleware';
import { TableStatus } from '../types/table';


const busniessScope = SCOPES.BUSINESS;
const bookingCollection = COLLECTIONS.BOOKING;
const bookingCollectionFullName = CouchbaseDB.getCollectionFullName(
  busniessScope,
  bookingCollection
);

const workOpenHour = WORK_TIMES.OPEN_HOUR;
const workCloseHour = WORK_TIMES.CLOSE_HOUR;



const validBookingTransitions: Record<BookingStatus, BookingStatus[]> = {
  // 更新记录时，允许的状态变更；也可以只修改其它字段，但状态不变
  pending: ['pending', 'confirmed', 'cancelled'],
  confirmed: ['confirmed', 'completed', 'cancelled', 'no_show'],
  completed: ['completed'],
  cancelled: ['cancelled'],
  no_show: ['no_show']
};

const statusToActionMap: Record<BookingStatus, BookingAction> = {
  pending: 'create',
  confirmed: 'confirm',
  completed: 'complete',
  cancelled: 'cancel',
  no_show: 'no_show'
};

const bookStatusToTableStatusMap: Record<BookingStatus, TableStatus> = {
  pending: 'reserved',
  confirmed: 'booked',
  completed: 'free',
  cancelled: 'free',
  no_show: 'free'
};


const isValidBookingTime = (bookingTime: number, turntableCycle: number): boolean => {
    const now = Date.now();
    // 预订时间必须在当前时间之后，且不超过1年
    if (!(bookingTime > now && bookingTime < now + 365 * 24 * 60 * 60 * 1000)) {
      return false;
    }
    // 预订时间必须在营业时间内，假设营业时间为每天10:00-22:00
    const bookingDate = new Date(bookingTime);
    const hours = bookingDate.getHours();
    if (hours < workOpenHour || hours >= workCloseHour) {
      return false;
    }
    // 预订时间必须考虑翻台周期，假设翻台周期为120分钟
    const endTime = bookingTime + turntableCycle * 60 * 1000;
    const endDate = new Date(endTime);
    const endHours = endDate.getHours();
    console.log('Booking time:', bookingTime, 'End time:', endTime, 'End hours:', endHours, 'Turntable cycle:', turntableCycle);
    console.log('Booking date:', bookingDate, 'End date:', endDate);
    console.log('Is valid booking time check:', endHours);
    let valid = true;

    // todo: 此处时间需要读取 branch 的营业时间
    // 如果结束时间在营业时间之外，则不允许预订
    if (endHours < workOpenHour || endHours >= workCloseHour) {
      valid = false;
    } 
    if (turntableCycle > 120) {
      // 如果翻台周期超过120分钟，将结束时间在前推120分钟，确保不会影响到下一个预订时间
      const adjustedEndTime = endTime - 120 * 60 * 1000;
      const adjustedEndDate = new Date(adjustedEndTime);
      const adjustedEndHours = adjustedEndDate.getHours();
      if (adjustedEndHours > WORK_TIMES.CLOSE_HOUR) {
        if (adjustedEndHours > WORK_TIMES.CLOSE_HOUR) {
          valid = false;
        } else {
          // 如果调整后时间在营业时间内，仍然有效
          valid = true;
        }
      }
    }
    return valid;
  }

/**
 *  检查指定桌子在指定时间是否可预订
 * @param tableId 
 * @param bookingTime 
 * @param turntableCycle 
 * @returns 
 */
const canBookingByTableAndTime = async(tableId: string, bookingTime: number, turntableCycle: number, bookingId?: string): Promise<Boolean> => {
    // 查询同一时间段内是否已有预订
    const bookings = await CouchbaseDB.query(
      `SELECT META().id, * FROM ${bookingCollectionFullName}
       WHERE tableId = $tableId AND bookingTime BETWEEN $startTime AND $endTime`,
      {
        parameters: {
          tableId,
          startTime: bookingTime - turntableCycle * 60 * 1000,
          endTime: bookingTime + turntableCycle * 60 * 1000
        }
      }
    );

    if (bookingId) {
      // 如果是更新预订，忽略自身
      bookings.rows = bookings.rows.filter((b: any) => b?.booking?.id !== bookingId);
    }
    
  return !(bookings.rows.length > 0);
}

export const createBooking = async(input: BookingInput, userId: string): Promise<Booking> => {
  // logger.debug(`Creating booking with input: ${input}, for user:, ${userId}`);
    const { tableId, numberOfPeople, status, bookingType, bookingTime } = input;
    if (numberOfPeople <= 0 || !userId || !bookingTime) {
      throw AppError.paramsError('Missing required booking fields');
    }

    // status 校验, 只能是 'pending', 'confirmed', 'completed'
    if (status && !['pending', 'confirmed', 'completed'].includes(status)) {
      throw AppError.paramsError('Invalid booking status');
    }

    let defTurntableCycle = 150;
    let tableDoc = null;
    if (tableId) {
      const isTableAvailable = await isAvailableTable(tableId);
      if (!isTableAvailable) {
        throw AppError.paramsError('Table is not available for booking');
      }

      tableDoc = await getTableById(tableId);
      if (!tableDoc) throw AppError.tableNotAvailable('the table is not vailable');
      defTurntableCycle = tableDoc.turntableCycle || 120;
      // 检查同一时间段内，是否已有预订
      const bookingByTableAndTimeIsVailable = await canBookingByTableAndTime(tableId, bookingTime, tableDoc.turntableCycle);
      if (!bookingByTableAndTimeIsVailable) {
        throw AppError.timeNotAvailable('Table is not available to create the booking to the selected time');
      }
      // 检查桌子容量是否足够
      if (tableDoc.size < numberOfPeople || (tableDoc.maxSize && tableDoc.maxSize < numberOfPeople)) {
        throw AppError.paramsError('Table size is not enough for the number of people');  
      }
    }
    
    // 检查预订时间是否合法
    if (!isValidBookingTime(bookingTime, defTurntableCycle)) {
      console.log('Invalid booking time:', bookingTime, 'Turntable cycle:', defTurntableCycle);
      throw AppError.timeNotAvailable('Invalid booking time');
    };
    

    const now = Date.now();
    const id = generateUUID();
    const key = `${bookingCollection}::${id}`;
    const _status = status || 'pending';
    
    const newBooking: Booking = {
      id,
      userId,
      bookingTime,
      numberOfPeople,
      status: _status,
      specialRequests: input.specialRequests,
      createdAt: now,
      updatedAt: now,
      type: bookingCollection,
      bookingType: bookingType || 'online',
      isDeleted: false,
      maintenanceLogs: [
        {
          id: generateUUID(),
          action: `create`,
          // 非管理功能，performedBy 统一为 userId
          performedBy: userId,
          performedAt: now,
          notes: `Booking was created with status: [${_status}]`
        }
      ]
    };
    if (tableId) {
      newBooking.tableId = tableId;
    }

    await CouchbaseDB.upsert(busniessScope, bookingCollection, key, newBooking);
    // 更新 table 状态
    if (tableDoc) {
      // 仅当状态为 confirmed，且预订时间在 从当前时间到翻台结束之前，才更新桌子状态
      if (tableDoc && _status === 'confirmed' && (bookingTime < now + tableDoc.turntableCycle * 60 * 1000)) {
        const tableKey = `${COLLECTIONS.TABLE}::${tableId}`;
        tableDoc.status = bookStatusToTableStatusMap[_status];
        await CouchbaseDB.upsert(busniessScope, COLLECTIONS.TABLE, tableKey, tableDoc);
      }
    }
    return (omit(newBooking, ['isDeleted', 'maintenanceLogs']) as Booking);
  };


  const canChangeBookgingStatus = async(bookingDoc: Booking, newStatus: BookingStatus, account: IAccountResponse) => {
    // 1. 检查权限
    const isSystem = isSystemStaff(account.role);
    if (!isSystem && ['confirmed', 'no_show'].includes(newStatus)) 
      throw AppError.forbidden('Operation not allowed');

    // 2. 检查状态变更是否合法
    if (!validBookingTransitions[bookingDoc.status].includes(newStatus)) {
      throw AppError.forbidden('Operation not allowed');
    }

    return true;
  }

export const updateBooking = async(id: string, update: BookingUpdateInput, account: IAccountResponse, ): Promise<Booking | null>  => {
    const key = `${bookingCollection}::${id}`;
    const res = await CouchbaseDB.get(busniessScope, bookingCollection, key);
    if (!res?.content) throw AppError.notFound('Booking not found');
    if (!account || !account.userId) throw AppError.forbidden('Operation not allowed1');
    const { userId } = account;
    const doc = res?.content;
    const now = Date.now();
    const { status, numberOfPeople } = update;
    // status 校验, 只能是 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
    if (status && !['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].includes(status)) {
      throw AppError.paramsError('Invalid booking status');
    }

    const isSystem = isSystemStaff(account.role);
    const { bookingTime } = update;
    const { tableId: oldTableId, numberOfPeople: oldNumberOfPeople, status: oldStatus} = doc;
    console.log('Old booking:', doc);
    // 如果是以下状态，除了 isDeleted，不能修改任何字段
    if (['completed', 'cancelled', 'no_show'].includes(oldStatus)) {
      console.log('Update booking in completed, cancelled, no_show status:', Object.keys(omit(update, ['isDeleted'])));
      // 只能修改 isDeleted 字段
      if (Object.keys(omit(update, ['isDeleted'])).length > 0) {
        throw AppError.forbidden('Cannot modify a booking that is already finalized');
      }
    }

    const _status = status || oldStatus;
  
    const tableId = update.tableId || oldTableId;

    // 只能用户本人或系统员工操作;
    // 如果已被删除，禁止客户恢复
    // 如果传入状态，客户只能操作 'pending', 'cancelled'
    if (!isSystem){ 
      if (doc.userId !== userId || (doc.isDeleted && update.isDeleted !== undefined)
        || (status && !['pending', 'cancelled'].includes(status))
      ) { 
        throw AppError.forbidden('Operation not allowed 2');
      } 
      // 只能 pending 状态的预订，允许用户修改预订时间、人数、桌子
      if (!['pending'].includes(oldStatus) && (numberOfPeople || bookingTime || tableId)) {
        throw AppError.forbidden('Only bookings with status "pending" can be modified by the user');
      }
    } else {
      // 系统员工，如果传入了 isDeleted，允许恢复已删除的预订
      if (doc.isDeleted && update.isDeleted === undefined) {
        throw AppError.paramsError('invalid operation on deleted booking');
      }
      // 如果原来没分配桌子，更新状态为 confirmed，则必须指定桌子
      if (!oldTableId && _status === 'confirmed' && !tableId) {
        throw AppError.paramsError('Table must be specified when confirming a booking without an assigned table');
      }
    }

    // 检查状态变更是否合法
    canChangeBookgingStatus(doc, status!, account);

    const tableDoc = await getTableById(tableId);

    // todo: 如果更新了桌子，需要检查新桌子是否可用，需要更多测试
    // 如果更新了人数，需要检查桌子是否可用
    if (numberOfPeople) {
      if (!(numberOfPeople > 0)) {
        throw AppError.paramsError('Invalid numberOfPeople');
      }
      // 检查桌子容量是否足够
      if (numberOfPeople !== oldNumberOfPeople && (tableDoc?.size < numberOfPeople
        || (tableDoc?.maxSize && tableDoc?.maxSize < numberOfPeople)
      )) {
        throw AppError.paramsError('Table size is not enough for the number of people');
      }
    }

    // 如果更新了时间，需要检查时间和桌子是否可用
    if (bookingTime && bookingTime !== doc.bookingTime) {
      if (!tableDoc) throw AppError.tableNotAvailable('the table is not vailable');
      const bookingByTableAndTimeIsVailable = await canBookingByTableAndTime(tableId, bookingTime, tableDoc.turntableCycle, id);
      
      if (!bookingByTableAndTimeIsVailable) {
        throw AppError.timeNotAvailable('Table is not available to update the booking to the selected time'); 
      }
    }
    // 如果isDeleted 没有传，且原来不是已删除状态，默认设置为 false, 避免 null 导致查询异常
    if (!doc.isDeleted && update.isDeleted === undefined) {
      update.isDeleted = false;
    }

    const updateData: Booking = {
      ...doc,
      ...update,
      updatedAt: now,
      maintenanceLogs: [
        {
          id: generateUUID(),
          action: status ? statusToActionMap[status] || 'update' : 'update',
          performedBy: userId,
          performedAt: now,
          notes: `Booking was updated to status: [${status}], deleted: [${update.isDeleted}]`
        },
        ...(doc?.maintenanceLogs || []),
      ]
    };
    // 只在当前预订 status变更时，才会影响table 状态，更新 table 状态
    if (status && status !== oldStatus && (bookingTime && (bookingTime <= now + tableDoc.turntableCycle * 60 * 1000))) {
      const tableKey = `${COLLECTIONS.TABLE}::${tableId}`;
      tableDoc.status = bookStatusToTableStatusMap[_status as BookingStatus];
      await CouchbaseDB.upsert(busniessScope, COLLECTIONS.TABLE, tableKey, tableDoc);
    }

    await CouchbaseDB.upsert(busniessScope, bookingCollection, key, updateData);
    
    return updateData;
  };

  export const getBookingById = async (id: string): Promise<Booking | null> => {
    const key = `${bookingCollection}::${id}`;
    const res = await CouchbaseDB.get(busniessScope, bookingCollection, key);
    if (!res?.content) {
      throw AppError.notFound('Booking not found');
    }
    return res.content;
  };

  export const listBookings = async(
    filter: BookingFilter = {},
    page = 1,
    pageSize = 20
  ): Promise<BookingListResult> => {
    console.log('Listing bookings with filter:', filter, 'page:', page, 'pageSize:', pageSize);
    const where: string[] = [];
    const params: Record<string, any> = {};

    if (filter.userId) {
      where.push('userId = $userId');
      params.userId = filter.userId;
    }
    if (filter.tableId) {
      where.push('tableId = $tableId');
      params.tableId = filter.tableId;
    }
    if (filter.status) {
      where.push('status = $status');
      params.status = filter.status;
    }
    if (filter.bookingTimeFrom !== undefined) {
      where.push('bookingTime >= $bookingTimeFrom');
      params.bookingTimeFrom = filter.bookingTimeFrom;
    }
    if (filter.bookingTimeTo !== undefined) {
      where.push('bookingTime <= $bookingTimeTo');
      params.bookingTimeTo = filter.bookingTimeTo;
    }

    console.log('Booking list query params:', params);

    // 软删除过滤
    if (filter?.isDeleted !== undefined) {
      where.push('isDeleted = $isDeleted');
      params.isDeleted = filter.isDeleted;
    } else {
      // 默认过滤已删除的记录
      where.push('(isDeleted = false or isDeleted IS MISSING)');
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const countSql = `SELECT COUNT(*) AS total FROM ${bookingCollectionFullName} ${whereClause}`;
    const countResult = await CouchbaseDB.query(countSql, { parameters: params });

    const total = countResult.rows[0]?.total ?? 0;

    const sql = `
      SELECT META().id, *
      FROM ${bookingCollectionFullName}
      ${whereClause}
      LIMIT $pageSize OFFSET $offset
    `;
    const result = await CouchbaseDB.query(sql, {
      parameters: { ...params, pageSize, offset }
    });

    const items: Booking[] = result.rows.map((row: any) => row[bookingCollection] || row);

    return {
      total,
      items,
      page,
      pageSize,
    };
  };

  export const deleteBooking = async (id: string): Promise<boolean> =>{
    const key = `${bookingCollection}::${id}`;
    try {
      await CouchbaseDB.remove(busniessScope, bookingCollection, key);
      return true;
    } catch {
      return false;
    }
  };