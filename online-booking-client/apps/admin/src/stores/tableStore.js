// taskF: tableStore 封装
import { createSignal } from 'solid-js';
import { findTables, getTableById, createTable, updateTable, disableTable } from '../services/tableService';

const [tables, setTables] = createSignal([]);
const [selectedTable, setSelectedTable] = createSignal(null);
const [loading, setLoading] = createSignal(false);
const [error, setError] = createSignal(null);

// 查询餐桌列表
const fetchTables = async (params = {}) => {
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
    const data = await findTables(input);
    console.log('Fetched tables:', data);
    setTables(data?.tables?.items || []);
  } catch (e) {
    setError(e.message || '查询餐桌失败');
  } finally {
    setLoading(false);
  }
};

// 查询单个餐桌
const fetchTableById = async (id) => {
  setLoading(true);
  setError(null);
  try {
    const data = await getTableById(id);
    setSelectedTable(data?.table || null);
  } catch (e) {
    setError(e.message || '查询餐桌失败');
  } finally {
    setLoading(false);
  }
};

// 创建餐桌
const createTableInStore = async (tableData) => {
  setLoading(true);
  setError(null);
  try {
    const data = await createTable(tableData);
    if (data?.createTable) {
      await fetchTables(); // 创建后刷新列表
    } else {
      setError('创建餐桌失败');
    }
  } catch (e) {
    setError(e.message || '创建餐桌失败');
  } finally {
    setLoading(false);
  }
};

// 更新餐桌
const updateTableInStore = async (tableId, tableData) => {
  setLoading(true);
  setError(null);
  try {
    console.log('Updating table:', tableId, tableData);
    const data = await updateTable(tableId, tableData);
    console.log('Update table response:', data);
    if (data?.updateTable) {
      await fetchTables(); // 更新后刷新列表
    } else {
      setError('更新餐桌失败');
    }
  } catch (e) {
    setError(e.message || '更新餐桌失败');
  } finally {
    setLoading(false);
  }
};

// 禁用餐桌
const disableTableInStore = async (tableId) => {
  setLoading(true);
  setError(null);
  try {
    const data = await disableTable(tableId);
    if (data?.success) {
      await fetchTables(); // 删除后刷新列表
    } else {
      setError('删除餐桌失败');
    }
  } catch (e) {
    setError(e.message || '删除餐桌失败');
  } finally {
    setLoading(false);
  }
};

export const tableStore = {
  tables,
  selectedTable,
  loading,
  error,
  fetchTables,
  fetchTableById,
  setSelectedTable,
  createTableInStore,
  updateTableInStore,
  disableTableInStore,
};

