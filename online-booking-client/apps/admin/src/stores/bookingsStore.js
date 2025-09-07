import { createSignal } from 'solid-js';
import { findBookings, getBookingById, updateBooking, updateBookingStatus, deleteBooking } from '../services/bookingService';

const [bookings, setBookings] = createSignal([]);
const [selectedBooking, setSelectedBooking] = createSignal(null);
const [loading, setLoading] = createSignal(false);
const [error, setError] = createSignal(null);

// 查询列表
const fetchBookings = async (params = {}) => {
	setLoading(true);
	setError(null);
	try {
		const data = await findBookings(params);
        console.log('Fetched bookings:', data);
		setBookings(data?.bookings?.items || []);
	} catch (e) {
		setError(e.message || '查询失败');
	} finally {
		setLoading(false);
	}
};

// 查询单个
const fetchBookingById = async (id) => {
	setLoading(true);
	setError(null);
	try {
		const data = await getBookingById(id);
		setSelectedBooking(data?.booking || null);
	} catch (e) {
		setError(e.message || '查询失败');
	} finally {
		setLoading(false);
	}
};

// 更新booking
const updateSelectedBooking = async (updatedBooking) => {
    setLoading(true);
	setError(null);
    try {
        const data = await updateBooking(updatedBooking.id, updatedBooking);
        if (data?.booking) {
            setSelectedBooking(data.booking);
            // 同步更新列表中的数据
            setBookings(bookings().map(booking => 
                booking.id === data.booking.id ? data.booking : booking
            ));
        } else {
            setError('更新失败');
        }
    } catch (e) {
        setError(e.message || '更新失败');
    } finally {
        setLoading(false);
    }
};

// 更新状态
const updateBookingStatusInList = async (bookingId, status, tableId = '') => {
    setLoading(true);
	setError(null);
    try {
        const data = await updateBookingStatus(bookingId, status, tableId = '');
        console.log('Updated booking status:', data);

        if (data?.updateBooking?.id) {
            // 变更后重新拉取最新列表，确保所有状态和操作项正确
            await fetchBookings();
            // 打印新数据，便于排查响应式和后端问题
            // 如果当前选中的预订是被更新的那个，也同步更新状态
            if (selectedBooking() && selectedBooking().id === bookingId) {
                setSelectedBooking(prev => ({ ...prev, status: data.booking.status }));
            }
        } else {
            setError('更新状态失败');
        }
    } catch (e) {
        setError(e.message || '更新状态失败');
    } finally {
        setLoading(false);
    }
};

const deleteBookingFromList = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
        // 这里调用删除接口
        const data = await deleteBooking(bookingId);
        console.log('Deleted booking:', data);
        if (data?.updateBooking?.id) {
            // 删除后重新拉取最新列表
            await fetchBookings();
            // 如果当前选中的预订是被删除的那个，清空选中
            if (selectedBooking() && selectedBooking().id === bookingId) {
                setSelectedBooking(null);
            }
        } else {
            setError('删除失败');
        }
    } catch (e) {
        setError(e.message || '删除失败');
    } finally {
        setLoading(false);
    }
};



export const bookingsStore = {
	bookings,
	selectedBooking,
	loading,
	error,
	fetchBookings,
	fetchBookingById,
	setSelectedBooking,
    updateSelectedBooking,
    updateBookingStatusInList,
    deleteBookingFromList,
};


