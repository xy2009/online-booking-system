// 活跃 active, 非活跃 inactive, 休假 on_leave, 离职 terminated
export type SysStaffStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';


export type Sex = 'male' | 'female';


export interface SysStaff {
  id: string;
  accountId: string; // 关联的账号ID
  branchId: string; // 关联的门店ID
  name: string; // 员工姓名
  sex: Sex; // 性别: 1-男，2-女
  position: string; // 职位，如服务员、经理等
  contactNumber?: string; // 联系电话
  email?: string; // 邮箱
  status: SysStaffStatus; // 员工状态
  hireDate: string; // 入职日期
  terminationDate?: string; // 离职日期，若员工已离职则有值
  notes?: string; // 备注
  createdAt: number;
  updatedAt: number;
  type: string; // 集合类型
}

export interface SysStaffInput {
  name: string; // 员工姓名
  position: string; // 职位，如服务员、经理等
  contactNumber?: string; // 联系电话
  email?: string; // 邮箱
  status?: SysStaffStatus; // 员工状态，默认为 'active'
  hireDate: string; // 入职日期
}

export interface SysStaffUpdateInput {
  name?: string; // 可选，员工姓名
  position?: string; // 可选，职位，如服务员、经理等
  contactNumber?: string; // 可选，联系电话
  email?: string; // 可选，邮箱
  status?: SysStaffStatus; // 可选，员工状态
}

export interface SysStaffFilter {
  name?: string; // 员工姓名，支持模糊搜索
  position?: string; // 职位，如服务员、经理等
  status?: SysStaffStatus; // 员工状态
  hireDateFrom?: string; // 入职日期范围开始
  hireDateTo?: string; // 入职日期范围结束
}

export interface SysStaffListResult {
  items: SysStaff[];
  total: number; // 总条数
  page: number; // 当前页码
  pageSize: number; // 每页条数
}

