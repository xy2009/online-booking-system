import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import lo, { get } from "lodash";

import {
  _getConfigByKey_,
  getAllClientIds,
  getClientConfigById,
  getConfig,
} from "../../common/config";
import { AppError } from "../../common/errors";
import { formatDate } from "../../common/utils/date";
import { createHash, randomBytes } from "crypto";
import { CouchbaseDB } from "../../database/couchbaseUtils";
import {
  COLLECTIONS,
  EnvKeys,
  SCOPES,
  SYS_ROLES,
  TYPES,
} from "../../common/constants/consts";
import {
  IAccount,
  IAccountResponse,
  IProfile,
} from "../../entities/accountEntity";
import { logger } from "../../common/utils/logger";
import { maskMobile } from "../../common/utils/util";

// const tokenService = new TokenService();

const { jwtRefreshExpiresIn } = getConfig();

const userScope = SCOPES.USER;
const accountCollection = COLLECTIONS.ACCOUNT;
const profileCollection = COLLECTIONS.PROFILE;
const refreshCollection = COLLECTIONS.REFRESH;
const verifyCodeCollection = COLLECTIONS.VERIFY_CODE;

export const getAccountById = async (id: string) => {
  const result = await CouchbaseDB.get(
    userScope,
    accountCollection,
    `${accountCollection}::${id}`
  );
  if (result && result.content) {
    return result.content as IAccount;
  }
};

export const getAccountByMobile = async (
  mobile: string
): Promise<IAccount | null> => {
  try {
    const collectionFullName = CouchbaseDB.getCollectionFullName(
      userScope,
      accountCollection
    );
    const result = await CouchbaseDB.query(
      `
            SELECT a.* FROM ${collectionFullName} AS a 
            WHERE a.type = $type AND a.mobile = $mobile 
            LIMIT 1
            `,
      {
        parameters: {
          type: accountCollection,
          mobile,
        },
      }
    );
    if (result.rows.length > 0) {
      return result.rows[0] as IAccount;
    }
    return null;
  } catch (err) {
    console.error("Error querying account by mobile:", err);
    throw AppError.internal("Database query error");
  }
};

/**
 * get account profile by account id
 * @param accountId 
 * @returns 
 */
export const getAccountProfileById = async (accountId: string, userId: string): Promise<IAccountResponse> => {
  const acount = await getAccountById(accountId);
  if (!acount) {
    throw AppError.notFound("Account not found");
  }
  const profileRes = await CouchbaseDB.get(
    userScope,
    profileCollection,
    `${profileCollection}::${userId}`
  );
  let profile: Partial<IProfile> = {};
  if (profileRes && profileRes.content) {
    profile = { ...profileRes.content } as IProfile;
  }
  const _profile = { ...lo.omit(acount, ['password', "type"]), ...lo.pick(profile, ['nickName'])} as IAccountResponse;
  return _profile;
}  


/**
 *  sign token
 * @param id <string> account id
 * @param option <any> options to include in payload
 * @param expiresIn <string> token expiration time, e.g. '1d', '2h'
 * @returns
 */
const __signToken = (id: string, option?: any, expiresIn?: string) => {
  const jwtSecret = String(_getConfigByKey_("JWT_SECRET", 3)) || "";
  const _expiresIn = expiresIn || _getConfigByKey_("JWT_EXPIRES_IN", 3) || "1d";

  if (!jwtSecret) {
    logger.error("JWT_SECRET is not configured");
    throw AppError.internal();
  }
  if (!_expiresIn) {
    logger.error("JWT_EXPIRES_IN is not configured");
    throw AppError.internal();
  }
  const payload = { ...option, sub: id };
  const access_token = jwt.sign(payload, jwtSecret, { expiresIn: _expiresIn as any });
  // decode to get exp
  const decoded: any = jwt.decode(access_token);
  const expired_at = decoded && decoded.exp ? decoded.exp * 1000 : undefined;
  return {
    access_token,
    expires_in: _expiresIn,
    expired_at,
  };
};

