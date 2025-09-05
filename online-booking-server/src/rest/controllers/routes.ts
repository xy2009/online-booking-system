import { Router } from "express";

import { accountPublicHandlerServices, accountProtectedHandlerServices }from "./account";

// 公开路由
const publicRouter = Router();
// 受保护路由
const protectedRouter = Router();

// 公开路由（注册、登录等）
accountPublicHandlerServices(publicRouter, { publicOnly: true });
// 这里可以挂载更多的公开路由
accountProtectedHandlerServices(protectedRouter);

export {
    publicRouter,
    protectedRouter
};
// 需要认证的路由


