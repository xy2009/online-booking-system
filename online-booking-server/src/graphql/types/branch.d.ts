
export type BranchStatus = 'active' | 'inactive' | 'deleted';

export interface BranchMaintenance {
  id: string;
  accountId: string; // 维护操作人ID
  backUp: string; // 维护前的分店数据快照，JSON字符串
  performedAt: number; // 维护时间
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  contactName: string;
  contactNumber: string;
  status: BranchStatus;
  openTime: string
  closeTime: string;
  description?: String
  createdAt: number;
  updatedAt: number;
  maintenanceLogs?: BranchMaintenance[]; // 维护记录
  type: string; // 集合类型
}

export interface BranchInput {
    name: string;
    address: string;
    contactName: string;
    contactNumber: string;
    status?: BranchStatus; // 可选，默认为 'active'
    openTime: string
    closeTime: string;
    description?: String
}
export interface BranchUpdateInput {
    name?: string;
    address?: string;
    contactName?: string;
    contactNumber?: string;
    status?: BranchStatus;
    openTime?: string
    closeTime?: string;
    description?: String
}

export interface BranchFilter {
    name?: string; // 支持模糊搜索
    status?: BranchStatus;
}

export interface BranchListResult {
    total: number; // 总条数
    items: Branch[];
    page: number; // 当前页码
    pageSize: number; // 每页条数
}