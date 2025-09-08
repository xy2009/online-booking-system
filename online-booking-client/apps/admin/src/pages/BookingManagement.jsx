import { createSignal, createEffect, onMount, For } from 'solid-js';
import { Toaster, toast } from 'solid-toast';

import { useNavigate } from '@solidjs/router';
import { formatDate, formatTime } from '@booking/shared-utils';
import { authStore } from '../stores/authStore';
import { branchStore } from '../stores/branchStore';
import { tableStore } from '../stores/tableStore';
import { ADMIN_CONSTANTS, BOOKING_STATUS_TO_ACTIONS,  } from '../constants';
import styles from './BookingManagement.module.css';

import { bookingsStore } from '../stores/bookingsStore';

export default function BookingManagement() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = createSignal('ALL');
  const [searchTerm, setSearchTerm] = createSignal('');

  onMount(async () => {
    // Check authentication
    if (!authStore.isAuthenticated()) {
      navigate('/login');
      return;
    }
    toast.dismiss();

    // to get branch data,for format branch name
    await branchStore.fetchBranches();
    // to get table data,for format table name
    await tableStore.fetchTables();
    // fetch bookings
    await bookingsStore.fetchBookings();
  

});

  const filteredBookings = () => {
    let filtered = bookings();
    
    if (selectedStatus() !== 'ALL') {
      filtered = filtered.filter(booking => booking.status === selectedStatus());
    }
    
    if (searchTerm()) {
      const term = searchTerm().toLowerCase();
      filtered = filtered.filter(booking => 
        booking?.connectName?.toLowerCase().includes(term) ||
        booking?.connectPhone?.includes(term) ||
        booking.id.toLowerCase().includes(term)
      );
    }
    return filtered;
  };

  const getStatusColor = (status) => {
    const colors = {
      [ADMIN_CONSTANTS.BOOKING_STATUS.PENDING]: '#f59e0b',
      [ADMIN_CONSTANTS.BOOKING_STATUS.CONFIRMED]: '#10b981',
      [ADMIN_CONSTANTS.BOOKING_STATUS.CANCELLED]: '#ef4444',
      [ADMIN_CONSTANTS.BOOKING_STATUS.COMPLETED]: '#6366f1'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      [ADMIN_CONSTANTS.BOOKING_STATUS.PENDING]: '待确认',
      [ADMIN_CONSTANTS.BOOKING_STATUS.CONFIRMED]: '已确认',
      [ADMIN_CONSTANTS.BOOKING_STATUS.CANCELLED]: '已取消',
      [ADMIN_CONSTANTS.BOOKING_STATUS.COMPLETED]: '已完成'
    };
    return texts[status] || status;
  };

  const handleStatusChange = async(bookingId, newStatus) => {
    await bookingsStore.updateBookingStatusInList(bookingId, newStatus);
    if (bookingsStore.error()) {
      toast.error(bookingsStore.error());
    } else {
      toast.success('状态更新成功');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (confirm('确定要删除这个预订吗？')) {
      await bookingsStore.deleteBookingFromList(bookingId); 
      if (bookingsStore.error()) {
        toast.error(bookingsStore.error());
      } else {
        toast.success('删除成功');
      }
    }
  };

  const bookings = bookingsStore.bookings;
  const loading = bookingsStore.loading;

  return (
    <div class={styles.bookingManagement}>
      <Toaster />
      <header class={styles.header}>
        <div class={styles.headerContent}>
          <div class={styles.titleSection}>
            <button class={styles.backBtn} onClick={() => navigate('/')}>
              ← 返回
            </button>
            <h1>预订管理</h1>
          </div>
        </div>
      </header>

      <main class={styles.main}>
        <div class={styles.controls}>
          <div class={styles.searchBox}>
            <input
              type="text"
              placeholder="搜索客户姓名、电话或预订号..."
              value={searchTerm()}
              onInput={(e) => setSearchTerm(e.target.value)}
              class={styles.searchInput}
            />
          </div>
          
          <div class={styles.filterBox}>
            <select
              value={selectedStatus()}
              onChange={(e) => setSelectedStatus(e.target.value)}
              class={styles.statusFilter}
            >
              <option value="ALL">全部状态</option>
              <option value={ADMIN_CONSTANTS.BOOKING_STATUS.PENDING}>待确认</option>
              <option value={ADMIN_CONSTANTS.BOOKING_STATUS.CONFIRMED}>已确认</option>
              <option value={ADMIN_CONSTANTS.BOOKING_STATUS.CANCELLED}>已取消</option>
              <option value={ADMIN_CONSTANTS.BOOKING_STATUS.COMPLETED}>已完成</option>
            </select>
          </div>
        </div>

        <div class={styles.bookingList}>
          {loading() ? (
            <div class={styles.loading}>加载中...</div>
          ) : (
            <For each={filteredBookings()}>
              {(booking) => (
                <div class={styles.bookingCard}>
                  <div class={styles.bookingHeader}>
                    <div class={styles.bookingId}>订单编号：{booking.id}</div>
                    <div 
                      class={styles.statusBadge}
                      style={{ background: getStatusColor(booking.status) }}
                    >
                      {getStatusText(booking.status)}
                    </div>
                  </div>
                  
                  <div class={styles.bookingInfo}>
                    <div class={styles.customerInfo}>
                      <h3>联系人：{booking.connectName}</h3>
                      <p>联系电话：{booking.connectPhone}</p>
                    </div>
                    
                    <div class={styles.bookingDetails}>
                      <div class={styles.detailItem}>
                        <span class={styles.label}>分店:</span>
                        <span>{branchStore.branchesMap()?.[booking.branchId]?.name || '未知门店'}</span>
                      </div>
                      <div class={styles.detailItem}>
                        <span class={styles.label}>桌号:</span>
                        <span>{tableStore.tablesMap()?.[booking.tableId]?.name || '--'}</span>
                      </div>
                      <div class={styles.detailItem}>
                        <span class={styles.label}>日期:</span>
                        <span>{formatDate(booking.bookingTime)}</span>
                      </div>
                      <div class={styles.detailItem}>
                        <span class={styles.label}>时间:</span>
                        <span>{formatTime(booking.bookingTime)}</span>
                      </div>
                      <div class={styles.detailItem}>
                        <span class={styles.label}>人数:</span>
                        <span>{booking.numberOfPeople}人</span>
                      </div>
                    </div>
                    
                    <div class={styles.notes}>
                      <span class={styles.label}>备注:</span>
                      <span>{booking.specialRequests}</span>
                    </div>
                    
                  </div>

                  <div class={styles.bookingActions}>
                    {BOOKING_STATUS_TO_ACTIONS[booking.status]?.map(action => (
                      <button
                        class={`${styles.actionBtn} ${
                          action === 'confirmed' ? styles.confirmBtn :
                          action === 'cancelled' ? styles.cancelBtn :
                          action === 'no_show' ? styles.noShowBtn :
                          action === 'completed' ? styles.completeBtn : ''
                        }`}
                        onClick={() => {
                          let confirmText = '';
                          if (action === 'cancelled') confirmText = '确定要取消该预订吗？';
                          // else if (action === 'confirmed') confirmText = '确定要确认该预订吗？';
                          // else if (action === 'completed') confirmText = '确定要将该预订标记为完成吗？';
                          else if (action === 'no_show') confirmText = '确定要标记为未到店吗？';
                          else confirmText = '确定要执行该操作吗？';
                          if (window.confirm(confirmText)) {
                            handleStatusChange(booking.id, ADMIN_CONSTANTS.BOOKING_STATUS[action.toUpperCase()] || action);
                          }
                        }}
                      >
                        {action === 'confirmed' ? '确认' :
                        action === 'cancelled' ? '取消' :
                        action === 'completed' ? '完成' :
                        action === 'no_show' ? '未到店' : action}
                      </button>
                    ))}
                    {
                      // 只有admin角色可以删除预订
                      authStore.hasPermission('deleteOrtherBooking') && (
                        <button
                          class={styles.deleteBtn}
                          onClick={() => {
                            handleDeleteBooking(booking.id);
                          }}
                        >
                          删除
                        </button>
                      )
                    }
                  </div>
                </div>
              )}
            </For>
          )}
          
          {!loading() && filteredBookings().length === 0 && (
            <div class={styles.emptyState}>
              <p>没有找到匹配的预订记录</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
