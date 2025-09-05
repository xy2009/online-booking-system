
export const DateFormatKeys = {
    formatDateStr: 'YYYY-MM-DD',
    formatHourStr: 'YYYY-MM-DD_HH',
    formatTimeStr: 'YYYY-MM-DD HH:mm:ss',
    formatTimeStr2: 'YYYY-MM-DD_HH:mm',
    formatNowStr: 'YYYY-MM-DD HH:mm:ss.SSS',
}

export const EnvKeys = {
    PWD_SALT: 'PWD_SALT',
    JWT_SECRET: 'JWT_SECRET',
    JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
    JWT_REFRESH_EXPIRES_IN: 'JWT_REFRESH_EXPIRES_IN',
    CUSTOMER_CLIENT_ID: 'CUSTOMER_CLIENT_ID',
    ADMIN_CLIENT_ID: 'ADMIN_CLIENT_ID',
}



export const SCOPES = {
    USER: 'user',// 用户管理
    ORG: 'org',// 区域管理
    BUSINESS: 'business',// 业务管理
    SYSTEM: 'system',// 系统管理
}

export const COLLECTIONS = {
    ACCOUNT: 'account',
    PROFILE: 'profile',
    REFRESH: 'refresh_token',
    VERIFY_CODE: 'verify_code',
    BRANCH: 'branch',
    BOOKING: 'booking',
    STAFF: 'staff',
    CONFIG: 'config',
    TABLE: 'table',
}

// use TYPES in queries to filter by document type
export const TYPES = {
    ACCOUNT: COLLECTIONS.ACCOUNT,
    PROFILE: COLLECTIONS.PROFILE,
    REFRESH: COLLECTIONS.REFRESH,
}

export const SYS_ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
}

export const ROLES = {
    ...SYS_ROLES,
    CUSTOMER: 'customer',
}


export const WORK_TIMES = {
    OPEN_HOUR: 10, // 营业开始时间 10点
    CLOSE_HOUR: 22, // 营业结束时间 22点
    LUNCH_START_HOUR: 11, // 午餐开始时间 11点
    LUNCH_END_HOUR: 14, // 午餐结束时间 14点
    DINNER_START_HOUR: 17, // 晚餐开始时间 17点
    DINNER_END_HOUR: 21, // 晚餐结束时间 21点
}

export const DEFAULTS = {
    DEFT_TURNTABLE_CYCLE: 60, // 默认翻台周期，单位分钟

}