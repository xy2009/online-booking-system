// 格式化日期
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

// 格式化时间
export const formatTime = (date) => {
  return formatDate(date, 'HH:mm');
};

// 格式化日期时间
export const formatDateTime = (date) => {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
};

// 相对时间格式化
export const formatRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diff = now - target;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return formatDate(date);
  }
};

// 获取今天的日期字符串
export const getTodayString = () => {
  return formatDate(new Date());
};

// 获取明天的日期字符串
export const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
};

// 检查是否是今天
export const isToday = (date) => {
  const today = new Date();
  const target = new Date(date);
  
  return today.getFullYear() === target.getFullYear() &&
         today.getMonth() === target.getMonth() &&
         today.getDate() === target.getDate();
};

// 检查是否是明天
export const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = new Date(date);
  
  return tomorrow.getFullYear() === target.getFullYear() &&
         tomorrow.getMonth() === target.getMonth() &&
         tomorrow.getDate() === target.getDate();
};

// 获取星期几
export const getWeekday = (date) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const d = new Date(date);
  return weekdays[d.getDay()];
};

// 格式化预订时间显示
export const formatBookingTime = (date) => {
  const target = new Date(date);
  
  if (isToday(target)) {
    return `今天 ${formatTime(target)}`;
  } else if (isTomorrow(target)) {
    return `明天 ${formatTime(target)}`;
  } else {
    return `${formatDate(target)} ${getWeekday(target)} ${formatTime(target)}`;
  }
};
