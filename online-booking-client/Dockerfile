# 打包在线预订系统前端应用的Dockerfile，使用多阶段构建，并基于nginx镜像运行
# 构建时可以通过 --build-arg 参数传递 APP_NAME 和 NODE_VERSION 变量，实现不同应用和Node版本的构建
# 例如： docker build --build-arg APP_NAME=customer --build-arg NODE_VERSION=18 -t online-booking-client .


# 设置node版本 默认为 20
ARG NODE_VERSION=20


# 多阶段构建
FROM node:${NODE_VERSION}-alpine AS builder

# 设置应用名称 默认为 customer
ARG APP_NAME=customer

ARG NODE_ENV=${NODE_ENV:-production}


# 设置工作目录
WORKDIR /app

# 复制package.json文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# 复制依赖和源码
# COPY package.json package-lock.json ./
COPY apps/${APP_NAME}/package*.json ./apps/${APP_NAME}/
COPY apps/${APP_NAME} ./apps/${APP_NAME}
COPY packages ./packages
COPY nginx ./nginx

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile
# RUN npm install

RUN ls -al apps/${APP_NAME}
RUN cat apps/${APP_NAME}/package.json

# 需要先在本地执行， 生成或更新 .pnpm-allow-scripts.json 文件，之后 Docker 构建不会再阻断
# pnpm approve-builds
# pnpm 批准命令
RUN pnpm approve-builds


# 复制源代码
COPY . .

# # 构建客户端应用
RUN pnpm --filter ./apps/${APP_NAME} build


# 生产阶段
FROM nginx:alpine

# 设置应用名称 默认为 customer， 用于构建时设置，否则会因丢失 APP_NAME 变量导致构建失败
ARG APP_NAME=customer

# 复制构建产物到nginx
COPY --from=builder /app/apps/${APP_NAME}/dist /usr/share/nginx/html

# 复制nginx配置
COPY apps/${APP_NAME}/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
