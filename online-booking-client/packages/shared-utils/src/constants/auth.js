// 默认的 auth 配置对象
let _authConfig = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  expiresKey: 'auth_token_expires_at',
  userInfoKey: 'user_info',
  clientIdKey: 'app_client_id',
};
let _initialized = false;

export const initAuthConfig = (config = {}) => {
  if (_initialized) return;
  _authConfig = { ..._authConfig, ...config };
  _initialized = true;
};

export const getAuthConfig = () => ({ ..._authConfig });

export const getAuthKey = (key) => _authConfig[key];
