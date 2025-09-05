import { v4 as uuidv4 } from "uuid";

export const generateUUID = (): string => {
    return uuidv4();
}

// 脱敏手机号函数
export const maskMobile = (val: string): string => {
  if (typeof val === 'string' && val.length >= 7) {
    // 只保留前3后4，中间4位用*替换
    return val.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  return val;
}

// 简单的 sleep 函数，暂停指定秒数
export const sleep = (ms: number = 1): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms * 1000));
}