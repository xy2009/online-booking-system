import { createSignal } from 'solid-js';
import { 
  API_ENDPOINTS, 
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS
} from '../constants';
import { graphQLFetchWrapper } from '../utils/requesWrapper';
import { branchStore } from './branchStore';

const getInitialStore = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.STORE_KEY);
  if (raw) {
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }
  return null;
};
const [selectedStore, setSelectedStore] = createSignal(getInitialStore());
const [selectedDate, setSelectedDate] = createSignal(null);
const [selectedTime, setSelectedTime] = createSignal(null);
const [partySize, setPartySize] = createSignal(2);

const [availableSlots, setAvailableSlots] = createSignal([]);

const [bookingHistory, setBookingHistory] = createSignal([]);
const [loading, setLoading] = createSignal(false);
const { branchMap } = branchStore;

// 重置预订状态
const resetBooking = () => {
  setSelectedStore(null);
  setSelectedDate(null);
  setSelectedTime(null);
  setPartySize(2);
  setAvailableSlots([]);
  // 重置时清理缓存
  localStorage.removeItem(STORAGE_KEYS.STORE_KEY);
};
  

// 获取可用时间段
const fetchAvailableSlots = async (storeId, date, size) => {
  setLoading(true);
  try {
    const response = await graphQLFetchWrapper(`
      query AvailableTables(
          $filter: TableBookingFilterInput
          $pagination: PaginationInput
      ) {
          availableTables(filter: $filter, pagination: $pagination) {
              total
              page
              pageSize
              items {
                  id
                  branchId
                  name
                  size
                  maxSize
                  status
                  location
                  description
                  tags
                  turntableCycle
              }
          }
      }`,{
      
      filter:{
        branchId: storeId,
        startTime: new Date(date).getTime(),
        size
      },
      pagination: {
        page: 1,
        pageSize: 1
      },
    });
    const { ok, success, message, data } = response;

    if (ok && success) {
      setAvailableSlots(data?.availableTables?.items);
      return { success: true, slots: data?.availableSlots?.itmes || [] };
    } else {
      return { success: false, error: message || ERROR_MESSAGES.QUERY_FAILED};
    }
  } catch (error) {
    console.error('Fetch slots error:', error);
    return { success: false, error: ERROR_MESSAGES.NETWORK_ERROR };
  } finally {
    setLoading(false);
  }
};

// 创建预订
const createBooking = async (bookingData) => {
  setLoading(true);
  try {
    const response = await graphQLFetchWrapper(
      `mutation CreateBooking($input: BookingInput!) {
          createBooking(input: $input) {
            id
            userId
            tableId
            bookingTime
            numberOfPeople
            status
            specialRequests
            createdAt
            updatedAt
            isDeleted
            bookingType
            connectName
            connectPhone
          }
        }`,
      {
        input: bookingData,
      });
    const { ok, success, message, data } = response;
    
    if (ok && success && data.createBooking) {
      // 重置预订状态并清理缓存
      resetBooking();

      return { success: true, booking: data.createBooking };
    } else {
      let errorMsg = message || ERROR_MESSAGES.BOOKING_FAILED;
      if (message.includes('selected time')) {
        errorMsg = message;
        console.error('Create booking failed:', message);
      }
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    console.error('Create booking error:', error);
    return { success: false, error: ERROR_MESSAGES.NETWORK_ERROR };
  } finally {
    setLoading(false);
  }
};

// 获取预订历史
const fetchBookingHistory = async (userId) => {
  setLoading(true);
  try {
    const response = await graphQLFetchWrapper(
      `query Bookings($filter: BookingFilter, $pagination: PaginationInput) {
        bookings(filter: $filter, pagination: $pagination) {
            items {
                id
                userId
                tableId
                branchId
                bookingTime
                numberOfPeople
                status
                specialRequests
                createdAt
                updatedAt
                bookingType
                connectName
                connectPhone
            }
            total
            page
            pageSize
        }
      }`,
      {
        input: {
          filter: {
            userId
          },
          pagination: {
            page: 1,
            pageSize: 50
          }
        },
      });
    const { ok, success, message, data } = response;
    
    if (ok && success && data.bookings) {
      const newBookings = data.bookings.items.map((booking) => {
        let branchName = booking.branchName || '未知门店';
        let customerPhone = '--';
        if (branchMap()[booking.branchId]) {
          const { name, contactNumber } = branchMap()[booking.branchId];
          branchName = name;
          customerPhone = contactNumber;
        } 
        return {...booking, branchName, customerPhone };
      });
      setBookingHistory(newBookings);
      return { success: true, bookings: newBookings };
    } else {
      return { success: false, error: message || ERROR_MESSAGES.QUERY_FAILED };
    }
  } catch (error) {
    console.error('Fetch booking history error:', error);
    return { success: false, error: ERROR_MESSAGES.NETWORK_ERROR };
  } finally {
    setLoading(false);
  }
};

// 取消预订
const cancelBooking = async (bookingId, authHeaders) => {
  setLoading(true);
  try {

    const res = await graphQLFetchWrapper(
      `mutation UpdateBooking($id: ID!, $input: BookingUpdateInput!) {
    updateBooking(id: $id, input: $input) {
        id
        status
    }
    }`, {
        id: bookingId,
        input: {
          status: 'cancelled'
        }
    });

    const { ok, success, message, data } = res;
    
    if (ok && success && data.updateBooking) {
      // 更新本地预订历史
      setBookingHistory(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      return { success: true };
    } else {
      return { success: false, error: message || ERROR_MESSAGES.CANCEL_FAILED };
    }
  } catch (error) {
    console.error('Cancel booking error:', error);
    return { success: false, error: ERROR_MESSAGES.NETWORK_ERROR };
  } finally {
    setLoading(false);
  }
};

  // 状态
// 持久化选中门店, 避免刷新booking页面时选中门店丢失
const persistSelectedStore = (store) => {
  if (store) {
    localStorage.setItem(STORAGE_KEYS.STORE_KEY, encodeURIComponent(JSON.stringify(store)));
  } else {
    localStorage.removeItem(STORAGE_KEYS.STORE_KEY);
  }
  setSelectedStore(store);
};

export const bookingStore = {
  selectedStore,
  setSelectedStore: persistSelectedStore,
  selectedTime,
  partySize,
  availableSlots,
  bookingHistory,
  loading,
  
  // 设置方法
  // setSelectedStore,
  setSelectedDate,
  setSelectedTime,
  setPartySize,
  
  // 业务方法
  resetBooking,
  fetchAvailableSlots,
  createBooking,
  fetchBookingHistory,
  cancelBooking,
};
