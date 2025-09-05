# Couchbase Docker 部署说明

## 目录结构

- `docker-compose.yml`：Couchbase 服务编排文件
- `data/`：Couchbase 数据持久化目录
- `init/`：初始化脚本目录（如 `init.sh`）

## 部署步骤

1. 安装 Docker
   - 请确保本地已安装 Docker。

2. 配置环境变量（可选）
   - 默认管理员用户名和密码分别为 `admin` 和 `admin123`。
   - 如需自定义，可在运行前设置环境变量：
     ```sh
     export COUCHBASE_ADMINISTRATOR_USERNAME=your_username
     export COUCHBASE_ADMINISTRATOR_PASSWORD=your_password
     ```

3. 启动 Couchbase 服务
   - 在 `couchbase-docker` 目录下执行：
     ```sh
     docker-compose up -d
     ```
   - 这将启动 Couchbase 容器并挂载数据和初始化脚本。

4. 访问 Couchbase Web UI
   - 打开浏览器访问 [http://localhost:8091](http://localhost:8091)
   - 使用上述用户名和密码登录创建集群，即可登录使用

5. 初始化脚本
   - `init/` 目录下的脚本会在容器启动时自动执行。
   - 可根据需要修改 `init.sh` 实现自定义初始化。
   - 如需批量初始化数据库结构，可将 N1QL 语句写入 `init/init.sql`，容器启动时会自动执行该 SQL 文件。
   - 示例：`init.sql` 可用于创建 bucket、scope、collection 及索引等，详见 `online-booking-server/src/database/db.sql`。

6. 停止服务
   - 执行：
     ```sh
     docker-compose down
     ```

## 端口说明
- 8091-8096：Web UI、查询、索引、搜索、分析
- 11210：数据节点（服务端使用）

## 数据持久化
- 数据存储在 `data/` 目录，容器重启数据不丢失。

## 常见问题
- 如遇端口冲突，请检查本地端口占用。
- 如需重置数据，清空 `data/` 目录后重启容器。

---
如有疑问请查阅官方文档或联系项目维护者。
