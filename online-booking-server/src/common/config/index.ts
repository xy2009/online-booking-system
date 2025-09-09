/// <reference types="node" />
import AppError from '../errors';
import { getCallerFile } from '../utils/file';
import { logger } from '../utils/logger';

export const getConfig = () => {
  return {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT,
    dbUrl: process.env.DB_URL,
    dbPort: process.env.DB_PORT,
    dbUser: process.env.DB_USER,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // 不导出敏感参数
    // PWD_SALT: process.env.PWD_SALT,
  };
}

// 仅允许访问的配置键
const __candidates = new Set<string>([
  'rest/services/accoutService.ts',
  'common/utils/auth.ts'
]);

// 标准化路径，去除扩展名差异, 避免编译后无法匹配
const normalizePath = (path: string) =>
  path.replace(/\.ts$/, '.js').replace(/\.js$/, '.js');


export const _getConfigByKey_ = (key: string, pathIndex: number = 1) => {
    // 获取调用方文件路径
    const callerFile = getCallerFile();
    const filePathParts = callerFile ? callerFile.split('/') : [];
    const relevantPathParts = filePathParts.slice(-pathIndex).join('/');
    logger.info(`Config requested by: ${callerFile}`);
    if (!__candidates.has(normalizePath(relevantPathParts))) {
        throw AppError.internal(`Access to config key "${key}" is not allowed.`);
    }
    return process.env[key];
}

export const getClientConfigById = (clientId: string) => {
  const clientConfigs: any = process.env.CLIENT_CONFIGS ? JSON.parse(process.env.CLIENT_CONFIGS) : {};
  return clientConfigs[clientId] || null;
}

export const getAllClientIds = () => {
    const ids = process.env.ALL_CLIENT_IDS || process.env.CUSTOMER_CLIENT_ID;
    if (!ids) return [];
    return ids.split(',').map(id => id.trim());
}