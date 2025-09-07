import { Router, Route } from '@solidjs/router';
import { lazy, onMount } from 'solid-js';
import { authStore } from './stores/authStore';

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Booking = lazy(() => import('./pages/Booking'));
const BookingHistory = lazy(() => import('./pages/BookingHistory'));

import { setClientId } from '@booking/api-client';
import { initAuthConfig } from '@booking/shared-utils';
// 设置客户端ID
setClientId(import.meta.env.VITE_APP_CLIENT_ID);


// 初始化认证配置
initAuthConfig({
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  expiresKey: 'expired_at',
  userInfoKey: 'user_info',
});

function App() {
  onMount(() => {
    // 初始化认证状态
    authStore.initAuth();
  });
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/booking" component={Booking} />
      <Route path="/bookings" component={BookingHistory} />
    </Router>
  );
}

export default App;
