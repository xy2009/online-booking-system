// 操作account相关的服务,挂载在 /account route下

import { Router } from "express";
import { validationResult } from "express-validator";
import { Request } from "express-validator/lib/base";

import {
  registerAccount,
  loginAccount,
  sendSmsCode,
  getTokenByResfreshToken,
  logoutAccount,
} from "../services/accoutService";
import { sendSuccess, sendError } from "../../common/utils/http";
import {
  registerValidator,
  loginValidator,
  sendSmsValidator,
  refreshTokenValidator,
  logoutValidator,
} from "../validators/accountValidator";
import { getCallerIp } from "../../common/utils/network";
import { logger } from "../../common/utils/logger";

export const accountPublicHandlerServices = (
  router: Router,
  options?: { publicOnly?: boolean }
) => {
/**
   * @openapi
   * /api/v1/auth/register:
   *   post:
   *     tags:
   *       - Auth
   *     summary: 用户注册
   *     description: 注册新用户账号
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               mobile:
   *                 type: string
   *                 example: "1234567890"
   *               nickName:
   *                 type: string
   *                 example: "JohnDoe"
   *               password:
   *                 type: string
   *                 example: "securePassword"
   *     responses:
   *       200:
   *         description: 注册成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "register success"
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   *                       properties:
   *                         accountId:
   *                           type: string
   *                           example: "e886fe64-2f61-4b20-a36e-dc46636091ef"
   *                         createdAt:
   *                           type: integer
   *                           example: 1756734052729
   *                         mobile:
   *                           type: string
   *                           example: "131****5678"
   *                         role:
   *                           type: string
   *                           example: "customer"
   *                         status:
   *                           type: string
   *                           example: "active"
   *                         updatedAt:
   *                           type: integer
   *                           example: 1756734052729
   *                         userId:
   *                           type: string
   *                           example: "0ee87c04-d648-40d3-85b8-e0856f3a6e7a"
   *                         nickName:
   *                           type: string
   *                           example: "xx 先生"
   *                     token:
   *                       type: object
   *                       properties:
   *                         access_token:
   *                           type: string
   *                           example: "eyJhbGciOi"
   *                         expires_in:
   *                           type: string
   *                           example: "1d"
   *                         expired_at:
   *                           type: integer
   *                           example: 1756847870000
   *                         refresh_token:
   *                           type: string
   *                           example: "bab3579ecbf7043baefd0477444ab2c3646fe773"
   *       402:
   *         description: 参数错误或用户已存在
   */
  router.post(
    "/v1/auth/register",
    registerValidator,
    async (req: Request, res: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(
          res,
          "parameter validation failed",
          402,
          errors.array()
        );
      }
      const clientId = req.headers?.["client-id"];

      const { mobile, nickName, password } = req.body;
      const re = await registerAccount(mobile, nickName, password, clientId);

      sendSuccess(res, re, "register success");
    }
  );

  /**
   * @openapi
   * /api/v1/auth/login:
   *   post:
   *     tags:
   *       - Auth
   *     summary: 用户登录
   *     description: 通过手机号+密码、验证码或扫码登录
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               mobile:
   *                 type: string
   *                 example: "13100001111"
   *               password:
   *                 type: string
   *                 example: "123456"
   *               smsCode:
   *                 type: string
   *                 example: "123456"
   *               qrcodeToken:
   *                 type: string
   *                 example: "qrcode-xxx"
   *               type:
   *                 type: string
   *                 example: "phone"
   *                 description: 登录方式（phone/sms/qrcode）
   *     responses:
   *       200:
   *         description: 登录成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "login success"
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   *                     token:
   *                       type: object
   *       402:
   *         description: 参数错误或认证失败
   */
  router.post(
    "/v1/auth/login",
    loginValidator,
    async (req: Request, res: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(
          res,
          "parameter validation failed",
          402,
          errors.array()
        );
      }
      const clientId = req.headers?.["client-id"];
      const { mobile, password, smsCode, qrcodeToken, type } = req.body;
      const re = await loginAccount({
        mobile,
        password,
        smsCode,
        qrcodeToken,
        type,
        clientId,
      });
      sendSuccess(res, re, "login success");
    }
  );


  /**
   * @openapi
   * /api/v1/auth/send-sms:
   *   post:
   *     tags:
   *       - Auth
   *     summary: 发送短信验证码
   *     description: 发送短信验证码到指定手机号
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               mobile:
   *                 type: string
   *                 example: "13100001111"
   *     responses:
   *       200:
   *         description: 发送成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "SMS code sent successfully"
   *                 data:
   *                   type: object
   *       402:
   *         description: 参数错误
   */
  router.post(
    "/v1/auth/send-sms",
    sendSmsValidator,
    async (req: Request, res: any) => {
      console.log("Send SMS request received:", req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(
          res,
          "parameter validation failed",
          402,
          errors.array()
        );
      }
      // 这里可以添加频率限制等逻辑
      const clientId = req.headers?.["client-id"];
      // 获取调用端的IP地址
      const userIp = getCallerIp(req);
      const { mobile } = req.body;
      // 记录日志
      logger.info(
        `Request to send SMS request from IP: ${userIp}, clientId: ${clientId}, mobile: ${mobile}`
      );

      // 业务逻辑
      // 1. 生成验证码
      // 2. 存储验证码（可以存储在内存、数据库或缓存中，设置过期时间）
      // 3. 调用第三方服务发送短信（此处模拟发送）

      // 调用发送短信验证码服务
      const re = await sendSmsCode(mobile);
      sendSuccess(res, re, "SMS code sent successfully");
    }
  );

  /**
   * @openapi
   * /api/v1/auth/refresh-token:
   *   post:
   *     tags:
   *       - Auth
   *     summary: 刷新token
   *     description: 使用refreshToken刷新accessToken
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               accountId:
   *                 type: string
   *                 example: "e886fe64-2f61-4b20-a36e-dc46636091ef"
   *               refreshToken:
   *                 type: string
   *                 example: "bab3579ecbf7043baefd0477444ab2c3646fe773"
   *     responses:
   *       200:
   *         description: 刷新成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "token refreshed successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: object
   *       402:
   *         description: 参数错误或refreshToken无效
   */
  router.post(
    "/v1/auth/refresh-token",
    refreshTokenValidator,
    async (req: Request, res: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(
          res,
          "parameter validation failed",
          402,
          errors.array()
        );
      }
      const clientId = req.headers?.["client-id"];
      const { accountId, refreshToken } = req.body;
      const re = await getTokenByResfreshToken(
        refreshToken,
        accountId,
        clientId
      );
      sendSuccess(res, re, "token refreshed successfully");
    }
  );

  // router.post("/v1/password/forgot", async (req, res) => {
  //   // 忘记密码逻辑
  //   res.json({ message: "重置密码链接已发送到您的邮箱" });
  // });

  // router.post("/v1/password/reset", async (req, res) => {
  //   // 重置密码逻辑
  //   res.json({ message: "密码重置成功" });
  // });

  return router;
};