const generateAccessToken = (payload: any) => {
  const { sub, userId, aud, issuer, audience, role } = payload;
  const _payload = {
    sub,
    aud,
    userId,
    issuer: issuer || "booking-app",
    audience: audience || "booking-app-unknown",
    role
  };
  return __signToken(sub, _payload);
};

const generateSecureRefreshToken = (): {
  refresh_token: string;
  hash: string;
  expires_in: string;
} => {
  const refresh_token = randomBytes(20).toString("hex");
  const hash = createHash("sha256").update(refresh_token).digest("hex");

  return { refresh_token, hash, expires_in: jwtRefreshExpiresIn };
};

const generateTokenPair = (payload: any) => {
  const token = generateAccessToken(payload);
  // refresh token 有更长的有效期
  const refreshToken = generateSecureRefreshToken(); //__signToken(id, undefined, _getConfigByKey_('JWT_REFRESH_EXPIRES_IN', 3) || '7d');
  return { token, refreshToken };
};

const getTokenPairCustomer = (id: string, userId: string, clientId: string, role: string) => {
  const payload = {
    sub: id,
    userId,
    issuer: "booking-app",
    audience: "booking-app-users",
    aud: clientId,
    role,
  };
// console.log("Generating customer token with payload:", payload);
  return generateTokenPair(payload);
};

const getTokenPairStaff = (id: string, userId: string, clientId: string, role: string) => {
  const payload = {
    sub: id,
    userId,
    issuer: "booking-system",
    audience: "booking-system-users",
    aud: clientId,
    role,
  };
  return generateTokenPair(payload);
};

const saveRefreshTokenToDB = async (
  accountId: string,
  appClientId: string,
  hash: string,
  expires_in: string
) => {
  await CouchbaseDB.upsert(
    userScope,
    refreshCollection,
    `${COLLECTIONS.REFRESH}::${accountId}::${appClientId}`,
    {
      id: uuidv4(),
      accountId,
      clientId: appClientId,
      tokenHash: hash,
      createdAt: Date.now(),
      expiresAt: expires_in.includes("d")
        ? Date.now() + parseInt(expires_in) * 24 * 60 * 60 * 1000 // days to ms
        : Date.now() + parseInt(expires_in) * 60 * 60 * 1000, // hours to ms
      type: TYPES.REFRESH,
    }
  );
};

export const registerAccount = async (
  mobile: string,
  nickName: string,
  password: string,
  clientId: string
) => {
  const acount = await getAccountByMobile(mobile);
  if (acount) {
    throw AppError.keyAlreadyExists("Mobile number already registered");
  }
  const pwdSalt = _getConfigByKey_(EnvKeys.PWD_SALT, 3);

  if (!pwdSalt) {
    logger.error("PWD_SALT is not configured");
    throw AppError.internal();
  }
  const allowedClient = getAllClientIds().includes(clientId);
  if (!allowedClient) {
    logger.error("Invalid clientId:", clientId);
    throw AppError.paramsError("invalid client id");
  }
  // const appClientId = _getConfigByKey_(EnvKeys.CUSTOMER_CLIENT_ID, 3);
  // if (!appClientId) {
  //     console.error('CUSTOMER_CLIENT_ID is not configured');
  //     throw AppError.internal();
  // }
  const hashedPassword = await bcrypt.hash(password, pwdSalt);
  const createdAt = Date.now();

  const accountId = uuidv4();
  const issuer = getClientConfigById(clientId)?.clientName || "unknown";
  const userId = uuidv4();
  const newAccount: IAccountResponse = {
    id: accountId,
    mobile,
    password: hashedPassword,
    role: "customer",
    status: "active",
    userId,
    createdAt,
    updatedAt: createdAt,
    type: COLLECTIONS.ACCOUNT,
    lastLogin: createdAt,
    issuer,
  };

  // save account to DB
  const re = await CouchbaseDB.upsert(
    userScope,
    accountCollection,
    `${accountCollection}::${accountId}`,
    newAccount
  );
  // console.log('CouchbaseDB upsert result:', re);

  // save user profile to DB
  const profile: IProfile = {
    id: userId,
    accountId,
    nickName,
    createdAt,
    updatedAt: createdAt,
    type: profileCollection,
  };
  await CouchbaseDB.upsert(
    userScope,
    profileCollection,
    `${profileCollection}::${userId}`,
    profile
  );
  newAccount.nickName = nickName;
  // don't return password
  const safeAccount = {
    ...lo.omit(newAccount, [
      "type",
      "password",
      "lastLogin",
      "issuer",
    ]),
    mobile: maskMobile(mobile),
    userId,
  } as IAccountResponse;

  // const t1 = tokenService.generateAccessToken(payload);
  // console.log('Generated Access Token t1:', t1);
  // refresh token 有更长的有效期
  const {
    token,
    refreshToken: { refresh_token, hash, expires_in },
  } = getTokenPairCustomer(accountId, userId, clientId, "customer");
  // save refresh_token hash to DB
  saveRefreshTokenToDB(accountId, clientId, hash, expires_in).catch((err) => {
    logger.error("Error saving refresh token to DB:", err);
  });
  // const t2 = tokenService.generateRefreshToken(accountId);
  // console.log('Generated Refresh Token t2:', t2);
  //
  return {
    user: safeAccount,
    token: {
      ...token,
      refresh_token,
    },
  };
};

