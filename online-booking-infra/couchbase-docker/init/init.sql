--- 创建 bucket
CREATE BUCKET `online-booking` WITH {
-- 分配给该 bucket 的内存配额为 100MB。 根据实际需求调整此值。
  "ramQuotaMB": 100,
-- 指定 bucket 类型为 Couchbase（支持持久化和分布式缓存）。
  "bucketType": "couchbase",
-- 允许通过管理界面或命令清空 bucket 数据（开发环境常用，生产环境建议关闭）。
  "flushEnabled": true,
-- 设置副本数量为 1，表示数据将有一个副本以提高数据的可靠性。 根据集群节点数量调整此值。
  "replicaNumber": 1,
-- 设置 bucket 的最大生存时间为 0，表示数据不会自动过期。 根据需求调整此值。
  "maxTTL": 0,
-- 启用被动压缩模式，只有在需要时才压缩数据。
  "compressionMode": "passive"
};

-- 创建 scope 
-- 按照模块划分 scope
-- user: 用户相关数据
CREATE SCOPE `online-booking`.`user`;
-- business: 业务相关数据
CREATE SCOPE `online-booking`.`business`;
-- org: 组织机构相关数据
CREATE SCOPE `online-booking`.`org`;
-- system: 系统相关数据
CREATE SCOPE `online-booking`.`system`;

-- 创建 COLLECTION 
-- 按照实体划分 collection
-- user scope 下的 collection
-- account: 账号信息
CREATE COLLECTION `online-booking`.`user`.`account`;
-- profile: 个人资料
CREATE COLLECTION `online-booking`.`user`.`profile`;
-- refresh_token: 刷新令牌
CREATE COLLECTION `online-booking`.`user`.`refresh_token`;
-- verify_code: 验证码
CREATE COLLECTION `online-booking`.`user`.`verify_code`;

-- business scope 下的 collection
-- table: 餐桌信息
CREATE COLLECTION `online-booking`.`business`.`table`;
-- booking: 预订信息
CREATE COLLECTION `online-booking`.`business`.`booking`;

-- org scope 下的 collection
-- branch: 分店信息
CREATE COLLECTION `online-booking`.`org`.`branch`;

-- system scope 下的 collection
-- staff: 员工信息
CREATE COLLECTION `online-booking`.`system`.`staff`;
-- config: 系统配置
CREATE COLLECTION `online-booking`.`system`.`config`;


-- 仅用于开发环境
-- 创建主索引
-- 针对 account collection 建主索引
CREATE PRIMARY INDEX ON `online-booking`.`user`.`account`;
-- 针对 profile collection 建主索引
CREATE PRIMARY INDEX ON `online-booking`.`user`.`profile`;
-- 针对 refresh_token collection 建主索引
CREATE PRIMARY INDEX ON `online-booking`.`user`.`refresh_token`;
-- 针对 verify_code collection 建主索引
CREATE PRIMARY INDEX ON `online-booking`.`user`.`verify_code`;
-- 针对 verify_code collection 建主索引
CREATE PRIMARY INDEX ON `online-booking`.`business`.`table`;
CREATE PRIMARY INDEX ON `online-booking`.`business`.`booking`;
CREATE PRIMARY INDEX ON `online-booking`.`org`.`branch`;
CREATE PRIMARY INDEX ON `online-booking`.`system`.`staff`;
CREATE PRIMARY INDEX ON `online-booking`.`system`.`config`;

-- -- 清空集合
-- DELETE FROM `online-booking`.`user`.`account` WHERE TRUE;
-- DELETE FROM `online-booking`.`user`.`profile` WHERE TRUE;
-- DELETE FROM `online-booking`.`user`.`refresh_token` WHERE TRUE;
-- DELETE FROM `online-booking`.`business`.`table` WHERE TRUE;


