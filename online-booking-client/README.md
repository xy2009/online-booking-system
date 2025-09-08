# 在线预订系统

一个基于SolidJS的现代化餐厅预订管理系统，采用monorepo架构，支持客户端预订和管理端操作。

## 🚀 快速开始

注：启动前参数配置，项目使用`.env`对启动参数进行配置，说明如下

1. 因使用monorepo架构，启动参数需要在不同子项目下进行配置
2. 管理端 子项目根路径：`online-booking-client/apps/admin`，在根路径下找到模版配置文件`online-booking-client/apps/admin/.env.example`, 将此文件进行复制粘贴在同级目录下，开发环境重命名为`.env.development`;测试环境重命名为`.env.test`; 生产环境重名为`.env.product`; 
3. 同理，客户端 子项目根路径：`online-booking-client/apps/customer`，在根路径下找到模版配置文件`online-booking-client/apps/customer/.env.example`, 将此文件进行复制粘贴在同级目录下，开发环境重命名为`.env.development`;测试环境重命名为`.env.test`; 生产环境重名为`.env.product`; 
4. 因配置内容需要和服务端同步修改，各端验证调试可以不做修改，避免参数有误，运行异常

### 开发环境

```bash
# 安装依赖
pnpm install
# 注：请分别进入客户端子项目安装依赖，不然启动会报错
cd apps/customer && pnpm install
cd apps/admin && pnpm install
# 此公用模块也有用到，依赖也需要安装
cd packages/api-client && pnpm install

# 一键启动 两个端
# 根目录运行
pnpm run dev

# 启动客户端 (默认端口 3000，根据端口占用情况，可能会变)
cd apps/customer && pnpm run dev
# 也可以在根目录运行以下命令启动客户端
pnpm run dev:customer

# 启动管理端 (默认端口 3001，根据端口占用情况，可能会变)
cd apps/admin && pnpm run dev
# 也可以在根目录运行以下命令启动管理端
pnpm run dev:admin

```

### Docker部署 -- 目前暂未完成调试 --

#### 1. 构建和启动所有服务

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 2. 访问应用

- **客户端**: http://localhost:3000
- **管理端**: http://localhost:3001
- **Nginx代理**: http://localhost (客户端) 和 http://admin.localhost (管理端)

#### 3. 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

## 📁 项目结构

```
online-booking-client/
├── apps/
│   ├── customer/           # 客户端应用
│   │   ├── src/           # 源代码
│   │   ├── Dockerfile     # Docker构建文件
│   │   └── nginx.conf     # Nginx配置
│   └── admin/             # 管理端应用
│       ├── src/           # 源代码
│       ├── Dockerfile     # Docker构建文件
│       └── nginx.conf     # Nginx配置
├── packages/
│   ├── api-client/        # API客户端
│   ├── shared-ui/         # 共享UI组件
│   └── shared-utils/      # 共享工具函数
├── nginx/
│   └── nginx.conf         # 反向代理配置
├── docker-compose.yml     # Docker编排文件
└── docs/                  # 项目文档
```

## ✅ 已完成功能

### 客户端应用
- ✅ 用户注册/登录系统
- ✅ 预订功能（选择分店、日期、时间、人数）
- ✅ 预订历史查看和管理
- ✅ 响应式设计
- ✅ 完整的状态管理和常量维护

### 管理端应用
- ✅ 管理员登录系统
- ✅ 预订管理（查看、修改状态、删除）
- ✅ 桌位管理（状态切换、清理桌位）
- ✅ 分店管理（信息编辑、状态管理）

<!-- 暂未完成 -->
- 仪表盘（统计数据展示）
- 完整的权限控制和常量维护

### 共享包架构
- ✅ `packages/api-client`: GraphQL和REST API客户端
- ✅ `packages/shared-ui`: 共享UI组件
- ✅ `packages/shared-utils`: 工具函数和验证规则
- ✅ 完整的monorepo结构和依赖管理

## 🔧 技术栈

- **前端框架**: SolidJS
- **构建工具**: Vite
- **样式方案**: CSS Modules
- **状态管理**: SolidJS Signals
- **路由**: @solidjs/router
- **包管理**: pnpm + workspaces
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx

## 🐳 Docker部署详解

### 服务架构

1. **customer-app**: 客户端应用容器 (端口 3000)
2. **admin-app**: 管理端应用容器 (端口 3001)
3. **nginx**: 反向代理服务器 (端口 80/443)

### 部署流程

1. **多阶段构建**: 使用Node.js构建应用，然后使用Nginx提供静态文件服务
2. **反向代理**: Nginx根据域名路由到不同的应用
3. **健康检查**: 每个服务都提供 `/health` 端点用于健康检查
4. **安全配置**: 包含安全头和Gzip压缩

### 生产环境配置

#### 域名配置

修改 `nginx/nginx.conf` 中的域名配置：

```nginx
# 客户端
server_name your-domain.com;

# 管理端  
server_name admin.your-domain.com;
```

#### HTTPS配置

1. 将SSL证书放置在 `nginx/ssl/` 目录
2. 取消注释 `nginx/nginx.conf` 中的HTTPS配置
3. 重新启动服务

#### 环境变量

在 `docker-compose.yml` 中配置环境变量：

```yaml
environment:
  - NODE_ENV=production
  - API_BASE_URL=https://api.your-domain.com
```

## 📋 功能简化清单

为了节省开发成本，以下功能采用了简化实现：

1. **数据持久化**: 使用模拟数据，未连接真实后端API
2. **用户认证**: 使用localStorage模拟，未实现JWT验证
3. **图片上传**: 未实现文件上传功能
4. **支付集成**: 未集成第三方支付系统
5. **短信通知**: 未实现短信提醒功能
6. **邮件通知**: 未实现邮件通知系统
7. **数据导出**: 未实现Excel/PDF导出功能
8. **高级搜索**: 仅实现基础搜索功能
9. **数据统计图表**: 使用简单数字展示替代图表
10. **多语言支持**: 仅支持中文界面

## 🛠️ 开发指南

### 添加新功能

1. 在对应的 `apps/` 目录下开发
2. 共享代码放在 `packages/` 目录
3. 更新常量文件维护代码一致性
4. 添加相应的CSS模块样式

### 构建和测试

```bash
# 构建所有应用
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint
```

### 部署到生产环境

1. 更新域名配置
2. 配置SSL证书
3. 设置环境变量
4. 运行 `docker-compose up -d --build`

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。

---

系统已具备完整的预订管理功能，可以进行客户预订、管理员操作等核心业务流程。所有代码都遵循了良好的架构设计和常量管理最佳实践。
