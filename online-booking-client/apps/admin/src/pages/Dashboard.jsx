import { createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Toaster, toast } from 'solid-toast';

import { authStore } from '../stores/authStore';
import { ADMIN_CONSTANTS } from '../constants';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const statsInitData = {
    totalBookings: 0,
    pendingBookings: 0,
    totalTables: 0,
    availableTables: 0,
    totalBranches: 0
  };
  const navigate = useNavigate();
  const [stats, setStats] = createSignal(statsInitData);

  onMount(() => {
    // Check authentication
    if (!authStore.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Load dashboard statistics (mock data for now)
    // In a real application, fetch this data from the server
    // just using static data for demonstration
    setStats(statsInitData);

    toast.dismiss();
  });

  const handleLogout = async() => {

    // authStore.logout();
    // // todo: resolve logout api
    // navigate('/login');
    if (confirm('确定要退出登录吗？')) {
      await authStore.logout();
      navigate('/login');
    }
  };

  const navigateToSection = (item) => {
    console.log('Navigating to:', item);
    if (item.status !== 'active') {
      toast.error('该功能尚未开放，敬请期待！');
      return;
    }
    navigate(item.path);
  };

  return (
    <div class={styles.dashboard}>
      <Toaster />
      <header class={styles.header}>
        <div class={styles.headerContent}>
          <h1>管理后台</h1>
          <div class={styles.userInfo}>
            <span>欢迎, {authStore.admin()?.name || `员工-${authStore.admin()?.mobile?.slice(-4)}`}</span>
            <button class={styles.logoutBtn} onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main class={styles.main}>
        <div class={styles.statsGrid}>
          <div class={styles.statCard}>
            <div class={styles.statIcon}>📊</div>
            <div class={styles.statContent}>
              <h3>总预订数</h3>
              <p class={styles.statNumber}>{stats().totalBookings}</p>
            </div>
          </div>

          <div class={styles.statCard}>
            <div class={styles.statIcon}>⏳</div>
            <div class={styles.statContent}>
              <h3>待处理预订</h3>
              <p class={styles.statNumber}>{stats().pendingBookings}</p>
            </div>
          </div>

          <div class={styles.statCard}>
            <div class={styles.statIcon}>🪑</div>
            <div class={styles.statContent}>
              <h3>总桌位数</h3>
              <p class={styles.statNumber}>{stats().totalTables}</p>
            </div>
          </div>

          <div class={styles.statCard}>
            <div class={styles.statIcon}>✅</div>
            <div class={styles.statContent}>
              <h3>可用桌位</h3>
              <p class={styles.statNumber}>{stats().availableTables}</p>
            </div>
          </div>

          <div class={styles.statCard}>
            <div class={styles.statIcon}>🏢</div>
            <div class={styles.statContent}>
              <h3>分店数量</h3>
              <p class={styles.statNumber}>{stats().totalBranches}</p>
            </div>
          </div>
        </div>

        <div class={styles.quickActions}>
          <h2>快速操作</h2>
          <div class={styles.actionGrid}>
            {ADMIN_CONSTANTS.NAVIGATION.map((item) => (
              <button
                class={styles.actionCard}
                onClick={() => navigateToSection(item)}
              >
                <div class={styles.actionIcon}>{item.icon}</div>
                <div class={styles.actionContent}>
                  <h3>{item.label}</h3>
                  <p>{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
