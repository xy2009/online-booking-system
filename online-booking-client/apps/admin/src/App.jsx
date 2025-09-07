import { Router, Route } from '@solidjs/router';
import { lazy, onMount } from 'solid-js';
import { Toaster, toast } from 'solid-toast';

import { setClientId } from '@booking/api-client';
import { initAuthConfig } from '@booking/shared-utils';

import { authStore } from './stores/authStore';



// 懒加载页面组件
const AdminLogin = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BookingManagement = lazy(() => import('./pages/BookingManagement'));
const TableManagement = lazy(() => import('./pages/TableManagement'));
const BranchManagement = lazy(() => import('./pages/BranchManagement'));


// 设置客户端ID
setClientId(import.meta.env.VITE_SYS_CLIENT_ID);

// 初始化认证配置
initAuthConfig({
  tokenKey: 'admin_token',
  refreshTokenKey: 'admin_refresh_token',
  expiresKey: 'admin_token_expires_at',
  userInfoKey: 'admin_user_info',
});

function App() {

  onMount(() => {
    // 初始化认证状态
    authStore.initAuth();
    toast.dismiss();
  })

  return (
    <Router>
      <Route path="/login" component={AdminLogin} />
      <Route path="/" component={Dashboard} />
      <Route path="/bookings" component={BookingManagement} />
      <Route path="/tables" component={TableManagement} />
      <Route path="/branches" component={BranchManagement} />
    </Router>
  );
}

export default App;
