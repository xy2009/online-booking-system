
import request from 'supertest';
import app from '../app';
import { getRandomValues } from 'crypto';
import { maskMobile, sleep } from '../common/utils/util';
import { logger } from '../common/utils/logger';
import { testUser } from './testUser';
import { get, random } from 'lodash';
import { stat } from 'fs';

const moduleName = 'Table API';

let token: string;
let b_token: string;
let sys_client_id: string;
let custom_client_id: string;

describe(`${moduleName}:`, () => {
  const tableName = `测试餐桌-${getRandomValues(new Uint32Array(1))[0]}`;
  const branchId = '0e862012-07fe-467b-950a-66908d80140a';

  let getTableId: string = '';

    beforeAll(async () => {
      sys_client_id = process.env.CUSTOMER_CLIENT_ID ?? '56LY8OKo2S5u6OLmohAGaDg';
      custom_client_id = process.env.CUSTOM_CLIENT_ID || '56LY8OKo2S5u6OLmohAGaDg';
      console.log(`================= [${moduleName}] 开始测试 =================`);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('client-id', sys_client_id)
        .send({ mobile: testUser.mobile, password: testUser.password, type: 'phone' }); 
        token = res.body.data.token.access_token;
        b_token = `Bearer ${token}`;
    });

    afterAll(() => {
      console.log(`================= [${moduleName}] 结束测试 =================`);
    });

    it('1. Should succeed, Create Table via GraphQL mutation', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json')
        .set('Authorization', b_token)
        .set('client-id', sys_client_id)
        .send({
          query: `
            mutation CreateTable($input: CreateTableInput!) {
              createTable(input: $input) {
                id
                branchId
                name
                size
                status
                location
                description
                tags
                createdAt
                updatedAt
                lastOccupiedAt
                lastCleanedAt
                createdBy
                updatedBy
              }
            }`,
          variables: {
            input: {
              branchId,
              name: tableName,
              size: random(5, 10),
              location: "indoor",
              turntableCycle: 70
            }
          }
        });
        console.log("CreateTable response:",response.statusCode, response.body);
      expect(response.statusCode).toBe(200);
      expect(response.body.data.createTable).toHaveProperty('id');
      getTableId = response.body.data.createTable.id;
      expect(response.body.data.createTable.name).toBe(tableName);
    });


    it('2. Should succeed, Query Tables with branchId and name filter via GraphQL query', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json')
        .set('Authorization', b_token)
        .set('client-id', sys_client_id)
        .send({
          query: `
            query Tables($filter: TableFilterInput, $pagination: PaginationInput) {
              tables(filter: $filter, pagination: $pagination) {
                total
                page
                pageSize
                items {
                  id
                  branchId
                  name
                  size
                  status
                  location
                  description
                  tags
                  createdAt
                  updatedAt
                  lastOccupiedAt
                  lastCleanedAt
                  createdBy
                  updatedBy
                }
              }
            }`,
          variables: {
            filter: {
              branchId: "0364c159-a3ac-4d8f-82cc-e9a19ae9a5cb",
              name: "餐桌"
            },
            pagination: {
              page: 1,
              pageSize: 10
            }
          }
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.data.tables).toHaveProperty('items');
        expect(Array.isArray(response.body.data.tables.items)).toBe(true);
        expect(response.body.data.tables).toHaveProperty('total');
        expect(response.body.data.tables).toHaveProperty('page');
        expect(response.body.data.tables).toHaveProperty('pageSize');
      });
    
  it('3. Should succeed, Query Table by ID via GraphQL query', async () => {
    const res = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token)
      .set('client-id', sys_client_id)
      .send({
        query: `
          query Table($id: ID!) {
            table(id: $id) {
              id
              branchId
              name
              size
              status
              location
              description
              tags
              createdAt
              updatedAt
              lastOccupiedAt
              lastCleanedAt
              createdBy
              updatedBy
            }
          }`,
        variables: { id: getTableId }
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.table).toHaveProperty('id');
    expect(res.body.data.table.id).toBe(getTableId);
  });

  it('4. Should succeed, Update Table via GraphQL mutation', async () => {
    sleep(1); // 等待1秒，确保上次操作已完成
    const newTableName = `${tableName}-更新`;
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token)
      .set('client-id', sys_client_id)
      .send({
        query: `
          mutation UpdateTable($id: ID!, $input: UpdateTableInput!) {
            updateTable(id: $id, input: $input) {
              id
              branchId
              name
              size
              status
              location
              description
              tags
              createdAt
              updatedAt
              lastOccupiedAt
              lastCleanedAt
              createdBy
              updatedBy
            }
          }`,
        variables: {
          id: getTableId,
          input: {
            name: newTableName,
            size: 6,
            location: "indoor",
            turntableCycle: 90
          }
        }
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.data.updateTable).toHaveProperty('id', getTableId);
    expect(response.body.data.updateTable).toHaveProperty('name', newTableName);
    expect(response.body.data.updateTable).toHaveProperty('size', 6);
    expect(response.body.data.updateTable).toHaveProperty('location', "indoor");
  });
    
  it('5. Should succeed, Delete Table via GraphQL mutation', async () => {
    sleep(2);
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token)
      .set('client-id', sys_client_id)
      .send({
        query: `
          mutation DeleteTable($id: ID!) {
            deleteTable(id: $id)
          }`,
        variables: { id: getTableId }
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.data.deleteTable).toBe(true);
  });

});