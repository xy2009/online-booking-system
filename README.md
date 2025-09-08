# 在线预订系统

一个在线预订管理系统，采用前后端分离模式开发，支持客户端预订和管理端操作。

## 1. 需求概述
### 1.1 核心功能需求
1. 客户功能
    - 账号注册/登录/登出
    - 餐桌查询与可用性检查
    - 预订创建/修改/取消
    - 个人预订历史查看
2. 服务人员功能
    - 管理端登录认证
    - 预订管理（查看/确认/修改）
    - 餐桌状态管理
    - 客户信息查看
3. 系统管理功能
    - 角色权限控制
    - 数据监控与分析
    - 系统配置管理

## 技术栈选型
### 1.服务端

- **运行时**：Node.js + Typescript
- **Web框架**：Express.js
- **GraphQL**：Apollo server + GraphQL Code Generator
- **数据库**：Couchbase
- **认证**：JWT + bcrypt
- **验证**：class-validator + class-transformer
- **测试**：Jest + Surptest
- **部署**：Docker

### 2.前端

- **前端框架**: SolidJS
- **构建工具**: Vite
- **样式方案**: CSS Modules
- **状态管理**: SolidJS Signals
- **路由**: @solidjs/router
- **包管理**: pnpm + workspaces
- **容器化**: Docker + Docker Compose

#### 注：启动参数配置等 详情请进入子项目进行查看READMEN.md