import request from 'supertest';
import app from '../app';

const moduleName = 'Account API';

describe(`${moduleName}:`, () => {
  const clientId = process.env.CUSTOMER_CLIENT_ID || '56LY8OKo2S5u6OLmohAGaDg';
  let mobile = '13100001111';
  let nickName = 'test用户-001';
  let password = '123456';
  let accountId: string;
  let refreshToken: string;
  let token: string;

  beforeAll(() => {
    console.log(`================= [${moduleName}] 开始测试 =================`);
     // CouchbaseDB.instance.connect();
  });
  afterAll(() => {
    console.log(`================= [${moduleName}] 结束测试 =================`);
  });

  describe('1.POST /api/v1/auth/register', () => {
    it('should register successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('client-id', clientId)
        .send({ mobile, nickName, password });
      expect([200, 402]).toContain(res.status); // 已注册返回402，首次注册返回200
      if (res.status === 200) {
        expect(res.body.data.user).toBeDefined();
        accountId = res.body.data.user.accountId;
        expect(res.body.data.token).toBeDefined();;
      } else if (res.status === 402) {
        expect(res.body.message).toMatch(/already registered/);
      }
    });

    it('should register fail, because clientId is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('client-id', '')
        .send({ mobile, nickName, password });
      expect(res.status).toBe(402);
      
    });

    it('should fail if missing params', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('client-id', clientId)
        .send({ mobile });
      expect(res.status).toBe(402);
    });
  });

  describe('2. POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('client-id', clientId)
        .send({ mobile, password, type: 'phone' });
      expect(res.status).toBe(200);
      expect(res.body.data.user).toBeDefined();
      accountId = res.body.data.user.id;
      expect(res.body.data.token).toBeDefined();
      token = res.body.data.token.access_token;
      refreshToken = res.body.data.token.refresh_token;
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('client-id', clientId)
        .send({ mobile, password: 'wrong', type: 'phone' });
      expect(res.status).toBe(402);
    });
  });

  describe('3. POST /api/v1/auth/send-sms', () => {
    it('should send sms code successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/send-sms')
        .set('client-id', clientId)
        .send({ mobile });
      expect([200, 429]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.message).toMatch(/SMS code sent successfully/);
      } else if (res.status === 429) {
        expect([429001, 429002]).toContain(res.body.errorCode);
        if (res.body.errorCode === 429001) {
          expect(res.body.message).toMatch(/try again later/);
        } else if (res.body.errorCode === 429002) {
          expect(res.body.message).toMatch(/limit reached/);
        }
      }
    });

    it('should fail if missing mobile', async () => {
      const res = await request(app)
        .post('/api/v1/auth/send-sms')
        .set('client-id', clientId)
        .send({});
      expect(res.status).toBe(402);
    });
  });

  describe('4. POST /v1/auth/refresh-token', () => {
    it('should refresh token successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('client-id', clientId)
        .send({ accountId, refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.data.access_token).toBeDefined();
      token = res.body.data.access_token;
    });

    it('should fail with invalid refreshToken', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('client-id', clientId)
        .send({ accountId, refreshToken: 'invalid' });
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid refresh token/);
    });
  });

  describe('5. DELETE /api/v1/auth', () => {

    it('should logout fail, token is invaild', async () => {
      const res = await request(app)
        .delete('/api/v1/auth')
        .set('client-id', clientId)
        .set('Authorization', `Bearer ${token}+1`)
        .send({});
      expect(res.status).toBe(401);
    });

    it('should fail if not authorized', async () => {
      const res = await request(app)
        .delete('/api/v1/auth')
        .set('client-id', clientId)
        .send({});
      expect(res.status).toBe(401);
    });

    it('should logout successfully', async () => {
      const res = await request(app)
        .delete('/api/v1/auth')
        .set('client-id', clientId)
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(200);
    });
  });
});