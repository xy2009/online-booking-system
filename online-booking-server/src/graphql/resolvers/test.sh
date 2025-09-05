# graphql_url=<GraphQL地址>
# token='<Bearer Token>'
# client_id=<client-id>

# curl --location --request POST "$graphql_url" \
# --header "Content-Type: application/json" \
# --header "Accept: */*" \
# --header "Authorization: ${token}" \
# --header "client-id: ${client_id}" \
# --header "Connection: keep-alive" \
# --data-raw '{
#   "query": "<GraphQL查询语句>",
#   "variables": <GraphQL变量JSON>
# }'


graphql_url=http://192.168.31.85:3030/graphql
token='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZmEwNGMzZC02MWVhLTQwZDMtODQxNi0zNmFlNGY4YzVmNDUiLCJhdWQiOiIzYlhxSDJwWFExS3o4Z2syYkc3aDVnIiwidXNlcklkIjoiZTQ0ZDRkYzYtNjgxOC00Nzk0LWI0ZTEtZDUzZTA0ZWE0ZDBkIiwiaXNzdWVyIjoiYm9va2luZy1zeXN0ZW0iLCJhdWRpZW5jZSI6ImJvb2tpbmctc3lzdGVtLXVzZXJzIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU2ODQ4Nzc3LCJleHAiOjE3NTY5MzUxNzd9.5zFW781UCABUGFf0R8lrnsk9PuFHaP5aK3dnt4u6I3w'
client_id=3bXqH2pXQ1Kz8gk2bG7h5g


echo "\n\nBranch.1===>> create branch\n"
# create branch
curl --location --request POST "$graphql_url" \
--header "Content-Type: application/json" \
--header "Accept: */*" \
--header "Authorization: ${token}" \
--header "client-id: ${client_id}" \
--header "Connection: keep-alive" \
--data-raw '{
  "query": "mutation CreateBranch($input: CreateBranchInput!) { createBranch(input: $input) { id name address contactNumber status createdAt updatedAt } }",
  "variables": {
    "input": {
      "name": "新分店222",
      "address": "上海市某路88号",
      "contactNumber": "13800000000",
      "status": "active"
    }
  }
}'

# get branches with filter and pagination
echo "\n\nBranch.2===>> get branches with filter and pagination\n"

curl --location --request POST "$graphql_url" \
--header "Content-Type: application/json" \
--header "Accept: */*" \
--header "Authorization: ${token}" \
--header "client-id: ${client_id}" \
--header "Connection: keep-alive" \
--data-raw "{
  \"query\": \"query GetBranches(\$filter: BranchFilterInput, \$pagination: PaginationInput) { branches(filter: \$filter, pagination: \$pagination) { items { id name address contactNumber status createdAt updatedAt } total page pageSize } }\",
  \"variables\": {
    \"filter\": {
      \"name\": \"新分店222\"
    },
    \"pagination\": {
      \"page\": 1,
      \"pageSize\": 10
    }
  }
}"

branchId="6570994a-3590-47e8-9fa1-17dc89e12764"

# get branch by id
echo "\n\nBranch.3===>> get branches by id: $branchId\n"

curl --location --request POST "$graphql_url" \
--header "Content-Type: application/json" \
--header "Accept: */*" \
--header "Authorization: ${token}" \
--header "client-id: ${client_id}" \
--header "Connection: keep-alive" \
--data-raw "{
  \"query\": \"query Branch(\$id: ID!) { branch(id: \$id) { id name address contactNumber status createdAt updatedAt } }\",
  \"variables\": {
    \"id\": \"${branchId}\"
  }
}"

# update branch
echo "\n\nBranch.4===>> update branche by id: $branchId\n"

