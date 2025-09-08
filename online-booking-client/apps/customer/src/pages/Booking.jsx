import { createSignal, createEffect, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Toaster, toast } from 'solid-toast';

import { Button } from '@booking/shared-ui';
import { formatDate } from '@booking/shared-utils';
import { authStore } from '../stores/authStore';
import { bookingStore } from '../stores/bookingStore';
import styles from './Booking.module.css';
import { 
  TIME_CONSTANTS
} from '../constants';

function Booking() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = createSignal(1);
  const [selectedDate, setSelectedDate] = createSignal('');
  const [selectedTime, setSelectedTime] = createSignal('');
  const [partySize, setPartySize] = createSignal(2);
  const [customerInfo, setCustomerInfo] = createSignal({
    connectName: '',
    connectPhone: '',
    notes: ''
  });
  const [errors, setErrors] = createSignal({});

  const [disabledTime, setDisableTime] = createSignal({});
  const bookingDaysAhead = TIME_CONSTANTS.BOOKING_DAYS_AHEAD || 7;

  onMount(() => {
    toast.dismiss();
  });

  // 检查认证状态和选中的门店
  createEffect(() => {
    if (!authStore.initialized()) return;
    if (!authStore.isAuthenticated()) {
      navigate('/login');
      return;
    }
    if (!bookingStore.selectedStore()) {
      navigate('/');
      return;
    }
    // 初始化用户信息
    const user = authStore.user();
    if (user) {
      const customer = {
        connectName: user?.connectName || user.nickName || user.name ||'',
        connectPhone: user?.connectPhone || user.mobile || '',
        notes: ''
      }
      // console.log('customer:', customer);
      // debugger;  
      setCustomerInfo(customer);
    }
  });

  

  const refreshDisabledTime = (timeKey) => {
    if (availableSlots().length > 0) {
      if (disabledTime()[timeKey]) {
        setDisableTime(prev => {
          const copy = { ...prev };
          delete copy[timeKey];
          return copy;
        });
      }
    } else {
      toast.error('当前餐位和时间已客满，请选择其他！', { duration: 1200 });
      setDisableTime({...disabledTime(), [timeKey]: true});
    }
  }

  // 获取可用时间段
  const fetchAvailableSlots = async () => {
    const store = bookingStore.selectedStore();
    const date = new Date(`${selectedDate()} ${selectedTime()}`).getTime();
    const size = partySize();
    // console.log('Fetching slots for:', store, date, size);
    if (store && date && size) {
      await bookingStore.fetchAvailableSlots(store.id, date, size);
      // 刷新禁用时间
      const timeKey = `${selectedDate()} ${selectedTime()} ${partySize()}`;
      refreshDisabledTime(timeKey);
    }
  };

  // 当日期或人数改变时，重新获取可用时间段
  createEffect(() => {
    if (selectedDate() && partySize() && selectedTime()) {
      fetchAvailableSlots();
      // console.log('customerInfo():', customerInfo());
    }
  });

  const handleDateChange = (date) => {
      setSelectedDate(date);
      // setSelectedTime(''); // 重置时间选择
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handlePartySizeChange = (size) => {
    setPartySize(size);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!selectedDate()) {
        newErrors.date = '请选择日期';
      }
      if (!selectedTime()) {
        newErrors.time = '请选择时间';
      }
    }
    
    if (step === 2) {
      const info = customerInfo();
      const nameValue = info.connectName || info.name;
      if (!nameValue) {
        newErrors.connectName = '请输入姓名';
      }
      const connectPhone = info.connectPhone || info.mobile;
      if (!connectPhone) {
        newErrors.connectPhone = '请输入手机号';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep())) {
      setCurrentStep(currentStep() + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep() - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      return;
    }

    const store = bookingStore.selectedStore();
    // console.log('Submitting booking for store:', customerInfo());
    const bookingData = {
      branchId: store.id,
      userId: authStore.user()?.userId,
      tableId: bookingStore.availableSlots()[0]?.id,
      numberOfPeople: partySize(),
      bookingTime: new Date(`${selectedDate()} ${selectedTime()}`).getTime(),
      connectName: customerInfo().connectName || customerInfo().name,
      connectPhone: customerInfo().connectPhone || customerInfo().mobile,
      specialRequests: customerInfo().notes,
      bookingType: 'online'
    };

    const result = await bookingStore.createBooking(bookingData);

    if (result.success) {
      toast.success('预订成功！');
      await bookingStore.fetchBookingHistory(authStore.user()?.userId); // 刷新历史
      // console.log('Booking created:', result.booking);
      navigate('/bookings');
    } else {
      setErrors({ submit: result.error });
    }
  };

  const store = bookingStore.selectedStore();
  const availableSlots = bookingStore.availableSlots;
  const loading = bookingStore.loading;

  // 生成未来15天的日期选项
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
 
    for (let i = 0; i < bookingDaysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? '今天' : i === 1 ? '明天' : formatDate(date, 'MM月DD日'),
        weekday: date.toLocaleDateString('zh-CN', { weekday: 'short' })
      });
    }
    
    return dates;
  };

  if (!store) {
    return <div>加载中...</div>;
  }

   const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // 如果是 '09' 或 '9'，补全为 '09:00'
    if (/^\d{1,2}$/.test(timeStr)) {
      return timeStr.padStart(2, '0') + ':00';
    }
    // 如果是 '09:30' 这种，直接返回
    return timeStr;
  };

  return (
    <div class={styles.container}>
      <Toaster />
      <div class={styles.header}>
        <button class={styles.backButton} onClick={() => navigate('/')}>
          ← 返回
        </button>
        <h1>预订餐桌</h1>
      </div>

      <div class={styles.storeInfo}>
        <h2>{store.name}</h2>
        <p>{store.address}</p>
        <p>营业时间：{formatTime(store.openTime)} - {formatTime(store.closeTime)}</p>
      </div>

      <div class={styles.steps}>
        <div class={`${styles.step} ${currentStep() >= 1 ? styles.active : ''}`}>
          <span>1</span>
          <span>选择时间</span>
        </div>
        <div class={`${styles.step} ${currentStep() >= 2 ? styles.active : ''}`}>
          <span>2</span>
          <span>确认信息</span>
        </div>
      </div>

      <div class={styles.content}>
        {currentStep() === 1 && (
          <div class={styles.stepContent}>
            <h3>选择用餐时间</h3>
            
            {/* 人数选择 */}
            <div class={styles.section}>
              <label>用餐人数</label>
              <div class={styles.partySizeSelector}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(size => (
                  <button
                    key={size}
                    class={`${styles.sizeButton} ${partySize() === size ? styles.selected : ''}`}
                    onClick={() => handlePartySizeChange(size)}
                  >
                    {size}人
                  </button>
                ))}
              </div>
            </div>

            {/* 日期选择 */}
            <div class={styles.section}>
              <label>选择日期</label>
              <div class={styles.dateSelector}>
                {getDateOptions().map(date => (
                  <button
                    key={date.value}
                    class={`${styles.dateButton} ${selectedDate() === date.value ? styles.selected : ''}`}
                    onClick={() => handleDateChange(date.value)}
                  >
                    <span class={styles.dateLabel}>{date.label}</span>
                    <span class={styles.weekday}>{date.weekday}</span>
                  </button>
                ))}
              </div>
              {errors().date && (
                <span class={styles.errorText}>{errors().date}</span>
              )}
            </div>

            {/* 时间选择 */}
            {selectedDate() && (
              <div class={styles.section}>
                <label>选择时间</label>
                {loading() ? (
                  <div class={styles.loading}>加载可用时间...</div>
                ) : (
                  // <div class={styles.timeSelector}>
                  //   {(availableSlots()?.map(slot => (
                  //     <button
                  //       key={slot.time}
                  //       class={`${styles.timeButton} ${selectedTime() === slot.time ? styles.selected : ''} ${!slot.available ? styles.disabled : ''}`}
                  //       onClick={() => slot.available && handleTimeSelect(slot.time)}
                  //       disabled={!slot.available}
                  //     >
                  //       {slot.time}
                  //     </button>
                  //   )))}
                  // </div>
                  <div class={styles.timeSelector}>
                    {['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '16:00', '16:30', '17:00', '17:30',
                      '18:00', '18:30', '19:00', '19:30', '20:00'].map(time => (
                      <button
                        key={time}
                        class={`${styles.timeButton} ${selectedTime() === time ? styles.selected : ''} ${disabledTime()[`${selectedDate()} ${time} ${partySize()}`] ? styles.disabled : ''}`}
                        onClick={() => handleTimeSelect(time)}
                        disabled={disabledTime()[`${selectedDate()} ${time} ${partySize()}`]}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
                {errors().time && (
                  <span class={styles.errorText}>{errors().time}</span>
                )}
              </div>
            )}

            <div class={styles.actions}>
              <Button onClick={handleNext} disabled={!selectedDate() || !selectedTime() || !availableSlots().length}>
                下一步
              </Button>
            </div>
          </div>
        )}

        {currentStep() === 2 && (
          <div class={styles.stepContent}>
            <h3>确认预订信息</h3>
            
            {/* 预订摘要 */}
            <div class={styles.summary}>
              <h4>预订详情</h4>
              <div class={styles.summaryItem}>
                <span>餐厅：</span>
                <span>{store.name}</span>
              </div>
              <div class={styles.summaryItem}>
                <span>日期：</span>
                <span>{formatDate(new Date(selectedDate()), 'YYYY年MM月DD日')}</span>
              </div>
              <div class={styles.summaryItem}>
                <span>时间：</span>
                <span>{selectedTime()}</span>
              </div>
              <div class={styles.summaryItem}>
                <span>人数：</span>
                <span>{partySize()}人</span>
              </div>
            </div>

            {/* 客户信息 */}
            <div class={styles.section}>
              <label>联系信息</label>
              <div class={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="姓名"
                  value={customerInfo().connectName || customerInfo().nickName || customerInfo().name}
                  onInput={e => setCustomerInfo(prev => ({ ...prev, connectName: e.target.value }))}
                  class={errors().connectName ? styles.inputError : ''}
                />
                {errors().connectName && (
                  <span class={styles.errorText}>{errors().connectName}</span>
                )}
              </div>
              
              <div class={styles.inputGroup}>
                <input
                  type="tel"
                  placeholder="手机号"
                  value={customerInfo().connectPhone || customerInfo().mobile}
                  onInput={e => setCustomerInfo(prev => ({ ...prev, connectPhone: e.target.value }))}
                  class={errors().connectPhone ? styles.inputError : ''}
                />
                {errors().connectPhone && (
                  <span class={styles.errorText}>{errors().connectPhone}</span>
                )}
              </div>
              
              <div class={styles.inputGroup}>
                <textarea
                  placeholder="备注（可选）"
                  value={customerInfo().notes}
                  onInput={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                />
              </div>
            </div>

            {errors().submit && (
              <div class={styles.submitError}>
                {errors().submit}
              </div>
            )}

            <div class={styles.actions}>
              <Button variant="outline" onClick={handlePrevious}>
                上一步
              </Button>
              <Button onClick={handleSubmit} loading={loading()}>
                确认预订
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Booking;
