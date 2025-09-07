import { createSignal } from 'solid-js';
import { findBranches, getBranchById, createBranch, updateBranch } from '../services/branchService';

const [branches, setBranches] = createSignal([]);
const [branchesMap, setBranchesMap] = createSignal({});
const [selectedBranch, setSelectedBranch] = createSignal(null);
const [loading, setLoading] = createSignal(false);
const [error, setError] = createSignal(null);

// 查询分店列表
const fetchBranches = async (params = {}) => {
  setLoading(true);
  setError(null);
  try {
    const input = {
      filter: {},
      pagination: {
        page: 1,
        pageSize: 100
      },
      ...params
    }
    const data = await findBranches(input);
    setBranches(data?.branches?.items || []);
    const map = {};
    (data?.branches?.items || []).forEach(branch => {
      map[branch.id] = branch;
    });
    setBranchesMap(map);
  } catch (e) {
    setError(e.message || '查询分店失败');
  } finally {
    setLoading(false);
  }
};

// 查询单个分店
const fetchBranchById = async (id) => {
  setLoading(true);
  setError(null);
  try {
    const data = await getBranchById(id);
    setSelectedBranch(data?.branch || null);
  } catch (e) {
    setError(e.message || '查询分店失败');
  } finally {
    setLoading(false);
  }
};

// 创建分店
const createBranchInStore = async (branchData) => {
  setLoading(true);
  setError(null);
  try {
    const data = await createBranch(branchData);
    console.log('Create branch response:', data);
    if (data?.createBranch) {
      await fetchBranches(); // 创建后刷新列表
    } else {
      setError('创建分店失败');
    }
  } catch (e) {
    setError(e.message || '创建分店失败');
  } finally {
    setLoading(false);
  }
};

// 更新分店
const updateBranchInStore = async (branchId, branchData) => {
  setLoading(true);
  setError(null);
  try {
    delete branchData.__typename; // 删除 __typename 字段
    delete branchData.id; // 删除 id 字段，避免冲突
    delete branchData.createdAt;
    const data = await updateBranch(branchId, branchData);
    if (data?.updateBranch) {
      await fetchBranches(); // 更新后刷新列表
      return data.updateBranch;
    } else {
      setError('更新分店失败');
    }
  } catch (e) {
    setError(e.message || '更新分店失败');
  } finally {
    setLoading(false);
  }
};

export const branchStore = {
  branches,
  branchesMap,
  selectedBranch,
  loading,
  error,
  fetchBranches,
  fetchBranchById,
  setSelectedBranch,
  createBranchInStore,
  updateBranchInStore,
};
