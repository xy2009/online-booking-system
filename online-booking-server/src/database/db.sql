-- 创建 scope 
CREATE SCOPE `online-booking`.`user`;
CREATE SCOPE `online-booking`.`business`;
CREATE SCOPE `online-booking`.`org`;
CREATE SCOPE `online-booking`.`system`;
-- 创建 COLLECTION 
CREATE COLLECTION `online-booking`.`user`.`account`;
CREATE COLLECTION `online-booking`.`user`.`profile`;
CREATE COLLECTION `online-booking`.`user`.`refresh_token`;
CREATE COLLECTION `online-booking`.`user`.`verify_code`;

CREATE COLLECTION `online-booking`.`business`.`table`;
CREATE COLLECTION `online-booking`.`business`.`booking`;

CREATE COLLECTION `online-booking`.`org`.`branch`;

CREATE COLLECTION `online-booking`.`system`.`staff`;
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
DELETE FROM `online-booking`.`business`.`table` WHERE TRUE;


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



CREATE INDEX idx_table_name ON `online-booking`.`business`.`table`(name);
BUILD INDEX ON `online-booking`.`business`.`table`(`idx_table_name`);
CREATE INDEX idx_table_size ON `online-booking`.`business`.`table`(size);
BUILD INDEX ON `online-booking`.`business`.`table`(`idx_table_size`);
CREATE INDEX idx_table_status ON `online-booking`.`business`.`table`(status);
BUILD INDEX ON `online-booking`.`business`.`table`(`idx_table_status`);

CREATE INDEX idx_branch_type_name ON `online-booking`.`org`.`branch`(type, name);
BUILD INDEX ON `online-booking`.`org`.`branch`(`idx_branch_type_name`);


CREATE INDEX idx_booking_type_tableId_bookingTime
ON `online-booking`.`business`.`booking`(type, tableId, bookingTime)
WHERE type = "booking";

CREATE INDEX idx_booking_type_userId
ON `online-booking`.`business`.`booking`(type, userId)
WHERE type = "booking";
BUILD INDEX ON `online-booking`.`business`.`booking`(`idx_booking_type_userId`);

CREATE INDEX idx_booking_type_status
ON `online-booking`.`business`.`booking`(type, status)
WHERE type = "booking";
BUILD INDEX ON `online-booking`.`business`.`booking`(`idx_booking_type_status`);

