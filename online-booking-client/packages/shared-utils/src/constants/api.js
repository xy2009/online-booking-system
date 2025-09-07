// API 基础配置
export const API_CONFIG = {
  BASE_URL: 'http://192.168.31.85:3030',
  REST_BASE: 'http://192.168.31.85:3030/api',
  GRAPHQL_URL: 'http://192.168.31.85:3030/graphql',
  TIMEOUT: 10000, // 10秒超时
};

// 认证相关常量
export const AUTH_CONSTANTS = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'user_info',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24小时
};

// 预订状态
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show'
};

// 预订状态显示文本
export const BOOKING_STATUS_TEXT = {
  [BOOKING_STATUS.PENDING]: '待确认',
  [BOOKING_STATUS.CONFIRMED]: '已确认',
  [BOOKING_STATUS.CANCELLED]: '已取消',
  [BOOKING_STATUS.COMPLETED]: '已完成',
  [BOOKING_STATUS.NO_SHOW]: '未到店',
};

// 门店状态
export const BRANCH_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted'
};

// 门店状态显示文本
export const BRANCH_STATUS_TEXT = {
  [BRANCH_STATUS.ACTIVE]: '营业中',
  [BRANCH_STATUS.INACTIVE]: '暂停营业',
  [BRANCH_STATUS.DELETED]: '已关闭',
};

// 餐桌状态
export const TABLE_STATUS = {
  FREE: 'free',
  RESERVED: 'reserved',
  BOOKED: 'booked',
  CONFIRMED: 'confirmed',
  OCCUPIED: 'occupied',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  UNAVAILABLE: 'unavailable'
};


// 餐桌状态显示文本
export const TABLE_STATUS_TEXT = {
  [TABLE_STATUS.FREE]: '空闲',// 可直接分配或预订
  [TABLE_STATUS.RESERVED]: '预留',// 内部锁定或临时锁定
  [TABLE_STATUS.BOOKED]: '已预订',// 顾客已预订
  [TABLE_STATUS.CONFIRMED]: '已确认',// 预订已确认（如已支付定金）
  [TABLE_STATUS.OCCUPIED]: '占用中',// 顾客已到店并入座
  [TABLE_STATUS.CLEANING]: '清洁中',// 用餐结束后，清洁中，暂不可用
  [TABLE_STATUS.MAINTENANCE]: '维护中',// 维修中，暂不可用
  [TABLE_STATUS.UNAVAILABLE]: '不可用',// 如封禁等特殊情况，不可分配或预订
};

// 错误代码
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_FAILED: 'AUTH_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
};

// 错误消息
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ERROR_CODES.AUTH_FAILED]: '登录失败，请检查用户名和密码',
  [ERROR_CODES.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ERROR_CODES.PERMISSION_DENIED]: '权限不足，无法执行此操作',
  [ERROR_CODES.VALIDATION_ERROR]: '输入信息有误，请检查后重试',
  [ERROR_CODES.SERVER_ERROR]: '服务器错误，请稍后重试',
  [ERROR_CODES.NOT_FOUND]: '请求的资源不存在',
};
