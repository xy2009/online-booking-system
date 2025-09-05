import jwt from "jsonwebtoken";
import { getAccountProfileById } from '../../rest/services/accoutService';
import { _getConfigByKey_ } from '../config';
import { IAccountResponse } from '../../entities/accountEntity';
import AppError from "../errors";
import { logger } from "./logger";

export interface IVerfiyRes {
  sub: string;
  aud: string;
  userId: string;
  issuer: string;
  audience: string;
  iat: number;
  exp: number;
}

/**
 *  Verify JWT token and return user profile
 *  检查 token 的 audience 是否和 clientId 匹配, 防止 token 被混用
 *  检查账户状态是否 active
 * @param token 
 * @param clientId 
 * @returns 
 */
export const verifyJwtAndGetUser = async (token: string, clientId: string): Promise<IAccountResponse | null> => {
  const jwtSecret = _getConfigByKey_('JWT_SECRET', 3);
  if (!jwtSecret) throw AppError.internal();
  // Verify the JWT token
  const verfiyRes = jwt.verify(token, jwtSecret) as IVerfiyRes;
  if (!verfiyRes) return null;
  const { sub, aud, userId } = verfiyRes;
  // 检查 token 的 audience 是否和 clientId 匹配, 防止 token 被混用
  if (aud !== clientId) {
    logger.error(`\nWarning!!! Token invalid : audience ${aud} does not match clientId ${clientId},\n\n token: ${token}, sub: ${sub}, userId: ${userId}\n`);
    return null;
  }
  const accountProfile = await getAccountProfileById(sub, userId);
  // 检查账户状态
  if (!accountProfile || accountProfile.status !== 'active') return null;
  return { ...accountProfile, clientId: aud };
};