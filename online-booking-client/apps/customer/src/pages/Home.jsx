import { createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Button } from '@booking/shared-ui';
import { authStore } from '../stores/authStore';
import { branchStore } from '../stores/branchStore';
import { bookingStore } from '../stores/bookingStore';
import styles from './Home.module.css';
import { fetchWrapper } from '../utils/requesWrapper';
import { API_ENDPOINTS, HTTP_RES_CODES } from '../constants';

function Home() {
  const navigate = useNavigate();
  const stores = branchStore.branches;
  const loading = branchStore.loading;
  const error = branchStore.error;
  const [authInitialized, setAuthInitialized] = createSignal(false);

  // 获取门店列表
  const fetchStores = branchStore.fetchBranches;

  onMount(() => {
    // 获取门店列表
    fetchStores();
  });

  const handleStoreSelect = (store) => {
    if (!authStore.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    bookingStore.setSelectedStore(store);
    navigate('/booking');
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    if (confirm('确定要退出登录吗？')) {
      await authStore.logout();
      // 延迟刷新页面，确保登出请求完成
      window.location.reload();
    }
  };

  return (
    <div class={styles.container}>
      {/* 头部导航 */}
      <header class={styles.header}>
        <div class={styles.headerContent}>
          <h1 class={styles.logo}>餐桌预订</h1>
          <div class={styles.userActions}>
            {authStore.isAuthenticated() ? (
              <div class={styles.userInfo}>
                <span>欢迎，{authStore.user()?.nickName || authStore.user()?.name || authStore.user()?.conncetName}</span>
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={() => navigate('/bookings')}
                >
                  我的预订
                </Button>
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={handleLogout}
                >
                  退出
                </Button>
              </div>
            ) : (
              <div class={styles.authButtons}>
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={() => navigate('/login')}
                >
                  登录
                </Button>
                <Button 
                  size="small"
                  onClick={() => navigate('/register')}
                >
                  注册
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main class={styles.main}>
        <div class={styles.content}>
          <div class={styles.hero}>
            <h2>发现附近的美味餐厅</h2>
            <p>轻松预订，享受美食时光</p>
          </div>

          {/* 门店列表 */}
          <section class={styles.storesSection}>
            <h3>推荐餐厅</h3>
            
            {loading() && (
              <div class={styles.loading}>
                <div class={styles.spinner}></div>
                <p>加载中...</p>
              </div>
            )}

            {error() && (
              <div class={styles.error}>
                <p>{error()}</p>
                {(!authInitialized() && !authStore.isAuthenticated()) ? (
                    <Button onClick={() => navigate('/login')}>去登录</Button>
                ): (<Button onClick={fetchStores}>重试</Button> )}
              </div>
            )}

            {!loading() && !error() && (
              <div class={styles.storeGrid}>
                {stores().map((store) => (
                  <div class={styles.storeCard} key={store.id}>
                    <div class={styles.storeImage}>
                      {store.imageUrl ? (
                        <img src={store.imageUrl} alt={store.name} />
                      ) : (
                        <div class={styles.placeholderImage}>
                          <span>🍽️</span>
                        </div>
                      )}
                    </div>
                    
                    <div class={styles.storeInfo}>
                      <h4 class={styles.storeName}>{store.name}</h4>
                    <p class={styles.storeAddress}>{store.address}</p>
                      {store.description && (
                        <p class={styles.storeDescription + ' ' + styles.ellipsis}>{store.description}</p>
                      )}
                      
                      <div class={styles.storeDetails}>
                        <div class={styles.storeHours}>
                          <span>营业时间：{store.openTime} - {store.closeTime}</span>
                        </div>
                        {store.rating || 1 && (
                          <div class={styles.storeRating}>
                            {Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => (
                              <span key={i}>⭐</span>
                            ))}
                          </div>
                        )}
                        {/* {!store.rating && (
                          <div class={styles.storeRating}>
                            
                            <span>⭐ {Math.floor(Math.random() * 5) + 1}</span>
                          </div>
                        )} */}
                        {/* <span>⭐ {store.rating}</span> */}
                      </div>
                      
                      <div class={styles.storeActions}>
                        <a href={`tel:${store.contactNumber}`} class={styles.phoneButton}>
                          📞 {store.contactNumber}
                        </a>
                        <Button 
                          onClick={() => handleStoreSelect(store)}
                          class={styles.bookButton}
                        >
                          立即预订
                        </Button>
                        
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading() && !error() && stores().length === 0 && (
              <div class={styles.empty}>
                <p>暂无餐厅信息</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Home;
