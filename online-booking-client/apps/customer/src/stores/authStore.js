import { createSignal, createEffect } from 'solid-js';
import { 
  API_ENDPOINTS, 
  STORAGE_KEYS, 
  ERROR_MESSAGES,
  APP_CONFIG,
  HTTP_RES_CODES
} from '../constants';
import { publicFetchWrapper, fetchWrapper } from '../utils/requesWrapper';

// 认证状态管理
const [user, setUser] = createSignal(null);
const [token, setToken] = createSignal(null);
const [isAuthenticated, setIsAuthenticated] = createSignal(false);
const [loading, setLoading] = createSignal(false);
const [initialized, setInitialized] = createSignal(false);

// 从localStorage恢复认证状态
const initAuth = () => {
  const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const savedUser = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  const expiresAt = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRED_AT);
  
  if (savedToken && savedUser) {
    try {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));

       // 检查token是否过期,这里请求需要使用user的accountId，故放在此处进行
      const now = new Date().getTime();
      if (expiresAt) {
        // console.log('Saved token expire time:', expiresAt);
        const expireTime = expiresAt ? new Date(Number(expiresAt)).getTime() : 0;
        // 一小时内过期的token也刷新
        const oneHourMs = 1 * 60 * 60 * 1000;
        if (expiresAt && now > expireTime) {
          console.log('Saved token has expired.');
          clearAuth();
          return;
        } else if (!(expireTime - now <= oneHourMs)) {
          // 过期前5天自动刷新token
          refreshToken(savedUser);
        }
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to restore auth state:', error);
      clearAuth();
    }
  }

 
  
  setInitialized(true);
};

const justSetToken = (token) => {
  setToken(token?.access_token);
  setIsAuthenticated(!!token);

  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token?.access_token);
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRED_AT, token?.expired_at);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token?.refresh_token);
}

const loginSuccess = (user, token) => {
    
    setUser(user);
    setIsAuthenticated(true);
    setToken(token?.access_token);
    setIsAuthenticated(!!token);
    // 保存到localStorage
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
     localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token?.access_token);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRED_AT, token?.expired_at);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token?.refresh_token);
    // justSetToken(token);
}

const refreshToken = async (savedUser) => {
  const savedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!savedRefreshToken) {
    console.warn('No refresh token available, refresh aborted.');
    // clearAuth();
    return;
  }
  
  setLoading(true);
  try {
    const response = await publicFetchWrapper(API_ENDPOINTS.AUTH.REFRESH, {
      accountId: user()?.id,
      refreshToken: savedRefreshToken
    });
    const { ok, success, message, data: newToken} = response;
    
    if (ok && success) {
      justSetToken(newToken);
      return { success: true };
    } else if (code === HTTP_RES_CODES.UNAUTHORIZED) {
      clearAuth();
      return { success: false, error: message || ERROR_MESSAGES.REFRESH_FAILED };
    }
  } catch (error) {
    clearAuth ();
    return { success: false, error: ERROR_MESSAGES.NETWORK_ERROR };
  } finally {
    setLoading(false);
  }
};


// 登录
const login = async (credentials) => {
  setLoading(true);
  try {
    const response = await publicFetchWrapper(API_ENDPOINTS.AUTH.LOGIN, {
      ...credentials, 
      type: 'phone' // 使用手机号登录
    });
    
    const { ok, success, message, data: { user, token} } = response;
    
    if (ok && success) {
      loginSuccess(user, token);
      
      return { success: true, user: user, message };
    } else {
      return { success: false, error: message || ERROR_MESSAGES.LOGIN_FAILED };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: ERROR_MESSAGES.NETWORK_ERROR };
  } finally {
    setLoading(false);
  }
};



// 注册
const register = async (userData) => {
  setLoading(true);
  try {
    console.log('Registering user with data:', userData);
    userData.nickName = userData.name || '新用户';

    const response = await publicFetchWrapper(API_ENDPOINTS.AUTH.REGISTER, userData);
    const { ok, success, message, errorCode, data: { user, token} } = response;
    
    if (ok && success) {
      loginSuccess(user, token);
      return { success: true, user: user, message };
    } else {
      return { success: false, error: errorCode === 402001 ? '手机号已注册，请直接登录，或使用其他手机号注册' : message || ERROR_MESSAGES.REGISTER_FAILED };
    }
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: ERROR_MESSAGES.NETWORK_ERROR };
  } finally {
    setLoading(false);
  }
};

const logoutClear = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setInitialized(false);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRED_AT);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.STORE_KEY);
    console.log('User logged out, auth state cleared.');
}

// 登出
const logout = async () => {
  
  // 可选：调用后端登出接口
  if (APP_CONFIG.EN_ABLE_BACKEND_LOGOUT && isAuthenticated()) {
    try {
      const res = await fetchWrapper(API_ENDPOINTS.AUTH.LOGOUT, {}, 'delete');
      // console.log('Logout response:', res);
      logoutClear();
    } catch (error) {
      // 登出接口调用失败时可选是否清除本地状态
        console.error('Logout error:', err);
        // 可选：如需失败时不清除本地状态，则注释下一行
        logoutClear();
    }
  } else {
    // 未启用后端登出时，直接清除本地状态
    logoutClear();
  }
};

// 清除认证状态
const clearAuth = () => {
  logout();
};

// 获取认证头
const getAuthHeaders = () => {
  const currentToken = token();
  return currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
};

export const authStore = {
  // 状态
  user,
  token,
  isAuthenticated,
  loading,
  initialized,
  // 方法
  initAuth,
  login,
  register,
  logout,
  clearAuth,
  getAuthHeaders,
};
