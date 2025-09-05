#!/bin/bash

# 等待 Couchbase Server 启动
sleep 20

# 管理员账号
CB_USER=${COUCHBASE_ADMINISTRATOR_USERNAME:-admin}
CB_PASS=${COUCHBASE_ADMINISTRATOR_PASSWORD:-admin123}
CB_HOST=localhost

# 创建 bucket
/opt/couchbase/bin/couchbase-cli bucket-create \
  -c $CB_HOST:8091 \
  -u $CB_USER \
  -p $CB_PASS \
  --bucket test-bucket \
  --bucket-type couchbase \
  --bucket-ramsize 256 \
  --wait

# 创建 RBAC 用户（可选）
/opt/couchbase/bin/couchbase-cli user-manage \
  -c $CB_HOST:8091 \
  -u $CB_USER \
  -p $CB_PASS \
  --set \
  --rbac-username testuser \
  --rbac-password testpass \
  --roles bucket_full_access[test-bucket] \
  --auth-domain local

# 创建 primary index 以便 N1QL 查询
/opt/couchbase/bin/cbq -u $CB_USER -p $CB_PASS -s "CREATE PRIMARY INDEX ON \\`test-bucket\\`;"