-- 创建二级索引
-- 账号类型 + 手机号 复合索引
-- 删除并重建索引
-- DROP INDEX `idx_account_type_mobile` ON `online-booking.`user`.`account`;
CREATE INDEX idx_account_type_mobile ON `online-booking`.`user`.`account`(type, mobile);
-- 激活索引
BUILD INDEX ON `online-booking`.`user`.`account`(`idx_account_type_mobile`);
-- 账号类似 + 角色 复合索引
CREATE INDEX idx_account_type_role ON `online-booking`.`user`.`account` (`type`, `role`)
BUILD INDEX ON `online-booking`.`user`.`account`(`idx_account_type_role`);
-- 账号类似 + 状态 复合索引
CREATE INDEX idx_account_type_status ON `online-booking`.`user`.`account`(type, status);
BUILD INDEX ON `online-booking`.`user`.`account`(`idx_account_type_status`);


CREATE INDEX idx_branch_type_name ON `online-booking`.`org`.`branch`(type, name);
BUILD INDEX ON `online-booking`.`org`.`branch`(`idx_branch_type_name`);

CREATE INDEX idx_table_name ON `online-booking`.`business`.`table`(name);
BUILD INDEX ON `online-booking`.`business`.`table`(`idx_table_name`);
CREATE INDEX idx_table_size ON `online-booking`.`business`.`table`(size);
BUILD INDEX ON `online-booking`.`business`.`table`(`idx_table_size`);
CREATE INDEX idx_table_status ON `online-booking`.`business`.`table`(status);
BUILD INDEX ON `online-booking`.`business`.`table`(`idx_table_status`);


CREATE INDEX idx_booking_type_userId
ON `online-booking`.`business`.`booking`(type, userId)
WHERE type = "booking";
BUILD INDEX ON `online-booking`.`business`.`booking`(`idx_booking_type_userId`);

CREATE INDEX idx_booking_type_userId_status
ON `online-booking`.`business`.`booking`(type, userId, status)
WHERE type = "booking";
BUILD INDEX ON `online-booking`.`business`.`booking`(`idx_booking_type_userId_status`);

CREATE INDEX idx_booking_type_tableId_bookingTime
ON `online-booking`.`business`.`booking`(type, tableId, bookingTime)
WHERE type = "booking";
BUILD INDEX ON `online-booking`.`business`.`booking`(`idx_booking_type_tableId_bookingTime`);

CREATE INDEX idx_booking_type_userId
ON `online-booking`.`business`.`booking`(type, userId)
WHERE type = "booking";
BUILD INDEX ON `online-booking`.`business`.`booking`(`idx_booking_type_userId`);

CREATE INDEX idx_booking_type_status
ON `online-booking`.`business`.`booking`(type, status)
WHERE type = "booking";
BUILD INDEX ON `online-booking`.`business`.`booking`(`idx_booking_type_status`);

CREATE INDEX idx_staff_type_accountId
ON `online-booking`.`system`.`staff`(type, accountId)
WHERE type = "staff";
BUILD INDEX ON `online-booking`.`system`.`staff`(`idx_staff_type_accountId`);

CREATE INDEX idx_staff_type_branchId
ON `online-booking`.`system`.`staff`(type, branchId)
WHERE type = "staff";
BUILD INDEX ON `online-booking`.`system`.`staff`(`idx_staff_type_branchId`);


-- -- 测试数据 管理员账号，手机号：13112345678，密码: 123456
-- INSERT INTO `online-booking`.`user`.`account` (KEY, VALUE)
-- VALUES (
--   "0fa04c3d-61ea-40d3-8416-36ae4f8c5f45",
--   {
--     "createdAt": 1756820978722,
--     "id": "0fa04c3d-61ea-40d3-8416-36ae4f8c5f45",
--     "issuer": "booking-app",
--     "lastLogin": 1757057797796,
--     "mobile": "13112345678",
--     "password": "$2b$10$SpVGGK58wIj4KzpaZmHoSeYF0JRedrncWpImQ.90TN6QKcTXm0i1W",
--     "role": "admin",
--     "status": "active",
--     "type": "account",
--     "updatedAt": 1756820978722,
--     "userId": "e44d4dc6-6818-4794-b4e1-d53e04ea4d0d"
--   }
-- );