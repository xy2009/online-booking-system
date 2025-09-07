import { createSignal, onMount, For } from 'solid-js';
import { tableStore } from '../stores/tableStore';
import { A, useNavigate } from '@solidjs/router';
import { authStore } from '../stores/authStore';
import { branchStore } from '../stores/branchStore';
import { ADMIN_CONSTANTS } from '../constants';
// import { TABLE_STATUS, TABLE_STATUS_TEXT } from '@booking/shared-utils'
import styles from './TableManagement.module.css';

export default function TableManagement() {
  // 新建弹窗相关信号
  const [creatingTable, setCreatingTable] = createSignal(false);
  const tableInitData = {
  branchId: '',
  name: '',
  size: 4,
  status: ADMIN_CONSTANTS.TABLE_STATUS.FREE,
  location: 'indoor', // 默认选中大堂
  description: '',
  tags: '',
  maxSize: '',
  turntableCycle: 90
  };
  const [newTable, setNewTable] = createSignal({ ...tableInitData });
  // 控制分店下拉显示
  const [showBranchDropdown, setShowBranchDropdown] = createSignal(false);
  // 分店搜索信号
  const [branchSearch, setBranchSearch] = createSignal('');
  const navigate = useNavigate();
  const { tables, loading, error, fetchTables, updateTableInStore } = tableStore;
  const [selectedBranch, setSelectedBranch] = createSignal('ALL');
  const [selectedStatus, setSelectedStatus] = createSignal('ALL');

  onMount(async () => {
    if (!authStore.isAuthenticated()) {
      navigate('/login');
      return;
    }

    await branchStore.fetchBranches();
    await tableStore.fetchTables();
  });

  const branches = () => {
    console.log('branchStore.branches():', branchStore.branches());
// table.branchName
    const branchSet = new Set((branchStore.branches() || []).map(branch => branch.name));
    return Array.from(branchSet);
  };

  const filteredTables = () => {
  let filtered = tables() || [];
    
    if (selectedBranch() !== 'ALL') {
      filtered = filtered.filter(table => table.branchName === selectedBranch());
    }
    
    if (selectedStatus() !== 'ALL') {
      filtered = filtered.filter(table => table.status === selectedStatus());
    }
    
    return filtered;
  };

  const getStatusColor = (status) => {
    const colors = {
      [ADMIN_CONSTANTS.TABLE_STATUS.FREE]: '#10b981',
      [ADMIN_CONSTANTS.TABLE_STATUS.RESERVED]: '#3b82f6',
      [ADMIN_CONSTANTS.TABLE_STATUS.BOOKED]: '#3b82f6',
      [ADMIN_CONSTANTS.TABLE_STATUS.CONFIRMED]: '#3b82f6',
      [ADMIN_CONSTANTS.TABLE_STATUS.OCCUPIED]: '#f59e0b',
      [ADMIN_CONSTANTS.TABLE_STATUS.CLEANING]: '#f59e0b',
      [ADMIN_CONSTANTS.TABLE_STATUS.MAINTENANCE]: '#ef4444',
      [ADMIN_CONSTANTS.TABLE_STATUS.UNAVAILABLE]: '#6a0b0bff',
    };
    return colors[status] || '#6b7280';
  };
   

  const getStatusText = (status) => {
    const texts = {
      [ADMIN_CONSTANTS.TABLE_STATUS.FREE]: '可用',
      [ADMIN_CONSTANTS.TABLE_STATUS.RESERVED]: '预留',
      [ADMIN_CONSTANTS.TABLE_STATUS.BOOKED]: '已预订',
      [ADMIN_CONSTANTS.TABLE_STATUS.CONFIRMED]: '已确认',
      [ADMIN_CONSTANTS.TABLE_STATUS.OCCUPIED]: '占用中',
      [ADMIN_CONSTANTS.TABLE_STATUS.CLEANING]: '清洁中',
      [ADMIN_CONSTANTS.TABLE_STATUS.MAINTENANCE]: '维护中',
      [ADMIN_CONSTANTS.TABLE_STATUS.UNAVAILABLE]: '不可用',
    };
    return texts[status] || status;
  };

  const handleStatusChange = (tableId, newStatus, turntableCycle) => {
    updateTableInStore(tableId, { status: newStatus, turntableCycle });
  };

  const handleClearTable = (tableId) => {
    if (confirm('确定要清理这张桌子吗？')) {
      updateTableInStore(tableId, { status: 'cleaning'});
    }
  };

  const createTable = async () => {
    const payload = { ...newTable(), tags: newTable().tags ? newTable().tags.split(',').map(t => t.trim()) : [] };
    await tableStore.createTableInStore(payload);
    setCreatingTable(false);
    setNewTable({ ...tableInitData });
};

  const getTableStats = () => {
    const stats = {
      total: tables().length,
      free: 0,
      reserved: 0,
      booked: 0,
      confirmed: 0,
      occupied: 0,
      cleaning: 0,
      maintenance: 0,
      unavailable: 0,
    };
    
    tables().forEach(table => {
      switch (table.status) {
        case 'free':
          stats.free++;
          break;
        case 'reserved':
          stats.reserved++;
          break;
        case 'booked':
          stats.booked++;
          break;
        case 'confirmed':
          stats.confirmed++;
          break;
        case 'occupied':
          stats.occupied++;
          break;
        case 'cleaning':
          stats.cleaning++;
          break;
        case 'maintenance':
          stats.maintenance++;
          break;
        case 'unavailable':
          stats.unavailable++;
          break;        
      }
    });
    
    return stats;
  };

  return (
    <div class={styles.tableManagement}>
      <header class={styles.header}>
        <div class={styles.headerContent}>
          <div class={styles.titleSection}>
            <button class={styles.backBtn} onClick={() => navigate('/')}>
              ← 返回
            </button>
            <h1>桌位管理</h1>
          </div>
          
        </div>
      </header>

      <main class={styles.main}>
        <div class={styles.statsSection}>
          <div class={styles.statCard}>
            <div class={styles.statIcon}>🪑</div>
            <div class={styles.statContent}>
              <h3>总桌位</h3>
              <p>{getTableStats().total}</p>
            </div>
          </div>
          <div class={styles.statCard}>
            <div class={styles.statIcon}>✅</div>
            <div class={styles.statContent}>
              <h3>可用</h3>
              <p>{getTableStats().available}</p>
            </div>
          </div>
          <div class={styles.statCard}>
            <div class={styles.statIcon}>👥</div>
            <div class={styles.statContent}>
              <h3>占用中</h3>
              <p>{getTableStats().occupied}</p>
            </div>
          </div>
          <div class={styles.statCard}>
            <div class={styles.statIcon}>📅</div>
            <div class={styles.statContent}>
              <h3>已预订</h3>
              <p>{getTableStats().reserved}</p>
            </div>
          </div>
          <div class={styles.statCard}>
            <div class={styles.statIcon}>🔧</div>
            <div class={styles.statContent}>
              <h3>维护中</h3>
              <p>{getTableStats().maintenance}</p>
            </div>
          </div>
        </div>

        <div class={`${styles.controls} ${styles.create_btn}`}>
          <div class={styles.filters_head}>
            <div class={styles.filterBox}>
              <select
                value={selectedBranch()}
                onChange={(e) => setSelectedBranch(e.target.value)}
                class={styles.branchFilter}
              >
                <option value="ALL">全部分店</option>
                <For each={branches()}>
                  {(branch) => <option value={branch}>{branch}</option>}
                </For>
              </select>
            </div>
            
            <div class={styles.filterBox}>
              <select
                value={selectedStatus()}
                onChange={(e) => setSelectedStatus(e.target.value)}
                class={styles.statusFilter}
              >
                <option value="ALL">全部状态</option>
                <For each={Object.values(ADMIN_CONSTANTS.TABLE_STATUS)}>
                  {(status) => (
                    <option value={status}>{getStatusText(status)}</option>
                  )}
                </For>
              </select>
            </div>
          </div>
          
          <div>
            <button class={styles.saveBtn} onClick={() => setCreatingTable(true)}>
              新建餐桌
            </button>
          </div>
          
        </div>

        <div class={styles.tableGrid}>
          {loading() ? (
            <div class={styles.loading}>加载中...</div>
          ) : (
            <For each={filteredTables()}>
              {(table) => (
                <div class={styles.tableCard}>
                  <div class={styles.tableHeader}>
                    <div class={styles.tableNumber}>{table.name}</div>
                    <div 
                      class={styles.statusBadge}
                      style={{ background: getStatusColor(table.status) }}
                    >
                      {getStatusText(table.status)}
                    </div>
                  </div>
                  
                  <div class={styles.tableInfo}>
                    <div class={styles.branchName}>{branchStore.branchesMap()[table.branchId]?.name || '未知门店'}</div>
                    <div class={styles.tableDetails}>
                      <div class={styles.detailItem}>
                        <span class={styles.label}>容量:</span>
                        <span>{table.size}人</span>
                      </div>
                      <div class={styles.detailItem}>
                        <span class={styles.label}>位置:</span>
                        <span>{ADMIN_CONSTANTS.LOCATION_TYPE_TEXT[table.location]}</span>
                      </div>
                      <div class={styles.detailItem}>
                        <span class={styles.label}>描述:</span>
                        <span>{table.description}</span>
                      </div>
                      <div class={styles.features}>
                        <span class={styles.label}>标签:</span>
                        <For each={table.tags}>
                          {(tag) => (
                            <span class={styles.featureTag}>{tag}</span>
                          )}
                        </For>
                      </div>
                      
                    </div>
{/*                     
                    {table.currentBooking && (
                      <div class={styles.currentBooking}>
                        <h4>当前预订</h4>
                        <p><strong>{table.currentBooking.customerName}</strong></p>
                        <p>{table.currentBooking.startTime} · {table.currentBooking.partySize}人</p>
                      </div>
                    )} */}
                  </div>
                  
                  <div class={styles.tableActions}>
                    <select
                      value={table.status}
                      onChange={(e) => handleStatusChange(table.id, e.target.value, table.turntableCycle)}
                      class={styles.statusSelect}
                    >
                      <For each={Object.values(ADMIN_CONSTANTS.TABLE_STATUS)}>
                        {(status) => (
                          <option value={status}>{getStatusText(status)}</option>
                        )}
                      </For>
                    </select>
                    
                    {(table.status === 'OCCUPIED' || table.status === 'RESERVED') && (
                      <button
                        class={styles.clearBtn}
                        onClick={() => handleClearTable(table.id)}
                      >
                        清理桌位
                      </button>
                    )}
                  </div>
                </div>
              )}
            </For>
          )}
          
          {!loading() && filteredTables().length === 0 && (
            <div class={styles.emptyState}>
              <p>没有找到匹配的桌位</p>
            </div>
          )}
        {/* 新建餐桌弹窗 */}
        {creatingTable() && (
          <div class={styles.modal}>
            <div class={styles.modalContent}>
              <div class={styles.modalHeader}>
                <span>新建餐桌</span>
                <button class={styles.closeBtn} onClick={() => { setCreatingTable(false); setNewTable({ ...tableInitData }); }}>×</button>
              </div>
              <div class={styles.modalBody}>
                <div class={styles.formGrid}>
                  <div class={styles.formGroup}>
                    <label>餐桌名称</label>
                    <input type="text" class={styles.input} value={newTable().name} onInput={e => setNewTable(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div class={styles.formGroup}>
                    <label>容量</label>
                    <input type="number" class={styles.input} min="1" value={newTable().size} onInput={e => setNewTable(prev => ({ ...prev, size: Number(e.target.value) }))} />
                  </div>
                  <div class={styles.formGroup}>
                    <label>状态</label>
                    <select class={styles.create_seletect} value={newTable().status} onChange={e => setNewTable(prev => ({ ...prev, status: e.target.value }))}>
                      <For each={Object.entries(ADMIN_CONSTANTS.TABLE_STATUS_TEXT)}>
                        {([key, text]) => <option value={key}>{text}</option>}
                      </For>
                    </select>
                  </div>
                  <div class={styles.formGroup}>
                    <label>位置</label>
                    <select class={styles.create_seletect} value={newTable().location} onChange={e => setNewTable(prev => ({ ...prev, location: e.target.value }))}>
                      <For each={Object.entries(ADMIN_CONSTANTS.LOCATION_TYPE_TEXT)}>
                        {([key, text]) => <option value={key}>{text}</option>}
                      </For>
                    </select>
                  </div>
                  <div class={styles.formGroup}>
                    <label>分店名称</label>
                    <div class={styles.branchDropdownWrapper}>
                      <input
                        type="text"
                        class={styles.input}
                        value={branchSearch()}
                        onInput={e => {
                          setBranchSearch(e.target.value);
                          setShowBranchDropdown(true);
                        }}
                        placeholder="输入分店名称进行搜索"
                        autoComplete="off"
                        onFocus={() => {
                          setBranchSearch(branchStore.branches().find(b => b.id === newTable().branchId)?.name || '');
                          setShowBranchDropdown(true);
                        }}
                        onBlur={() => setTimeout(() => setShowBranchDropdown(false), 150)}
                      />
                      {showBranchDropdown() && (
                        <div class={styles.dropdown}>
                          <For each={(branchStore.branches() || []).filter(b => b.name.includes(branchSearch()))}>
                            {(branch) => (
                              <div
                                class={styles.dropdownItem}
                                onMouseDown={() => {
                                  setNewTable(prev => ({ ...prev, branchId: branch.id }));
                                  setBranchSearch(branch.name);
                                  setShowBranchDropdown(false);
                                }}
                                style={{
                                  background: newTable().branchId === branch.id ? '#f3f4f6' : 'white'
                                }}
                              >
                                {branch.name}
                              </div>
                            )}
                          </For>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* <div class={styles.formGroup}>
                    <label>位置</label>
                    <input type="text" class={styles.input} value={newTable().location} onInput={e => setNewTable(prev => ({ ...prev, location: e.target.value }))} />
                  </div> */}
                  <div class={styles.formGroup}>
                    <label>轮转周期(分钟)</label>
                    <input type="number" class={styles.input} min="1" value={newTable().turntableCycle} onInput={e => setNewTable(prev => ({ ...prev, turntableCycle: Number(e.target.value) }))} />
                  </div>
                  <div class={styles.formGroup}>
                    <label>最大容量</label>
                    <input type="number" class={styles.input} min="1" value={newTable().maxSize} onInput={e => setNewTable(prev => ({ ...prev, maxSize: Number(e.target.value) }))} />
                  </div>
                  <div class={styles.formGroup}>
                    <label>标签(逗号分隔)</label>
                    <input type="text" class={styles.input} value={newTable().tags} onInput={e => setNewTable(prev => ({ ...prev, tags: e.target.value }))} placeholder="如 test,很棒" />
                  </div>
                  
                </div>
                  <div class={styles.formGroup} style={{ 'margin-top': '10px' }}>
                    <label>描述</label>
                    <input type="text" class={styles.input} value={newTable().description} onInput={e => setNewTable(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
              </div>
              <div class={styles.modalActions}>
                <button class={styles.cancelBtn} onClick={() => { setCreatingTable(false); setNewTable({ ...tableInitData }); }}>取消</button>
                <button class={styles.saveBtn} onClick={createTable}>新建</button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
