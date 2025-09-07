import request from 'supertest';
import app from '../app';
import { getRandomValues } from 'crypto';
import { maskMobile, sleep } from '../common/utils/util';
import { logger } from '../common/utils/logger';
import { testUser } from './testUser';

const moduleName = 'Branch API';

let token: string;
let b_token: string;
let clientId: string;

describe(`${moduleName}:`, () => {

    beforeAll(async () => {
      clientId = process.env.CUSTOMER_CLIENT_ID ?? '';
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

    // 系统内置客户端ID
    const sys_client_id = '3bXqH2pXQ1Kz8gk2bG7h5g';
    const custom_client_id = process.env.CUSTOM_CLIENT_ID || '56LY8OKo2S5u6OLmohAGaDg';
    
    // let mobile = '13112345678';
    // let password = '123456';
    // let accountId: string;
    // let refreshToken: string;
    let token: string;
    let b_token: string;
    const branchName = `test-分店${getRandomValues(new Uint32Array(1))[0]}`;
    let branchId: string = '';


    // it('INIT: System account should login successfully, to init token', async () => {
    //   const res = await request(app)
    //     .post('/api/v1/auth/login')
    //     .set('client-id', sys_client_id)
    //     .send({ mobile, password, type: 'phone' });  
    //   expect(res.statusCode).toBe(200);
    //   expect(res.body.data.user).toBeDefined();
    // //   accountId = res.body.data.user.id;
    //   expect(res.body.data.token).toBeDefined();
    //   token = res.body.data.token.access_token;
    //   b_token = `Bearer ${token}`;
    //   refreshToken = res.body.data.token.refresh_token;
    //   const _maskMobile = maskMobile(mobile);
    //   expect(res.body.data.user).toHaveProperty('mobile', _maskMobile);
    // });
  

  it(`1. Should succeed, Create Branch via GraphQL mutation, branch name is: [${branchName}]`, async () => {
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token) // 设置认证头
      .set('client-id', sys_client_id) // 设置客户端ID头
      .send({
        query: `
          mutation CreateBranch($input: CreateBranchInput!) {
            createBranch(input: $input) {
              id
              name
              address
              contactName
              contactNumber
              status
              createdAt
              updatedAt
            }
          }`,
        variables: {
          "input": {
            "name": branchName,
            "address": "上海市某路88号",
            "contactName": "张三",
            "contactNumber": "13800000000",
            "status": "active",
            "openTime": "9",
            "closeTime": "21",
            "description": "这是一个测试分店"
          }
        },
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('createBranch');
    const createdBranch = response.body.data.createBranch;
    expect(createdBranch).toHaveProperty('id');
    branchId = createdBranch.id;
    expect(createdBranch).toHaveProperty('name', branchName);
    expect(createdBranch).toHaveProperty('address', '上海市某路88号');
    expect(createdBranch).toHaveProperty('contactNumber', '13800000000');
    expect(createdBranch).toHaveProperty('status', 'active');
  });

  it(`2. Should fail, create Branch via GraphQL mutation, because due to duplicate name: [${branchName}]`, async () => {
    sleep(2);
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token) // 设置认证头
      .set('client-id', sys_client_id) // 设置客户端ID头
      .send({
        query: `
          mutation CreateBranch($input: CreateBranchInput!) {
            createBranch(input: $input) {
              id
              name
              address
              contactName
              contactNumber
              status
              createdAt
              updatedAt
            }
          }`,
        variables: {
          "input": {
            "name": branchName,
            "address": "上海市某路88号",
            "contactName": "张san",
            "contactNumber": "13800000000",
            "status": "active",
            "openTime": "9",
            "closeTime": "21",
            "description": "这是一个测试分店2"
          }
        },
      });
    expect(response.statusCode).toBe(200);
    // expect(response.body).toHaveProperty('data');
  });

  it(`3. Should succeed, Query Branches via GraphQL query, to include branch name: [${branchName}]`, async () => {
    await sleep(2);
    const d = {
        query: `
          query Branches($filter: BranchFilterInput, $pagination: PaginationInput) {
            branches(filter: $filter, pagination: $pagination) {
              items {
                id
                name
                address
                contactName
                contactNumber
                status
                createdAt
                updatedAt
              }
              total
              page
              pageSize
            }
          }`,
        variables: {
          "filter": {
            "name": branchName
          },
          "pagination": {
            "page": 1,
            "pageSize": 10
          }
        },
      };
     logger.info(`【branch.test.ts3】【Query Branches】request data:  ${JSON.stringify(d)}`);
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token) // 设置认证头
      .set('client-id', sys_client_id) // 设置客户端ID头
      .send(d);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('branches');
    const branchesResult = response.body.data.branches;
    expect(branchesResult).toHaveProperty('items');
    expect(Array.isArray(branchesResult.items)).toBe(true);
    expect(branchesResult.items.length).toBeGreaterThan(0);
    const foundBranch = branchesResult.items.find((b: any) => b.name === branchName);
  });

  it(`4. Should succeed, Query Branch by ID via GraphQL query`, async () => {
    
    await sleep(2);
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token) // 设置认证头
      .set('client-id', sys_client_id) // 设置客户端ID头
      .send({
        query: `
          query Branch($id: ID!) {
            branch(id: $id) {
              id
              name
              address
              contactName
              contactNumber
              status
              createdAt
              updatedAt
            }
          }`,
        variables: {
          "id": branchId
        },
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('branch');
    const branch = response.body.data.branch;
    expect(branch).toHaveProperty('id', branchId);
    expect(branch).toHaveProperty('name', branchName);
  });

  // define new branch name for update
  it(`5. Should succeed, delete Branch via GraphQL mutation, branchId is: [${branchId}]`, async () => {
    await sleep(3);
    const response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', b_token) // 设置认证头
      .set('client-id', sys_client_id) // 设置客户端ID头
      .send({
        query: `
          mutation DeleteBranch($id: ID!) {
            deleteBranch(id: $id)
          }`,
        variables: {
          "id": branchId
        },
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('deleteBranch', true);
  });

});