/**
 * 登录类型
 * - phone: 手机号+密码
 * - sms: 手机号+验证码
 * - qrcode: 扫码登录
 */
type LoginType = "phone" | "sms" | "qrcode";

/**
 * 登录参数
 */
interface ILoginParams {
  mobile: string;
  password?: string;
  smsCode?: string;
  qrcodeToken?: string;
  type: LoginType;
  clientId: string; // 可选，默认为 CUSTOMER_CLIENT_ID
}

interface ISmsCodeRecord {
  code: string;
  expiresAt: number;
}

// 简单内存验证码存储，仅用于演示
const smsCodeStore: Record<string, ISmsCodeRecord> = {};

/**
 * 短信验证码 限流、存储，模拟发送
 */
export const sendSmsCode = async (mobile: string) => {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const key = `${verifyCodeCollection}::${mobile}`;
  const res = await CouchbaseDB.get(userScope, verifyCodeCollection, key);

  let record: any = res?.content || {};

  // 限制参数
  const MAX_PER_DAY = 5;
  const MIN_INTERVAL = 60000; // 60秒

  // 校验日期
  if (record.date !== today) {
    record.sendCount = 0;
    record.date = today;
  }
  // 校验次数，长时间（24小时）限流
  if (record.sendCount >= MAX_PER_DAY) {
    throw AppError.periodLimiting(
      "today's verification code request limit reached"
    );
  }
  // 校验最小间隔
  if (record.lastSentAt && now - record.lastSentAt < MIN_INTERVAL) {
    throw AppError.tempLimiting(
      "verification code requests are too frequent, please try again later"
    );
  }

  // 生成验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 5 * 60 * 1000;

  const currentCount = (record.sendCount || 0) + 1;
  // 更新记录
  record = {
    code,
    expiresAt,
    lastSentAt: now,
    sendCount: currentCount,
    date: today,
    sum: (record.sum || 0) + 1,
    // 剩余次数
    remaining: MAX_PER_DAY - currentCount,
  };
  await CouchbaseDB.upsert(userScope, verifyCodeCollection, key, record, {
    expiry: 7776000,
  }); // 90天TTL

  // 发送短信逻辑...
  console.log(
    `[模拟短信] 向 ${mobile} 发送验证码: ${code}, 过期时间: ${formatDate(
      expiresAt
    )}`
  );

  return lo.omit(record, ["lastSentAt", "sendCount", "sum"]);
};

/**
 * 校验短信验证码
 */
const verifySmsCode = async (mobile: string, code: string) => {
  const key = `${verifyCodeCollection}::${mobile}`;
  const res = await CouchbaseDB.get(userScope, verifyCodeCollection, key);
  const record = res?.content;
  if (!record) return false;

  let isValid = false;
  let codeClearReason = "expired";

  if (Date.now() <= record.expiresAt) {
    isValid = record.code === code;
    if (isValid) codeClearReason = "verified";
  }

  // 验证码过期或验证成功都要清空验证码相关字段，保留限流信息
  if (Date.now() > record.expiresAt || isValid) {
    await CouchbaseDB.upsert(userScope, verifyCodeCollection, key, {
      ...record,
      code: undefined,
      expiresAt: undefined,
      codeClearedAt: Date.now(),
      codeClearReason,
    });
  }

  return isValid;
};

