// 加载环境变量
import dotenv from "dotenv";
const envFile = process.env.NODE_ENV
  ? `config/env/.env.${process.env.NODE_ENV}`
  : "config/env/.env";
dotenv.config({ path: envFile });

import express, { RequestHandler } from "express";
// import { json } from "body-parser";
import cors from "cors";

import { AppError } from "./common/errors/index";
import { authMiddleware } from "./rest/middlewares/authMiddleware";
import { publicRouter, protectedRouter } from "./rest/controllers/routes";
import { logger } from "./common/utils/logger";
import {
  requestLogger,
  requestContorller,
} from "./common/middlewares/requestMiddleware";

import { swaggerSpec, swaggerUi } from './swagger';
import { createGraphQLMiddleware } from "./graphql/middleware/graphQLMiddleware";

const app = express();

const isDev = process.env.NODE_ENV === "development";

// Middleware setup
app.use(cors());
app.use(express.json());
// To handle URL-encoded data
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("AFTER JSON:", req.path, req.body);
  next();
});

// 注册 GraphQL 中间件（同步注册，保证顺序）
(async () => {
  const gqlMiddleware = await createGraphQLMiddleware();
  app.use("/graphql", gqlMiddleware);
})();

app.use(requestContorller);

// 全局请求日志中间件
app.use(requestLogger);
// 静态资源优先
app.use(express.static("public"));

logger.info(`Using environment file: ${envFile}`);

// 公开路由（注册、登录等）
app.use("/api", publicRouter);

// Example route
// app.get("/health", (req, res) => {
//   res.json({ status: "OK", timestamp: new Date().toISOString() });
// });

// Swagger UI, 仅开发环境开放
if (isDev) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// 认证中间件
app.use(authMiddleware);
// 需要认证的路由
app.use("/api", protectedRouter);

// 根据环境加载不同配置（示例）
// if (process.env.NODE_ENV) {
//   logger.info(`Current environment: ${process.env.NODE_ENV}`);
// }

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof AppError) {
      return AppError.handleError(err, res);
    }
    return AppError.handleUnknownError(err, res);
  }
);


export default app;