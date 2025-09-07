// 应用配置常量
export const APP_CONFIG = {
    APP_CLIENT_ID: import.meta.env.VITE_APP_CLIENT_ID,
    EN_ABLE_BACKEND_LOGOUT: import.meta.env.VITE_ENABLE_BACKEND_LOGOUT === 'true'
}

export const HTTP_RES_CODES = {
  SUCCESS: 200,
  PARAMS_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

export const HTTP_ERROR_MESSAGES = {
  [HTTP_RES_CODES.PARAMS_ERROR]: '请求参数错误',
  [HTTP_RES_CODES.UNAUTHORIZED]: '未授权，请登录',
  [HTTP_RES_CODES.FORBIDDEN]: '没有权限访问',
  [HTTP_RES_CODES.NOT_FOUND]: '请求资源未找到',
  [HTTP_RES_CODES.SERVER_ERROR]: '服务器错误，请稍后重试'
};

export const ERROR_MESSAGE_KEYS = {
  'Not Authorised': '未授权，请登录',
  'User Not Found': '用户不存在',
  'Invalid Credentials': '用户名或密码错误',
  'User Already Exists': '用户已存在',
  'selected time': '所选时间已预订满，请选择其他时间',
}


// API相关常量
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth',
    REFRESH: '/api/v1/auth/refresh-token',
  },
  GRAPHQL: '/graphql'
};

// 本地存储键名
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_TOKEN_EXPIRED_AT: 'expired_at',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  BOOKING_DRAFT: 'booking_draft',
  STORE_KEY: 'BOOKING_SELECTED_STORE',
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
  [BOOKING_STATUS.NO_SHOW]: '未到店'
};

// 用餐人数选项
export const PARTY_SIZE_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

// 表单验证规则
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  PHONE_PATTERN: /^1[3-9]\d{9}$/
};

// 错误消息
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: '此字段为必填项',
  INVALID_PHONE: '请输入正确的手机号格式',
  PASSWORD_TOO_SHORT: '密码至少6位',
  NAME_TOO_SHORT: '姓名至少2个字符',
  PASSWORD_MISMATCH: '两次输入的密码不一致',
  NETWORK_ERROR: '网络错误，请稍后重试',
  LOGIN_FAILED: '登录失败',
  REGISTER_FAILED: '注册失败',
  QUERY_FAILED: '查询失败',
  BOOKING_FAILED: '预订失败',
  CANCEL_FAILED: '取消失败',
  UNAUTHORIZED: '未授权，请登录',
  REFRESH_FAILED: '登录状态已过期，请重新登录'
};

// 成功消息
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  REGISTER_SUCCESS: '注册成功！请登录',
  BOOKING_SUCCESS: '预订成功！',
  CANCEL_SUCCESS: '预订已取消'
};

// 路由路径
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  BOOKING: '/booking',
  BOOKING_HISTORY: '/bookings',
  PROFILE: '/profile'
};

// 时间相关常量
export const TIME_CONSTANTS = {
  CANCEL_DEADLINE_HOURS: 1, // 取消预订的最少提前时间（小时）
  BOOKING_DAYS_AHEAD: 15,    // 可预订的天数
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE_FORMAT: 'YYYY年MM月DD日',
  DISPLAY_TIME_FORMAT: 'MM月DD日 HH:mm'
};

// UI相关常量
export const UI_CONSTANTS = {
  LOADING_DELAY: 300,       // 加载状态显示延迟（毫秒）
  TOAST_DURATION: 3000,     // 提示消息显示时长（毫秒）
  ANIMATION_DURATION: 200,  // 动画持续时间（毫秒）
  DEBOUNCE_DELAY: 500      // 防抖延迟（毫秒）
};

// 分页相关常量
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50
};

// 文件上传相关常量
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword']
};

// 业务规则常量
export const BUSINESS_RULES = {
  MIN_PARTY_SIZE: 1,
  MAX_PARTY_SIZE: 20,
  MIN_BOOKING_ADVANCE_MINUTES: 30, // 最少提前预订时间（分钟）
  MAX_BOOKING_ADVANCE_DAYS: 30     // 最多提前预订天数
};

// 主题相关常量
export const THEME = {
  COLORS: {
    PRIMARY: '#667eea',
    SECONDARY: '#764ba2',
    SUCCESS: '#38a169',
    WARNING: '#d69e2e',
    ERROR: '#e53e3e',
    INFO: '#38b2ac'
  },
  BREAKPOINTS: {
    MOBILE: '480px',
    TABLET: '768px',
    DESKTOP: '1024px',
    LARGE: '1200px'
  }
};

// 默认配置
export const DEFAULT_CONFIG = {
  LANGUAGE: 'zh-CN',
  TIMEZONE: 'Asia/Shanghai',
  CURRENCY: 'CNY'
};
