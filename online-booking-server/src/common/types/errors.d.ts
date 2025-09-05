export interface IAppError {
    message: string;
    statusCode: number;
    errorCode?: number; // 业务错误码，可选
}

export type TErrorKey = 'BAD_REQUEST' | 'PARAMS_ERROR' | 'UNAUTHORIZED' 
    | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR' | 'KEY_ALREADY_EXISTS'
    | 'TEMP_LIMITING_ERROR' | 'PERIOD_LIMITING_ERROR' // 添加限流错误类型
    |  'TIME_NOT_AVAILABLE' | 'TABLE_NOT_AVAILABLE'; // 添加业务错误类型


export type TErrorConfig = {
    [K in TErrorKey]: IAppError;
};