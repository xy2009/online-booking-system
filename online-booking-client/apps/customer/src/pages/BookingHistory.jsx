import { createSignal, createEffect, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Toaster, toast } from 'solid-toast';

import { Button } from '@booking/shared-ui';
import { formatDate, formatDateTime } from '@booking/shared-utils';
import { authStore } from '../stores/authStore';
import { bookingStore } from '../stores/bookingStore';
import { 
  ROUTES, 
  BOOKING_STATUS, 
  BOOKING_STATUS_TEXT,
  SUCCESS_MESSAGES,
  TIME_CONSTANTS
} from '../constants';
import styles from './BookingHistory.module.css';

function BookingHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = createSignal('all');

  onMount(async () => { 
    toast.dismiss();
    // 获取预订历史
    await bookingStore.fetchBookingHistory(authStore.user()?.userId);
  });

  // 检查认证状态
  createEffect(() => {
    if (!authStore.isAuthenticated()) {
      navigate(ROUTES.LOGIN);
      return;
    }
    bookingStore.bookingHistory();
  });

  const handleCancelBooking = async (bookingId) => {
    if (confirm('确定要取消这个预订吗？')) {
      const result = await bookingStore.cancelBooking(
        bookingId,
        authStore.getAuthHeaders()
      );
      
      if (result.success) {
        toast.success(SUCCESS_MESSAGES.CANCEL_SUCCESS);
      } else {
        toast.error(result.error || '取消失败', { duration: 1500 } );
      }
    }
  };

  const getStatusText = (status) => {
    return BOOKING_STATUS_TEXT[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      [BOOKING_STATUS.PENDING]: styles.statusPending,
      [BOOKING_STATUS.CONFIRMED]: styles.statusConfirmed,
      [BOOKING_STATUS.CANCELLED]: styles.statusCancelled,
      [BOOKING_STATUS.COMPLETED]: styles.statusCompleted,
      [BOOKING_STATUS.NO_SHOW]: styles.statusNoShow
    };
    return classMap[status] || '';
  };

  const filteredBookings = () => {
    const bookings = bookingStore.bookingHistory();
    if (filter() === 'all') {
      return bookings;
    }
    return bookings.filter(booking => booking.status === filter());
  };

  const canCancelBooking = (booking) => {
    if (booking.status === BOOKING_STATUS.CANCELLED || booking.status === BOOKING_STATUS.COMPLETED) {
      return false;
    }
    
    // 检查是否在预订时间前至少指定小时数
    const bookingDateTime = booking.bookingTime;
    const now = Date.now();
    const canNotCancelTimeDiff = TIME_CONSTANTS.CANCEL_DEADLINE_HOURS * 60 * 60 * 1000; // 转换为毫秒
    const can = bookingDateTime - now > canNotCancelTimeDiff;
    return can;
  
  };

  const bookings = filteredBookings;
  const loading = bookingStore.loading;

  return (
    <div class={styles.container}>
      <Toaster />
      <div class={styles.header}>
        <button class={styles.backButton} onClick={() => navigate('/')}>
          ← 返回
        </button>
        <h1>我的预订</h1>
      </div>

      <div class={styles.content}>
        {/* 筛选器 */}
        <div class={styles.filters}>
          <button
            class={`${styles.filterButton} ${filter() === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            class={`${styles.filterButton} ${filter() === 'pending' ? styles.active : ''}`}
            onClick={() => setFilter('pending')}
          >
            待确认
          </button>
          <button
            class={`${styles.filterButton} ${filter() === 'confirmed' ? styles.active : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            已确认
          </button>
          <button
            class={`${styles.filterButton} ${filter() === 'completed' ? styles.active : ''}`}
            onClick={() => setFilter('completed')}
          >
            已完成
          </button>
        </div>

        {/* 预订列表 */}
        {loading() && (
          <div class={styles.loading}>
            <div class={styles.spinner}></div>
            <p>加载中...</p>
          </div>
        )}

        {!loading() && bookings().length === 0 && (
          <div class={styles.empty}>
            <div class={styles.emptyIcon}>📅</div>
            <h3>{`暂无${filter() !== 'all' ? '相关' : ''}预订记录`}</h3>
            <p>{`您还没有任何${filter() !== 'all' ? getStatusText(filter()) : ''}预订记录`}</p>
            <Button onClick={() => navigate('/')}>
              去预订
            </Button>
          </div>
        )}

        {!loading() && bookings().length > 0 && (
          <div class={styles.bookingList}>
            {bookings().map((booking) => (
              <div class={styles.bookingCard} key={booking.id}>
                <div class={styles.bookingHeader}>
                  {/*  */}
                  <h3 class={styles.storeName}>{booking.branchName}</h3>
                  <span class={`${styles.status} ${getStatusClass(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>

                <div class={styles.bookingDetails}>
                  <div class={styles.detailRow}>
                    <span class={styles.label}>预订时间：</span>
                    <span class={styles.value + ' ' + styles.bookingTimeValue}>
                      {formatDateTime(booking.bookingTime)}
                    </span>
                  </div>
                  
                   <div class={styles.detailRow}>
                    <span class={styles.label}>用餐人数：</span>
                    <span class={styles.value}>{booking.numberOfPeople}人</span>
                  </div>
                  
                 <div class={styles.detailRow}>
                    <span class={styles.label}>联系人：</span>
                    <span class={styles.value}>{booking.connectName}</span>
                  </div>
                  
                   <div class={styles.detailRow}>
                    <span class={styles.label}>手机号：</span>
                    <span class={styles.value}>{booking.connectPhone}</span>
                  </div>

                  <div class={styles.detailRow}>
                    <span class={styles.label}>订单编号：</span>
                    <span class={styles.value}>
                      {booking.id}
                    </span>
                  </div>
                  
                  <div class={styles.detailRow}>
                    <span class={styles.label}>创建时间：</span>
                    <span class={styles.value}>
                      {formatDateTime(booking.createdAt)}
                    </span>
                  </div>
                </div>

                <div class={styles.bookingActions}>
                  <a 
                    href={`tel:${booking.customerPhone}`} 
                    class={styles.phoneButton}
                  >
                    📞 联系餐厅
                  </a>
                  
                  {canCancelBooking(booking) && (
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      取消预订
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingHistory;
