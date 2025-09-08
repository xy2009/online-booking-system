import { createSignal } from 'solid-js';
import { 
  API_ENDPOINTS, 
  STORAGE_KEYS, 
  ERROR_MESSAGES,
  APP_CONFIG
} from '../constants';
import { publicFetchWrapper, fetchWrapper } from '../utils/requesWrapper';

// 管理端认证状态管理
const [admin, setAdmin] = createSignal(null);
const [token, setToken] = createSignal(null);
const [isAuthenticated, setIsAuthenticated] = createSignal(false);
const [loading, setLoading] = createSignal(false);

// 从localStorage恢复认证状态
const initAuth = () => {
  const savedToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  const savedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN_INFO);
  
  if (savedToken && savedAdmin) {
    try {
      setToken(savedToken);
      setAdmin(JSON.parse(savedAdmin));
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to restore admin auth state:', error);
      clearAuth();
    }
  }
};

// 管理员登录
const login = async (credentials) => {
  setLoading(true);
  try {
    const { username: mobile, password } = credentials;
    const response = await publicFetchWrapper(API_ENDPOINTS.AUTH.LOGIN, {
      mobile,
      password, 
      type: 'phone' // 使用手机号登录
    });
    
    const { ok, success, message, data: { user, token} } = response;
    
    if (ok && success) {
      // loginSuccess(user, token);
      setToken(token?.access_token);
      setAdmin(user);
      setIsAuthenticated(true);
      
      // 保存到localStorage
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token?.access_token);
      localStorage.setItem(STORAGE_KEYS.ADMIN_INFO, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN_EXPIRED_AT, token?.expired_at);
      localStorage.setItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN, token?.refresh_token);
      
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

// 管理员登出
const logout = async () => {
  setLoading(true);
  try {
  // 可选：调用后端登出接口
    if (APP_CONFIG.EN_ABLE_BACKEND_LOGOUT && isAuthenticated()) {
      try {
        const res = await fetchWrapper(API_ENDPOINTS.AUTH.LOGOUT, {}, 'delete');
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
  } finally {
    setLoading(false);
  }
};

const logoutClear = () => {
  setAdmin(null);
  setToken(null);
  setIsAuthenticated(false);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_INFO);
}

// 清除认证状态
const clearAuth = () => {
  logout();
};

// 获取认证头
const getAuthHeaders = () => {
  const currentToken = token();
  return currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
};

// 检查权限
const hasPermission = (permission) => {
  const currentAdmin = admin();
  if (!currentAdmin) return false;
  
  // 管理员拥有所有权限
  if (currentAdmin.role === 'admin') return true;
  
  // 检查具体权限
  return currentAdmin?.permissions?.includes(permission) || false;
};

export const authStore = {
  // 状态
  admin,
  token,
  isAuthenticated,
  loading,
  
  // 方法
  initAuth,
  login,
  logout,
  clearAuth,
  getAuthHeaders,
  hasPermission,
};
