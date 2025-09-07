import { createSignal, createEffect } from 'solid-js';
import { graphQLFetchWrapper } from '../utils/requesWrapper';
import { API_ENDPOINTS, HTTP_RES_CODES } from '../constants';
import { authStore } from './authStore';

const [branches, setBranches] = createSignal([]);
const [branchMap, setBranchMap] = createSignal({});
const [loading, setLoading] = createSignal(false);
const [error, setError] = createSignal(null);

export const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
        const response = await graphQLFetchWrapper(
            `
                query Branches($filter: BranchFilterInput!, $pagination: PaginationInput!) {
                    branches(filter: $filter, pagination: $pagination) {
                        total
                        page
                        pageSize
                        items {
                            id
                            name
                            address
                            openTime
                            closeTime
                            description
                            contactName
                            contactNumber
                            status
                            createdAt
                            updatedAt
                        }
                    }
                }`,
            {
                filter: { status: "active" },
                pagination: { page: 1, pageSize: 20 }
            }
        );
        const { ok, success, code, data: { branches: branchData } = {} } = response;
        if (ok && success && branchData) {
            const map = {};
            const nBranches = (branchData.items || []).map(branch => {
                branch.description = branch.description || '一间很棒的餐厅。';
                !branch.openTime && (branch.openTime = '10:00');
                !branch.closeTime && (branch.closeTime = '22:00');
                map[branch.id] = branch;
                return branch;
            });
            setBranches(nBranches|| []);
            setBranchMap(map);
        } else if (code === HTTP_RES_CODES.UNAUTHORIZED) {
            authStore.clearAuth();
            setBranches([]);
            setError('请先登录');
        } else {
            setError('获取门店信息失败');
        }
    } catch (err) {
        setError('网络错误，请稍后重试');
    } finally {
        setLoading(false);
    }
};

export const branchStore = {
    branches,
    branchMap,
    loading,
    error,
    fetchBranches
};