// 手机号验证
export const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 密码验证
export const validatePassword = (password) => {
  // 至少6位，包含字母和数字
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};

// 用户昵称验证
export const validateNickname = (nickname) => {
  // 2-20个字符，支持中文、英文、数字
  const nicknameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/;
  return nicknameRegex.test(nickname);
};

// 验证码验证
export const validateSMSCode = (code) => {
  // 6位数字
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
};

// 预订人数验证
export const validatePartySize = (size) => {
  const num = parseInt(size);
  return num >= 1 && num <= 20;
};

// 特殊要求验证
export const validateSpecialRequests = (requests) => {
  // 最多200个字符
  return requests.length <= 200;
};

// 邮箱验证
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 通用验证函数
export const validate = (value, rules) => {
  const errors = [];
  
  for (const rule of rules) {
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(rule.message || '此字段为必填项');
      continue;
    }
    
    if (value && rule.validator && !rule.validator(value)) {
      errors.push(rule.message || '格式不正确');
    }
    
    if (value && rule.min && value.toString().length < rule.min) {
      errors.push(rule.message || `最少需要${rule.min}个字符`);
    }
    
    if (value && rule.max && value.toString().length > rule.max) {
      errors.push(rule.message || `最多允许${rule.max}个字符`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
