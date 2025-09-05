import { getPrivateIPv4Addresses, getPublicIPv4Addresses, getCallerIp } from '../common/utils/network';


const moduleName = 'network utils';


describe(`${moduleName}:`, () => {

  beforeAll(() => {
    console.log(`================= [${moduleName}] 开始测试 =================`);
  });
  afterAll(() => {
    console.log(`================= [${moduleName}] 结束测试 =================`);
  });

  describe('getPrivateIPv4Addresses', () => {
    it('should return an array (may be empty if no private IP)', () => {
      const ips = getPrivateIPv4Addresses();
      expect(Array.isArray(ips)).toBe(true);
      ips.forEach(ip => {
        expect(typeof ip).toBe('string');
        expect(ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)).toBe(true);
      });
    });
  });

  describe('2. getPublicIPv4Addresses', () => {
    it('should return an array (may be empty if no public IP)', () => {
      const ips = getPublicIPv4Addresses();
      expect(Array.isArray(ips)).toBe(true);
      ips.forEach(ip => {
        expect(typeof ip).toBe('string');
        expect(
          !ip.startsWith('10.') &&
          !ip.startsWith('192.168.') &&
          !/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
        ).toBe(true);
      });
    });
  });

  describe('3. getCallerIp', () => {
    it('should get IP from x-forwarded-for', () => {
      const req = { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } };
      expect(getCallerIp(req)).toBe('1.2.3.4');
    });

    it('should get IP from req.ip', () => {
      const req = { headers: {}, ip: '2.2.2.2' };
      expect(getCallerIp(req)).toBe('2.2.2.2');
    });

    it('should get IP from req.connection.remoteAddress', () => {
      const req = { headers: {}, connection: { remoteAddress: '3.3.3.3' } };
      expect(getCallerIp(req)).toBe('3.3.3.3');
    });

    it('should strip ::ffff: prefix', () => {
      const req = { headers: {}, ip: '::ffff:4.4.4.4' };
      expect(getCallerIp(req)).toBe('4.4.4.4');
    });

    it('should return undefined if no IP found', () => {
      const req = { headers: {} };
      expect(getCallerIp(req)).toBeUndefined();
    });
  });
});