/**
 * login account
 * @param params 
 * @returns 
 */
export const loginAccount = async (params: ILoginParams) => {
  const { mobile, password, smsCode, qrcodeToken, type, clientId } = params;
  if (!mobile) throw AppError.paramsError("missing mobile number");
  if (!type) throw AppError.paramsError("missing login type");
  if (!clientId) throw AppError.paramsError("missing client id");

  // check clientId
  const allowedClientIds = getAllClientIds();
  if (allowedClientIds.length === 0) {
    console.error("No client IDs are configured");
    throw AppError.internal("No client IDs are configured");
  }
  if (!allowedClientIds.includes(clientId)) {
    logger.error("Invalid clientId:", clientId);
    throw AppError.paramsError("invalid client id");
  }

  const account = await getAccountByMobile(mobile);
  if (!account) throw AppError.notFound("this account does not exist");

  // admin client cannot be used for non-admin accounts
  if (!['admin', 'staff'].includes(account.role) && clientId === _getConfigByKey_(EnvKeys.ADMIN_CLIENT_ID, 3)) {
    logger.warn(`Account  mobile: [${mobile}] is not allowed to use admin client, role [${account.role}]`);
    throw AppError.forbidden("This account is undefined or this system cannot be used for this account, please contact support!");
  }

  if (type === "phone") {
    if (!password) throw AppError.paramsError("missing password");
    const ok = await bcrypt.compare(password, account.password);
    if (!ok) throw AppError.paramsError("mobile or password invalid");
  } else if (type === "sms") {
    if (!smsCode) throw AppError.paramsError("missing sms code");
    const ok = await verifySmsCode(mobile, smsCode);
    if (!ok) throw AppError.paramsError("mobile or sms code invalid");
  } else {
    // if (type === 'qrcode') {
    //     if (!qrcodeToken) throw new Error('缺少扫码凭证');
    //     const ok = await verifyQrcode(qrcodeToken);
    //     if (!ok) throw new Error('扫码无效');
    //     return account;
    // }

    throw AppError.forbidden("not supported login type");
  }

  if (account.status !== "active") {
    throw AppError.forbidden("account is not active");
  }
  const { id: accountId, userId } = account;
  if (!accountId || !userId) {
    throw AppError.internal("Account ID or User ID is missing");
  }
  account.lastLogin = Date.now();
  // update lastLogin
  await CouchbaseDB.upsert(
    userScope,
    accountCollection,
    `${accountCollection}::${accountId}`,
    account
  );

  let safeAccount = {
    ...lo.omit(account, [
      "type",
      "password",
      "lastLogin",
      "issuer",
    ]),
    mobile: maskMobile(mobile),
  };
  const profileResult = await CouchbaseDB.get(
    userScope,
    profileCollection,
    `${COLLECTIONS.PROFILE}::${userId}`
  );
  if (profileResult && profileResult.content) {
    const profile = profileResult.content as IProfile;
    // safeAccount['nickName'] = profile.nickName;
    safeAccount = {
      ...safeAccount,
      ...lo.pick(profile, ["nickName", "avatarUrl"]),
    };
  }

  logger.info(`Client ID: ${clientId}`);
  logger.info(`Is staff role: ${Object.values(SYS_ROLES).includes(account.role)}, role: ${account.role}`);

  // 如果 clientId 属于 staff client，则生成 staff token, 否则生成 customer token
  const {
    token,
    refreshToken: { refresh_token, hash, expires_in },
  } = (clientId === _getConfigByKey_(EnvKeys.ADMIN_CLIENT_ID, 3) && Object.values(SYS_ROLES).includes(account.role)) ?
    getTokenPairStaff(accountId, userId, clientId, account.role) :
    getTokenPairCustomer(accountId, userId, clientId, account.role);

  // save refresh_token hash to DB
  saveRefreshTokenToDB(accountId as string, clientId, hash, expires_in).catch(
    (err) => {
      logger.error("Error saving refresh token to DB:", err);
    }
  );
  return {
    user: safeAccount,
    token: {
      ...token,
      refresh_token,
    },
  };
};

