import os from 'os';

/**
 * 判断是否为局域网（私有）IP
 */
function isPrivateIP(ip: string): boolean {
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
  );
}

/**
 * 获取本机所有局域网（私有）IPv4 地址
 */
export function getPrivateIPv4Addresses(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  // 常见物理网卡前缀
  const physicalPrefixes = ['en', 'eth', 'wlan', 'lan', 'Wi-Fi', 'Ethernet'];
  for (const name of Object.keys(interfaces)) {
    // 只保留物理网卡
    if (!physicalPrefixes.some(prefix => name.startsWith(prefix))) continue;
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal && isPrivateIP(net.address)) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

/**
 * 获取本机所有外网（公网）IPv4 地址
 */
export function getPublicIPv4Addresses(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal && !isPrivateIP(net.address)) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

/**
 *  获取调用端的IP地址
 * @param req Express Request
 * @returns 
 */
export const getCallerIp = (req: any): string => {
  let ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim()
    || req.ip
    || req.connection?.remoteAddress;

  // 剔除 ::ffff: 前缀（IPv4映射IPv6格式）
  if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  return ip;
}