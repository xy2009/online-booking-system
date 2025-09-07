# 多阶段构建
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/*/package.json ./packages/*/

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建管理端应用
RUN pnpm --filter admin build

# 生产阶段
FROM nginx:alpine

# 复制构建产物到nginx
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# 复制nginx配置
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
