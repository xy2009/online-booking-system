# 设置node版本 默认为 20
ARG NODE_VERSION=20


# 多阶段构建
FROM node:${NODE_VERSION}-alpine AS builder

ARG NODE_ENV=${NODE_ENV}
ARG DB_HOST=${DB_HOST}

# 设置工作目录
WORKDIR /app

COPY package*.json ./
# COPY config/env/* ./config/env
# 复制依赖和源码
COPY . .

RUN npm install

# # 复制源代码
# COPY . .

# 构建服务端应用
RUN npm run build

# 清理不必要的文件
# RUN rm -rf src tests


EXPOSE 3030


CMD ["npm", "run", "start"]