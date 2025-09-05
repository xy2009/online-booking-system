
// auth middleware
import type { Request, Response, NextFunction } from 'express';
import { _getConfigByKey_ } from '../../common/config';
import AppError from '../../common/errors';
import { logger } from '../../common/utils/logger';
import { sendError } from '../../common/utils/http';
import { verifyJwtAndGetUser } from '../../common/utils/auth';
import { whiteList } from '../../common/middlewares/whiteList';


interface IVerfiyRes {
  sub: string; // 'e886fe64-2f61-4b20-a36e-dc46636091ef',
  aud: string; // '56LY8OKo2S5u6OLmohAGaDg',
  userId: string; // '0ee87c04-d648-40d3-85b8-e0856f3a6e7a',
  issuer: string; // 'booking-app',
  audience: string;// 'booking-app-users',
  iat: number; // 1756753565,
  exp: number; // 1756839965
}


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  // Bypass auth for whitelisted paths, like /graphql
  const path = req.path;
  if (whiteList.some(rule =>
    typeof rule === 'string' ? path === rule : rule.test(path)
  )) {
    return next();
  }

  // Example: Check for a token in the Authorization header
  const authHeader = req.headers.authorization;
  // logger.debug(`Auth Header===>>: ${authHeader}`);
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const clientId = req.headers['client-id'] || '';
      const user = await verifyJwtAndGetUser(token, clientId as string);
      if (!user) return sendError(res, "Unauthorized", 401);
      req.user = user;
    } catch (err) {
      // logger.error('JWT verification error:', err);
      const errMsg = (err as Error).message;
      logger.error(`JWT verification failed: ${errMsg}, token: ${token}`);
      // throw AppError.unauthorized(errMsg || "Invalid token");
      return sendError(res, errMsg || "Invalid token", (err as AppError).code || 401);
    }
    next();
  } else {
    return sendError(res, "Unauthorized", 401);
  }
};