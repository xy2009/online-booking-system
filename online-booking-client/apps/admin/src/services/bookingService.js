import { query, mutation, GET_ALL_BOOKINGS, 
  GET_BOOKING_BY_ID, UPDATE_BOOKING, 
  UPDATE_BOOKING_STATUS } from '@booking/api-client';


export const findBookings = async (variables = {}) => {
    return await query(GET_ALL_BOOKINGS, variables);
};

export const getBookingById = async (bookingId) => {
  return await query(GET_BOOKING_BY_ID, { id: bookingId });  
};

export const updateBooking = async (bookingId, input) => {
  return await mutation(UPDATE_BOOKING, { id: bookingId, input });
};

export const updateBookingStatus = async (bookingId, status, tableId = '') => {
  const input = tableId ? { status, tableId } : { status };
  return await mutation(UPDATE_BOOKING_STATUS, { id: bookingId, input });
};


export const deleteBooking = async (bookingId) => {
  return await mutation(UPDATE_BOOKING, { id: bookingId, input: { isDeleted: true } });
};