/**
 * refresh token
 * @param oldRefreshToken 
 * @param accountId 
 * @param clientId 
 * @returns 
 */
export const getTokenByResfreshToken = async (oldRefreshToken: string, accountId: string, clientId: string) => {

    if (!oldRefreshToken) {
        throw AppError.paramsError('missing refresh token');
    }
    // query account and check status
    const account = await CouchbaseDB.get(userScope, accountCollection, `${accountCollection}::${accountId}`);
    if (!account || !account.content) {
        throw AppError.notFound('this account does not exist');
    }
    const acc = account.content as IAccount;
    if (acc.status !== 'active') {
        throw AppError.forbidden('account is not active');
    }

    const { userId, mobile } = acc;
    if (!userId) {
        throw AppError.internal('User ID is missing');
    }

    const codeObj = await CouchbaseDB.get(userScope, refreshCollection, `${COLLECTIONS.REFRESH}::${accountId}::${clientId}`);

    if (!codeObj || !codeObj.content) {
        throw AppError.paramsError('invalid refresh token');
    }
    const record = codeObj.content;
    if (record.expiresAt < Date.now()) {
        throw AppError.unauthorized('refresh token expired, please login again');
    }
    const oldHash = createHash('sha256').update(oldRefreshToken).digest('hex');
    if (oldHash !== record.tokenHash) {
        throw AppError.unauthorized('invalid refresh token');
    }

    if (clientId !== record.clientId) {
        throw AppError.unauthorized('client id is not match');
    }
    
      // 如果 clientId 属于 staff client，则生成 staff token
    const {
        token,
        refreshToken: { refresh_token, hash, expires_in },
    } = (clientId === _getConfigByKey_(EnvKeys.ADMIN_CLIENT_ID, 3) && Object.values(SYS_ROLES).includes(acc.role)) ?
        getTokenPairStaff(accountId, userId, clientId, acc.role) :
        getTokenPairCustomer(accountId, userId, clientId, acc.role);

    let returnRefreshToken = oldRefreshToken;
    // 如果开启了 refresh token 轮转，则返回新的 refresh token，并更新 DB
    if (process.env.ROTATING_REFRESH_TOKENS === 'true') {
        returnRefreshToken = refresh_token;
         // save refresh_token hash to DB
        saveRefreshTokenToDB(accountId as string, clientId, hash, expires_in).catch(
            (err) => {
            logger.error("Error saving refresh token to DB:", err);
            }
        );
    } else {
        // 否则更新旧的 refresh token 的 issued 计数和最后颁发时间
        await CouchbaseDB.upsert(userScope, refreshCollection, `${COLLECTIONS.REFRESH}::${accountId}::${clientId}`, {
            ...record,
            accessTokenIssuedCount: (record.accessTokenIssuedCount || 0) + 1,
            lastAccessTokenIssuedAt: Date.now(),
        });
    }

    return {
        ...token,
        refresh_token: returnRefreshToken,
    };
};

/**
 * logout account
 * @param accountId 
 * @param clientId 
 * @returns 
 */
export const logoutAccount = async (accountId: string, clientId: string) => {
    if (!accountId) {
        throw AppError.paramsError('missing accountId');
    }
    if (!clientId) {
        throw AppError.paramsError('missing clientId');
    }
    // 获取 refresh token 记录
    const key = `${COLLECTIONS.REFRESH}::${accountId}::${clientId}`;
    const res = await CouchbaseDB.get(userScope, refreshCollection, key);
    if (!res || !res.content) {
        // 已经不存在也可以视为登出成功
        return true;
    }
    // 标记登出时间，并使 refreshToken 失效
    await CouchbaseDB.upsert(userScope, refreshCollection, key, {
        ...res.content,
        loggedOutAt: Date.now(),
        tokenHash: undefined, // 使 refreshToken 失效
        expiresAt: Date.now(), // 立即过期
        status: 'logged_out'
    });
    return true;
};