/**
 *
 * @param router express.Router
 */
export const accountProtectedHandlerServices = (router: Router) => {
  /**
 * @openapi
 * /api/v1/auth:
 *   delete:
 *     tags:
 *       - Auth
 *     summary: 用户登出
 *     description: 退出登录，refreshToken失效
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: 登出成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
   *                   type: string
   *                   example: "logout success"
   *                 data:
   *                   type: string
   *                   example: "ok"
   *       401:
   *         description: 未授权
   *       402:
   *         description: 参数错误
   *       500:
   *         description: 登出失败
 */
  router.delete("/v1/auth", logoutValidator, async (req: Request, res: any) => {
    // console.log('Logout request received:', req.user, req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "parameter validation failed", 402, errors.array());
    }
    const _clientId = req.headers?.["client-id"];

    const { id: accountId, clientId } = req.user;
    if (!accountId) {
      return sendError(res, "accountId is required", 402);
    }
    // clientId 可以来自请求头，也可以来自 authMiddleware 解码后的token
    if (!clientId || !_clientId || clientId != _clientId) {
      return sendError(res, "clientId is not valid", 402);
    }
    const finalClientId = clientId || _clientId;
    // 调用登出服务
    // 这里可以做一些清理工作，比如在数据库中标记token为无效等
    const re = await logoutAccount(accountId, clientId);
    if (re) {
      sendSuccess(res, "ok", "logout success");
    } else {
      sendError(res, "logout failed", 500);
    }
  });

  return router;
};
