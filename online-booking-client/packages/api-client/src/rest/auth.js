import { apiClient } from './base.js';

export const authAPI = {
  // 用户注册
  register: async (userData) => {
    const response = await apiClient.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  // 密码登录
  login: async (credentials) => {
    const response = await apiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  // 验证码登录
  loginWithSMS: async (credentials) => {
    const response = await apiClient.request('/auth/login-sms', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  // 发送验证码
  sendSMS: async (phone, type = 'login') => {
    return await apiClient.request('/auth/send-sms', {
      method: 'POST',
      body: JSON.stringify({ phone, type }),
    });
  },

  // 获取用户信息
  getProfile: async () => {
    return await apiClient.request('/auth/profile');
  },

  // 更新用户信息
  updateProfile: async (userData) => {
    return await apiClient.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // 修改密码
  changePassword: async (passwordData) => {
    return await apiClient.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  // 登出
  logout: () => {
    apiClient.clearToken();
  },

  // 检查登录状态
  isAuthenticated: () => {
    return !!apiClient.getToken();
  },
};
