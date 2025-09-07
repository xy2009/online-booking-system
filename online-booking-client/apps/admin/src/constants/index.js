// 应用配置常量
export const APP_CONFIG = {
    APP_CLIENT_ID: import.meta.env.VITE_SYS_CLIENT_ID,
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


// API相关常量
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth',
    REFRESH: '/api/v1/auth/refresh-token'
  },
  GRAPHQL: '/graphql'
};

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
  'This account is undefined or this system cannot be used for this account': '此账号不存在或无法使用此系统，请联系管理员',
}

// 本地存储键名
export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'admin_token',
  ADMIN_INFO: 'admin_info',
  ADMIN_TOKEN_EXPIRED_AT: 'admin_token_expired_at',
  ADMIN_REFRESH_TOKEN: 'admin_refresh_token'
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

// 预订状态操作
export const BOOKING_ACTIONS = {
  CONFIRM: 'confirmed',
  CANCEL: 'cancelled',
  COMPLETE: 'completed',
  NO_SHOW: 'no_show'
};

// 预订状态到可用操作映射
export const BOOKING_STATUS_TO_ACTIONS = {
  [BOOKING_STATUS.PENDING]: [BOOKING_ACTIONS.CONFIRM, BOOKING_ACTIONS.CANCEL],
  [BOOKING_STATUS.CONFIRMED]: [BOOKING_ACTIONS.COMPLETE, BOOKING_ACTIONS.CANCEL, BOOKING_ACTIONS.NO_SHOW],
  [BOOKING_STATUS.CANCELLED]: [],
  [BOOKING_STATUS.COMPLETED]: [],
  [BOOKING_STATUS.NO_SHOW]: []
};

// // 餐桌状态
// export const TABLE_STATUS = {
//   AVAILABLE: 'available',
//   OCCUPIED: 'occupied',
//   RESERVED: 'reserved',
//   MAINTENANCE: 'maintenance'
// };



// // 餐桌状态显示文本
// export const TABLE_STATUS_TEXT = {
//   [TABLE_STATUS.AVAILABLE]: '可用',
//   [TABLE_STATUS.OCCUPIED]: '占用中',
//   [TABLE_STATUS.RESERVED]: '已预订',
//   [TABLE_STATUS.MAINTENANCE]: '维护中'
// };

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

export const LOCATION_TYPES = {
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor',
  PRIVATE: 'private'
};

const LOCATION_TYPE_TEXT = {
  [LOCATION_TYPES.INDOOR]: '大堂',
  [LOCATION_TYPES.OUTDOOR]: '室外',
  [LOCATION_TYPES.PRIVATE]: '包间'
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
  [BRANCH_STATUS.DELETED]: '关闭'
};

// 表单验证规则
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  PHONE_PATTERN: /^1[3-9]\d{9}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// 错误消息
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: '此字段为必填项',
  INVALID_PHONE: '请输入正确的手机号格式',
  INVALID_EMAIL: '请输入正确的邮箱格式',
  PASSWORD_TOO_SHORT: '密码至少6位',
  NAME_TOO_SHORT: '名称至少2个字符',
  NETWORK_ERROR: '网络错误，请稍后重试',
  LOGIN_FAILED: '登录失败',
  UNAUTHORIZED: '权限不足',
  OPERATION_FAILED: '操作失败'
};

// 成功消息
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  OPERATION_SUCCESS: '操作成功',
  BOOKING_CONFIRMED: '预订已确认',
  BOOKING_CANCELLED: '预订已取消',
  BOOKING_COMPLETED: '预订已完成',
  TABLE_UPDATED: '餐桌信息已更新',
  BRANCH_UPDATED: '门店信息已更新'
};

// 路由路径
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  BOOKINGS: '/bookings',
  TABLES: '/tables',
  BRANCHES: '/branches',
  SETTINGS: '/settings'
};

// 时间相关常量
export const TIME_CONSTANTS = {
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE_FORMAT: 'YYYY年MM月DD日',
  DISPLAY_TIME_FORMAT: 'MM月DD日 HH:mm'
};

// UI相关常量
export const UI_CONSTANTS = {
  LOADING_DELAY: 300,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 500
};

// 分页相关常量
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// 管理端权限
export const PERMISSIONS = {
  VIEW_BOOKINGS: 'view_bookings',
  MANAGE_BOOKINGS: 'manage_bookings',
  VIEW_TABLES: 'view_tables',
  MANAGE_TABLES: 'manage_tables',
  VIEW_BRANCHES: 'view_branches',
  MANAGE_BRANCHES: 'manage_branches',
  ADMIN: 'admin'
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

// 导航菜单
export const NAVIGATION_ITEMS = [
  {
    key: 'dashboard',
    label: '仪表盘',
    path: ROUTES.DASHBOARD,
    icon: '📊',
    description: '查看系统概览和统计数据',
    status: 'inactive'
  },
  {
    key: 'bookings',
    label: '预订管理',
    path: ROUTES.BOOKINGS,
    icon: '📅',
    description: '管理客户预订信息',
    status: 'active'
  },
  {
    key: 'tables',
    label: '餐桌管理',
    path: ROUTES.TABLES,
    icon: '🪑',
    description: '管理餐桌状态和信息',
    status: 'active'
  },
  {
    key: 'branches',
    label: '门店管理',
    path: ROUTES.BRANCHES,
    icon: '🏪',
    description: '管理分店信息和设置', 
    status: 'active'
  }
];

// 统一导出的管理端常量对象
export const ADMIN_CONSTANTS = {
  API_ENDPOINTS,
  STORAGE_KEYS,
  BOOKING_STATUS,
  BOOKING_STATUS_TEXT,
  BOOKING_ACTIONS,
  TABLE_STATUS,
  TABLE_STATUS_TEXT,
  BRANCH_STATUS,
  BRANCH_STATUS_TEXT,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  TIME_CONSTANTS,
  UI_CONSTANTS,
  PAGINATION,
  PERMISSIONS,
  THEME,
  DEFAULT_CONFIG,
  NAVIGATION: NAVIGATION_ITEMS,
  LOCATION_TYPE_TEXT
};
