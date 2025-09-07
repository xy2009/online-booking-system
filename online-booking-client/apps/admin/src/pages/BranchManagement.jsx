import { createSignal, onMount, For } from 'solid-js';
import { Toaster, toast } from 'solid-toast';

import { useNavigate } from '@solidjs/router';
import { authStore } from '../stores/authStore';
import { branchStore } from '../stores/branchStore';
import { ADMIN_CONSTANTS } from '../constants';
import styles from './BranchManagement.module.css';

export default function BranchManagement() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = createSignal('ALL');
  const [editingBranch, setEditingBranch] = createSignal(null);
  const [creatingBranch, setCreatingBranch] = createSignal(false);

  const createInitData = {
      name: '',
      address: '',
      contactNumber: '',
      contactName: '',
      openTime: '09:00',
      closeTime: '18:00',
      // totalTables: 10,
      description: '一间很棒的餐厅。',
      status: ADMIN_CONSTANTS.BRANCH_STATUS.ACTIVE
    };
  const [newBranch, setNewBranch] = createSignal(createInitData);

  onMount(async () => {
    toast.dismiss();
    // Check authentication
    if (!authStore.isAuthenticated()) {
      navigate('/login');
      return;
    }

    await branchStore.fetchBranches();
  });

  //   // Load branches (mock data for now)
  //   setTimeout(() => {
  //     setBranches([
  //       {
  //         id: 'BR001',
  //         name: '中山路店',
  //         address: '中山路123号',
  //         phone: '0571-88888888',
  //         manager: '张经理',
  //         status: 'ACTIVE',
  //         openTime: '10:00',
  //         closeTime: '22:00',
  //         totalTables: 20,
  //         availableTables: 15,
  //         todayBookings: 25,
  //         monthlyRevenue: 125000,
  //         createdAt: '2024-01-15'
  //       }
  //     ]);
  //     setLoading(false);
  //   }, 1000);
  

  const branches = branchStore.branches;
  const loading = branchStore.loading;

  const filteredBranches = () => {
    let filtered = branches();
    
    if (selectedStatus() !== 'ALL') {
      filtered = filtered.filter(branch => branch.status === selectedStatus());
    }
    
    return filtered;
  };

  const getStatusColor = (status) => {
    const colors = {
      [ADMIN_CONSTANTS.BRANCH_STATUS.ACTIVE]: '#10b981',
      [ADMIN_CONSTANTS.BRANCH_STATUS.INACTIVE]: '#6b7280',
      [ADMIN_CONSTANTS.BRANCH_STATUS.DELETED]: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      [ADMIN_CONSTANTS.BRANCH_STATUS.ACTIVE]: '营业中',
      [ADMIN_CONSTANTS.BRANCH_STATUS.INACTIVE]: '暂停营业',
      [ADMIN_CONSTANTS.BRANCH_STATUS.DELETED]: '维护中'
    };
    return texts[status] || status;
  };

  const handleStatusChange = async(branchId, newStatus) => {
    if (newStatus === 'deleted' && confirm('确定要删除这个分店吗？此操作不可逆。')) {
      await branchStore.updateBranchInStore(branchId, { status: newStatus });
      if (branchStore.error()) {
        toast.error('状态更新失败，请重试');
        return;
      } else {
        toast.success('状态更新成功');
      }
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch({ ...branch });
  };

  const handleSaveBranch = async () => {
    const edited = editingBranch();
    if (!edited) return;
    // 保存时将 openTime 和 closeTime 转为数字小时
    const openHour = edited.openTime ? parseInt(edited.openTime.split(':')[0], 10) : null;
    const closeHour = edited.closeTime ? parseInt(edited.closeTime.split(':')[0], 10) : null;
    const payload = {
      ...edited,
      openTime: `${openHour}`,
      closeTime: `${closeHour}`
    };
    const res = await branchStore.updateBranchInStore(edited.id, payload);
    // console.log('分店更新结果:', res);
    if (branchStore.error()) {
      toast.error('分店更新失败，请重试');
      return;
    } else {
      toast.success('分店更新成功');
    }
    setEditingBranch(null);
  };

  const handleCancelEdit = () => {
    setEditingBranch(null);
  };

  const handleCreateBranch = async () => {
    const branch = newBranch();
    // openTime/closeTime 转为数字小时
    const openHour = branch.openTime ? parseInt(branch.openTime.split(':')[0], 10) : null;
    const closeHour = branch.closeTime ? parseInt(branch.closeTime.split(':')[0], 10) : null;
    const payload = {
      ...branch,
      openTime: `${openHour}`,
      closeTime: `${closeHour}`
    };
    await branchStore.createBranchInStore(payload);
    if (branchStore.error()) {
      toast.error('新建分店失败，请重试');
      return;
    } else {
      toast.success('分店新建成功');
    }
    setCreatingBranch(false);
    setNewBranch(createInitData);
  };

  const handleCancelCreate = () => {
      setCreatingBranch(false);
      setNewBranch(createInitData);
   };
  

  const getBranchStats = () => {
    console.log('Calculating branch stats...', branches().length);
    const stats = {
      total: branches().length,
      active: 0,
      inactive: 0,
      maintenance: 0,
      totalTables: 0,
      totalBookings: 0,
      totalRevenue: 0
    };
    
    branches().forEach(branch => {
      switch (branch.status) {
        case 'active':
          stats.active++;
          break;
        case 'inactive':
          stats.inactive++;
          break;
        case 'deleted':
          stats.maintenance++;
          break;
      }
      stats.totalTables += branch.totalTables;
      stats.totalBookings += branch.todayBookings;
      stats.totalRevenue += branch.monthlyRevenue;
    });
    
    return stats;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // 如果是 '09' 或 '9'，补全为 '09:00'
    if (/^\d{1,2}$/.test(timeStr)) {
      return timeStr.padStart(2, '0') + ':00';
    }
    // 如果是 '09:30' 这种，直接返回
    return timeStr;
  };

  return (
    <div class={styles.branchManagement}>
      <Toaster />
      <header class={styles.header}>
        <div class={styles.headerContent}>
          <div class={styles.titleSection}>
            <button class={styles.backBtn} onClick={() => navigate('/')}> 
              ← 返回
            </button>
            <h1>分店管理</h1>
          </div>
          <div>
            {/* <button class={styles.saveBtn} onClick={() => setCreatingBranch(true)}>
              新建分店
            </button> */}
          </div>
        </div>
      </header>

      <main class={styles.main}>
        <div class={styles.statsSection}>
          <div class={styles.statCard}>
            <div class={styles.statIcon}>🏢</div>
            <div class={styles.statContent}>
              <h3>总分店数</h3>
              <p>{getBranchStats().total}</p>
            </div>
          </div>
          <div class={styles.statCard}>
            <div class={styles.statIcon}>✅</div>
            <div class={styles.statContent}>
              <h3>营业中</h3>
              <p>{getBranchStats().active}</p>
            </div>
          </div>
          <div class={styles.statCard}>
            <div class={styles.statIcon}>🪑</div>
            <div class={styles.statContent}>
              <h3>总桌位数</h3>
              <p>{getBranchStats().totalTables}</p>
            </div>
          </div>
          <div class={styles.statCard}>
            <div class={styles.statIcon}>📊</div>
            <div class={styles.statContent}>
              <h3>今日预订</h3>
              <p>{getBranchStats().totalBookings}</p>
            </div>
          </div>
          <div class={styles.statCard}>
            <div class={styles.statIcon}>💰</div>
            <div class={styles.statContent}>
              <h3>月营收</h3>
              <p>¥{getBranchStats()?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div class={styles.controls}>
          <div class={styles.controlsRow} style={{ position: 'relative', minHeight: '48px' }}>
            <div class={styles.filterBox}>
              <select
                value={selectedStatus()}
                onChange={(e) => setSelectedStatus(e.target.value)}
                class={styles.statusFilter}
              >
                <option value="ALL">全部状态</option>
                <option value={ADMIN_CONSTANTS.BRANCH_STATUS.ACTIVE}>营业中</option>
                <option value={ADMIN_CONSTANTS.BRANCH_STATUS.INACTIVE}>暂停营业</option>
                <option value={ADMIN_CONSTANTS.BRANCH_STATUS.DELETED}>维护中</option>
              </select>
            </div>
            
          </div>
          <button 
            class={styles.createBranchBtn}
            style={{padding: '8px 24px', borderRadius: '24px', background: 'linear-gradient(90deg, #7c3aed 0%, #6366f1 100%)', color: '#fff', fontWeight: 600, fontSize: '16px', boxShadow: '0 2px 8px rgba(124,58,237,0.08)', border: 'none', cursor: 'pointer', transition: 'background 0.2s', 'border-radius': '8px;'}}
            onClick={() => setCreatingBranch(true)}
          >
            <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>＋</span>新建分店
          </button>
          
        </div>

        <div class={styles.branchList}>
          {loading() ? (
            <div class={styles.loading}>加载中...</div>
          ) : (
            <For each={filteredBranches()}>
              {(branch) => (
                <div class={styles.branchCard}>
                  <div class={styles.branchHeader}>
                    <div class={styles.branchName}>{branch.name}</div>
                    <div 
                      class={styles.statusBadge}
                      style={{ background: getStatusColor(branch.status) }}
                    >
                      {getStatusText(branch.status)}
                    </div>
                  </div>
                  
                  <div class={styles.branchInfo}>
                    <div class={styles.basicInfo}>
                      <div class={styles.infoGrid}>
                        <div class={styles.infoItem}>
                          <span class={styles.label}>地址:</span>
                          <span>{branch.address}</span>
                        </div>
                        <div class={styles.infoItem}>
                          <span class={styles.label}>电话:</span>
                          <span>{branch.contactNumber}</span>
                        </div>
                        <div class={styles.infoItem}>
                          <span class={styles.label}>经理:</span>
                          <span>{branch.contactName}</span>
                        </div>
                        <div class={styles.infoItem}>
                          <span class={styles.label}>营业时间:</span>
                          <span>{formatTime(branch.openTime)} - {formatTime(branch.closeTime)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class={styles.statsInfo}>
                      <div class={styles.statItem}>
                        <div class={styles.statValue}>{branch.totalTables}</div>
                        <div class={styles.statLabel}>总桌位</div>
                      </div>
                      <div class={styles.statItem}>
                        <div class={styles.statValue}>{branch.availableTables}</div>
                        <div class={styles.statLabel}>可用桌位</div>
                      </div>
                      <div class={styles.statItem}>
                        <div class={styles.statValue}>{branch.todayBookings}</div>
                        <div class={styles.statLabel}>今日预订</div>
                      </div>
                      <div class={styles.statItem}>
                        <div class={styles.statValue}>¥{branch?.monthlyRevenue?.toLocaleString() || 0}</div>
                        <div class={styles.statLabel}>月营收</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class={styles.branchActions}>
                    <select
                      value={branch.status}
                      onChange={(e) => handleStatusChange(branch.id, e.target.value)}
                      class={styles.statusSelect}
                    >
                      <option value={ADMIN_CONSTANTS.BRANCH_STATUS.ACTIVE}>营业中</option>
                      <option value={ADMIN_CONSTANTS.BRANCH_STATUS.INACTIVE}>暂停营业</option>
                      <option value={ADMIN_CONSTANTS.BRANCH_STATUS.DELETED}>删除</option>
                    </select>
                    
                    <button
                      class={styles.editBtn}
                      onClick={() => handleEditBranch(branch)}
                    >
                      编辑
                    </button>
                  </div>
                </div>
              )}
            </For>
          )}
          
          {!loading() && filteredBranches().length === 0 && (
            <div class={styles.emptyState}>
              <p>没有找到匹配的分店</p>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {/* Create Modal */}
      {creatingBranch() && (
        <div class={styles.modal}>
          <div class={styles.modalContent}>
            <div class={styles.modalHeader}>
              <h2>新建分店</h2>
              <button class={styles.closeBtn} onClick={handleCancelCreate}>×</button>
            </div>
            <div class={styles.modalBody}>
              <div class={styles.formGrid}>
                <div class={styles.formGroup}>
                  <label>分店名称</label>
                  <input
                    type="text"
                    value={newBranch().name}
                    onInput={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div class={styles.formGroup}>
                  <label>地址</label>
                  <input
                    type="text"
                    value={newBranch().address}
                    onInput={(e) => setNewBranch(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div class={styles.formGroup}>
                  <label>电话</label>
                  <input
                    type="text"
                    value={newBranch().contactNumber}
                    onInput={(e) => setNewBranch(prev => ({ ...prev, contactNumber: e.target.value }))}
                  />
                </div>
                <div class={styles.formGroup}>
                  <label>经理</label>
                  <input
                    type="text"
                    value={newBranch().contactName}
                    onInput={(e) => setNewBranch(prev => ({ ...prev, contactName: e.target.value }))}
                  />
                </div>
                <div class={styles.formGroup}>
                  <label>开门时间</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={parseInt(newBranch().openTime?.split(':')[0] || '9', 10)}
                    onInput={(e) => {
                      const hour = e.target.value.padStart(2, '0');
                      setNewBranch(prev => ({ ...prev, openTime: hour + ':00' }));
                    }}
                  />
                </div>
                <div class={styles.formGroup}>
                  <label>关门时间</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={parseInt(newBranch().closeTime?.split(':')[0] || '18', 10)}
                    onInput={(e) => {
                      const hour = e.target.value.padStart(2, '0');
                      setNewBranch(prev => ({ ...prev, closeTime: hour + ':00' }));
                    }}
                  />
                </div>
                {/* <div class={styles.formGroup}>
                  <label>桌位数</label>
                  <input
                    type="number"
                    min="1"
                    value={newBranch().totalTables}
                    onInput={(e) => setNewBranch(prev => ({ ...prev, totalTables: Number(e.target.value) }))}
                  />
                </div> */}
                <div class={styles.formGroup}>
                  <label>状态</label>
                  <select
                    value={newBranch().status}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, status: e.target.value }))}
                    class={styles.create_seletect}
                  >
                    {/* style={{ padding: '8px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '18px', background: '#f9fafb' }} */}
                    <option value={ADMIN_CONSTANTS.BRANCH_STATUS.ACTIVE}>营业中</option>
                    <option value={ADMIN_CONSTANTS.BRANCH_STATUS.INACTIVE}>暂停营业</option>
                    <option value={ADMIN_CONSTANTS.BRANCH_STATUS.MAINTENANCE}>维护中</option>
                  </select>
                </div>
              </div>
              <div class={styles.formGroup} style={{ margin: '12px 0 0 0', "text-align": 'left', width: '100%' }}>
                  <label>分店描述</label>
                  <textarea
                    rows={8}
                    class={styles.create_textarea}
                    value={newBranch().description || ''}
                    onInput={(e) => setNewBranch(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="请输入分店描述..."
                  ></textarea>
                </div>
            </div>
            <div class={styles.modalActions}>
              <button class={styles.cancelBtn} onClick={handleCancelCreate}>
                取消
              </button>
              <button class={styles.saveBtn} onClick={handleCreateBranch}>
                新建
              </button>
            </div>
          </div>
        </div>
      )}
      {editingBranch() && (
        <div class={styles.modal}>
          <div class={styles.modalContent}>
            <div class={styles.modalHeader}>
              <h2>编辑分店信息</h2>
              <button class={styles.closeBtn} onClick={handleCancelEdit}>×</button>
            </div>
            
            <div class={styles.modalBody}>
              <div class={styles.formGrid}>
                <div class={styles.formGroup}>
                  <label>分店名称</label>
                  <input
                    type="text"
                    value={editingBranch().name}
                    onInput={(e) => setEditingBranch(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div class={styles.formGroup}>
                  <label>地址</label>
                  <input
                    type="text"
                    value={editingBranch().address}
                    onInput={(e) => setEditingBranch(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                
                <div class={styles.formGroup}>
                  <label>电话</label>
                  <input
                    type="text"
                    value={editingBranch().contactNumber}
                    onInput={(e) => setEditingBranch(prev => ({ ...prev, contactNumber: e.target.value }))}
                  />
                </div>
                
                <div class={styles.formGroup}>
                  <label>经理</label>
                  <input
                    type="text"
                    value={editingBranch().contactName}
                    onInput={(e) => setEditingBranch(prev => ({ ...prev, contactName: e.target.value }))}
                  />
                </div>
                
                <div class={styles.formGroup}>
                  <label>开门时间</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={parseInt(editingBranch().openTime?.split(':')[0] || '0', 10)}
                    onInput={(e) => {
                      const hour = e.target.value.padStart(2, '0');
                      setEditingBranch(prev => ({ ...prev, openTime: hour + ':00' }));
                    }}
                  />
                </div>
                
                <div class={styles.formGroup}>
                  <label>关门时间</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={parseInt(editingBranch().closeTime?.split(':')[0] || '0', 10)}
                    onInput={(e) => {
                      const hour = e.target.value.padStart(2, '0');
                      setEditingBranch(prev => ({ ...prev, closeTime: hour + ':00' }));
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div class={styles.modalActions}>
              <button class={styles.cancelBtn} onClick={handleCancelEdit}>
                取消
              </button>
              <button class={styles.saveBtn} onClick={handleSaveBranch}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