curl --location --request POST "$graphql_url" \
--header "Content-Type: application/json" \
--header "Accept: */*" \
--header "Authorization: ${token}" \
--header "client-id: ${client_id}" \
--header "Connection: keep-alive" \
--data-raw "{
  \"query\": \"mutation UpdateBranch(\$id: ID!, \$input: UpdateBranchInput!) { updateBranch(id: \$id, input: \$input) { id name address contactNumber status createdAt updatedAt } }\",
  \"variables\": {
    \"id\": \"${branchId}\",
    \"input\": {
      \"name\": \"新分店33\",
      \"address\": \"上海市某路88号\",
      \"contactNumber\": \"13800000000\",
      \"status\": \"active\"
    }
  }
}"

# delete branch
echo "\n\nBranch.5===>> delete branches by id: $branchId\n"

curl --location --request POST "$graphql_url" \
--header "Content-Type: application/json" \
--header "Accept: */*" \
--header "Authorization: ${token}" \
--header "client-id: ${client_id}" \
--header "Connection: keep-alive" \
--data-raw "{
  \"query\": \"mutation DeleteBranch(\$id: ID!) { deleteBranch(id: \$id) }\",
  \"variables\": {
    \"id\": \"${branchId}\"
  }
}"


# ------------------------------------------------------------------------------------

# create table
echo "\n\n===>> create table\n"
curl --location --request POST "$graphql_url" \
--header "Content-Type: application/json" \
--header "Accept: */*" \
--header "Authorization: ${token}" \
--header "client-id: ${client_id}" \
--header "Connection: keep-alive" \
--data-raw "{
  \"query\": \"mutation CreateTable(\$input: CreateTableInput!) { createTable(input: \$input) { id branchId name size status location description tags createdAt updatedAt lastOccupiedAt lastCleanedAt createdBy updatedBy } }\",
  \"variables\": {
    \"input\": {
      \"branchId\": \"0364c159-a3ac-4d8f-82cc-e9a19ae9a5cb\",
      \"name\": \"测试餐桌-001\",
      \"size\": 2,
      \"location\": \"indoor\"
    }
  }
}"

# find tables with filter and pagination

echo "\n\n===>> query tables with filter and pagination\n"
curl --location --request POST "$graphql_url" \
--header "Content-Type: application/json" \
--header "Accept: */*" \
--header "Authorization: ${token}" \
--header "client-id: ${client_id}" \
--header "Connection: keep-alive" \
--data-raw "{
  \"query\": \"query Tables(\$filter: TableFilterInput, \$pagination: PaginationInput) { tables(filter: \$filter, pagination: \$pagination) { total page pageSize items { id branchId name size status location description tags createdAt updatedAt lastOccupiedAt lastCleanedAt createdBy updatedBy } } }\",
  \"variables\": {
    \"filter\": {
      \"branchId\": \"0364c159-a3ac-4d8f-82cc-e9a19ae9a5cb\",
      \"name\": \"餐桌\"
    },
    \"pagination\": {
      \"page\": 1,
      \"pageSize\": 10
    }
  }


graphql_url=http://192.168.31.85:3030/graphql
echo "\n\n===>> create booking\n"
curl --location --request POST "$graphql_url" \
--header "Content-Type: application/json" \
--header "Accept: */*" \
--header "Authorization: ${token}" \
--header "client-id: ${client_id}" \
--header "Connection: keep-alive" \
--data-raw "{
  \"query\": \"mutation CreateBooking(\$input: BookingInput!) { createBooking(input: \$input) { id userId tableId bookingTime numberOfPeople status specialRequests createdAt updatedAt isDeleted bookingType maintenanceLogs { id bookingId action performedBy performedAt notes } } }\",
  \"variables\": {
    \"input\": {
      \"userId\": \"e44d4dc6-6818-4794-b4e1-d53e04ea4d0d\",
      \"tableId\": \"5c8eef19-47ad-4365-90b6-3be1d01dd2bf\",
      \"bookingTime\": 1756969200000,
      \"numberOfPeople\": 6,
      \"status\": \"pending\",
      \"specialRequests\": \"无\"
    }
  }
}"