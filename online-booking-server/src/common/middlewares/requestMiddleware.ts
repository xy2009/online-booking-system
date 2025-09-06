import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../utils/logger';
import { maskMobile } from '../utils/util';


// 统一管理需要脱敏的字段
const SENSITIVE_FIELDS = ['password', 'newPassword', 'oldPassword'];
const PARTIAL_MASK_FIELDS = ['mobile', 'phone', 'tel'];


export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  console.log('=============request =============\n', res);
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    const errorCode = res.getHeader('error-code') || res.locals?.errorCode;
    const requestId = req.headers['x-request-id'];
    const traceId = req.headers['x-trace-id'] || (req as any).traceId;

    const logMsg =
      `[END] ${req.method} ${req.originalUrl} ${res.statusCode}` +
      (errorCode ? ` [errorCode:${errorCode}]` : '') +
      (requestId ? ` [requestId:${requestId}]` : '') +
      (traceId ? ` [traceId:${traceId}]` : '') +
      ` - ${duration}ms`;
    
    let safeBody = undefined;
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      safeBody = { ...req.body };
      for (const key of SENSITIVE_FIELDS) {
        if (key in safeBody) safeBody[key] = '***';
      }
      for (const key of PARTIAL_MASK_FIELDS) {
        if (key in safeBody) safeBody[key] = maskMobile(safeBody[key]);
      }
    }
    const meta = safeBody ? { body: safeBody } : undefined;
    if (res.statusCode >= 400) {
      logger.error(logMsg, meta);
    } else {
      logger.info(logMsg, meta);
    }
    
    console.log('=============request finish=============\n', res.status, meta);
  });
  next();
}

export const requestContorller = (req: Request, res: Response, next: NextFunction) => {
  // 添加对请求的额外控制逻辑，比如限流、请求频率监控等
  // 为了方便追踪各个请求，添加requestId, traceId等到req对象
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = requestId;
  // 响应时也带上
  res.setHeader('x-request-id', requestId);

  const traceIdHeader = req.headers['x-trace-id'];
  req.traceId = typeof traceIdHeader === 'string' ? traceIdHeader : uuidv4();
  res.setHeader('x-trace-id', req.traceId);

  // 打印请求开始日志
  logger.info(
    `[START] ${req.method} ${req.originalUrl} [requestId:${requestId}] [traceId:${req.traceId}]`
  );

  next();
}
