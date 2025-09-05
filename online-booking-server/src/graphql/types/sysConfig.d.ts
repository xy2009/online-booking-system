export interface BookingMaintenance {
  id: string;
  bookingId: string;
  staffId: string; // 维护操作的员工ID
  action: string; // 维护操作描述，如 "修改时间"、"取消预订" 等
  timestamp: number; // 操作时间
  notes?: string; // 可选备注
}

export type SysConfigType = 'system' | 'payment' | 'notification' | 'other';

export interface SysConfig {
  id: string;
  key: string; // 配置项键
  value: string; // 配置项值，通常为JSON字符串
  description?: string; // 可选描述
  configType: SysConfigType; // 配置类型
  createdAt: number;
  updatedAt: number;
  type: string; // 集合类型
}

export interface SysConfigInput {
  key: string; // 配置项键
  value: string; // 配置项值，通常为JSON字符串
  description?: string; // 可选描述
  configType: SysConfigType; // 配置类型
}

export interface SysConfigUpdateInput {
  value?: string; // 可选，配置项值，通常为JSON字符串
  description?: string; // 可选描述
  configType?: SysConfigType; // 可选，配置类型
}

export interface SysConfigFilter {
  key?: string; // 支持模糊搜索
  configType?: SysConfigType;
}

export interface SysConfigListResult {
    total: number; // 总条数
    items: SysConfig[];
    page: number; // 当前页码
    pageSize: number; // 每页条数
}