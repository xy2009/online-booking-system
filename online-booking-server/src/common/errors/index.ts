
import type { TErrorConfig, TErrorKey } from '../types/errors';


export enum ERROR_KEYS {
    BAD_REQUEST = 'BAD_REQUEST',
    UNAUTHORIZED = 'UNAUTHORIZED',
    PARAMS_ERROR = 'PARAMS_ERROR',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    KEY_ALREADY_EXISTS = 'KEY_ALREADY_EXISTS',
     // 临时限流
    TEMP_LIMITING_ERROR = 'TEMP_LIMITING_ERROR',
    // 周期限流
    PERIOD_LIMITING_ERROR = 'PERIOD_LIMITING_ERROR',
    // 时间不可用
    TIME_NOT_AVAILABLE = 'TIME_NOT_AVAILABLE',
    // 桌子不可用
    TABLE_NOT_AVAILABLE = 'TABLE_NOT_AVAILABLE',

}

// 定义一些常见的HTTP错误类型和状态码
const errorConfig: TErrorConfig = {
    [ERROR_KEYS.BAD_REQUEST]: { message: 'Bad Request', statusCode: 400 },
    [ERROR_KEYS.UNAUTHORIZED]: { message: 'Unauthorized', statusCode: 401 },
    [ERROR_KEYS.PARAMS_ERROR]: { message: 'Params Error', statusCode: 402 },
    [ERROR_KEYS.FORBIDDEN]: { message: 'Forbidden', statusCode: 403 },
    [ERROR_KEYS.NOT_FOUND]: { message: 'Not Found', statusCode: 404 },
    [ERROR_KEYS.INTERNAL_SERVER_ERROR]: { message: 'Internal Server Error', statusCode: 500 },
    [ERROR_KEYS.KEY_ALREADY_EXISTS]: { message: 'Key Already Exists', statusCode: 402, errorCode: 402001 },
    [ERROR_KEYS.TIME_NOT_AVAILABLE]: { message: 'Time Not Available', statusCode: 402, errorCode: 402001 },
    [ERROR_KEYS.TABLE_NOT_AVAILABLE]: { message: 'Table Not Available', statusCode: 402, errorCode: 402002 },

    [ERROR_KEYS.TEMP_LIMITING_ERROR]: { message: 'Temp LIMITING', statusCode: 429, errorCode: 429001 },
    [ERROR_KEYS.PERIOD_LIMITING_ERROR]: { message: 'PERIOD LIMITING', statusCode: 429, errorCode: 429002 },
};

  const isDev = process.env.NODE_ENV === 'development';

// 对error进行统一处理
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    /**
     * HTTP status code alias for compatibility
     */
    public code: number;

    /**
     * Optional error code for more specific error identification
     */
    public errorCode?: number;

    /**
     * 额外字段用于 GraphQL 错误扩展
     */
    public readonly extensions: Record<string, any> | undefined;

    constructor(message: string, statusCode: number, isOperational = true, extensions?: Record<string, any>) {
        super(message);
        this.code = statusCode
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.extensions = extensions;
        Error.captureStackTrace(this, this.constructor);
    }

    static handleError(err: AppError, res: any) {
        const isDev = process.env.NODE_ENV === 'development';
        const safeExtensions = isDev ? err.extensions : undefined;
        const errorCode = (err as any).errorCode;
        res.locals.errorCode = errorCode;
        const errObj = errorCode ? { errorCode } : {};
        if (errorCode) {
            (errObj as any).errorCode = errorCode;
        }
        res.status(err.statusCode || 500).json({
            code: err.statusCode || 500,
            status: 'error',
            message: err.message || 'Internal Server Error', 
            ...(errObj),
            // 仅开发环境返回 extensions 详情
            ...(isDev && safeExtensions ? { extensions: safeExtensions } : {})
        });
    }
    /**
     * 转换为 Apollo GraphQL 兼容的 error 对象
     */
    toGraphQLError() {
        return {
            message: this.message,
            extensions: {
                code: this.statusCode,
                isOperational: this.isOperational,
                ...this.extensions
            }
        };
    }

    /**
     * Apollo Server formatError 用于统一格式化
     */
    static formatGraphQLError(err: any) {
        if (err.originalError instanceof AppError) {
            return err.originalError.toGraphQLError();
        }
        return {
            message: err.message,
            extensions: {
                code: 500,
                isOperational: false
            }
        };
    }

    // handle unexpected errors
    static handleUnknownError(err: Error, res: any) {
        console.error('Unexpected Error: ', err);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Internal Server Error',
        });
    }

    // factory method for common HTTP errors by errorConfig
    static _fromConfig(key: TErrorKey, customMessage?: string, extensions?: Record<string, any>) {
        const { statusCode, message, errorCode } = errorConfig[key];
        // 只在开发环境下合并全部 extensions，生产环境 extensions 可为 undefined
        const mergedExtensions = isDev
            ? { ...(extensions || {}) }
            : undefined;
        // errorCode 直接作为 AppError 实例的属性，便于 handleError 顶层返回
        const appError = new AppError(customMessage || message, statusCode, true, mergedExtensions);
        if (errorCode) {
            (appError as any).errorCode = errorCode;
        }
        return appError;
    }

    static badRequest(message: string, extensions?: Record<string, any>) {
        return this._fromConfig(ERROR_KEYS.BAD_REQUEST, message, extensions);
    }
    static paramsError(message: string, extensions?: Record<string, any>) {
        return this._fromConfig(ERROR_KEYS.PARAMS_ERROR, message, extensions);
    }

    static unauthorized(message: string, extensions?: Record<string, any>) {
        return this._fromConfig(ERROR_KEYS.UNAUTHORIZED, message, extensions);
    }

    static forbidden(message: string, extensions?: Record<string, any>) {
        return this._fromConfig(ERROR_KEYS.FORBIDDEN, message, extensions);
    }

    static notFound(message: string, extensions?: Record<string, any>) {
        return this._fromConfig(ERROR_KEYS.NOT_FOUND, message, extensions);
    }

    static internal(message?: string, extensions?: Record<string, any>) {
        return this._fromConfig(ERROR_KEYS.INTERNAL_SERVER_ERROR, message, extensions);
    }

    static keyAlreadyExists(message?: string, extensions?: Record<string, any>) {
        return this._fromConfig(ERROR_KEYS.KEY_ALREADY_EXISTS, message, extensions);
    }

    static tempLimiting(message?: string, extensions?: Record<string, any>) {
        return this._fromConfig(ERROR_KEYS.TEMP_LIMITING_ERROR, message, extensions);
    }

    static periodLimiting(message?: string, extensions?: Record<string, any>) {
        return this._fromConfig(ERROR_KEYS.PERIOD_LIMITING_ERROR, message, extensions);
    }

    static fromError(err: Error, extensions?: Record<string, any>) {
        return new AppError(err.message, 500, false, extensions);
    }

    static timeNotAvailable(message?: string, extensions?: Record<string, any>) {
        return this._fromConfig(ERROR_KEYS.TIME_NOT_AVAILABLE, message, extensions);
    }

    static tableNotAvailable(message?: string, extensions?: Record<string, any>) {
        return this._fromConfig(ERROR_KEYS.TABLE_NOT_AVAILABLE, message, extensions);
    }


}

export default AppError;