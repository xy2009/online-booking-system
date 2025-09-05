
export type BookingStatus =
  | "pending" // 待处理，用户提交预订请求，等待商家确认
  | "confirmed" // 已确认，商家已确认预订
  | "cancelled" // 已取消，用户或商家取消预订
  | "completed" // 已完成，用户已到店并完成用餐
  | "no_show"; // 未到店，用户未按时到店且未取消预订

export type BookingType =
  | "online" // 在线预订，通过网站或App预订
  | "phone" // 电话预订，通过电话预订
  | "in_person"; // 现场预订，用户到店现场预订

export type BookingAction =
  | "create" // 创建预订
  | "confirm" // 确认预订
  | "cancel" // 取消预订
  | "confirm" // 确认预订
  | "complete" // 完成预订
  | "no_show" // 用户未到店  
  | "update"; // 更新预订 默认值

export interface Booking {
  id: string;
  userId: string;
  tableId?: string;
  bookingTime: number; // 预订时间
  numberOfPeople: number; // 用餐人数
  status: BookingStatus;
  specialRequests?: string; // 特殊要求
  createdAt: number;
  updatedAt: number;
  type: string; // 集合类型
  bookingType?: BookingType; // 可选，默认为 'online'
  maintenanceLogs?: BookingMaintenance[]; // 可选维护日志
  isDeleted?: boolean; // 软删除标志
} 

export interface BookingInput {
  userId: string;
  tableId?: string;// 可选，若不指定则由系统分配，前期人工，后期自动；客户指定则优先分配
  bookingTime: number; // 预订时间
  numberOfPeople: number; // 用餐人数
  status?: BookingStatus; // 可选，默认为 'pending'
  specialRequests?: string; // 可选，特殊要求
  bookingType?: BookingType; // 可选，默认为 'online'
}

export interface BookingUpdateInput {
  tableId?: string;// 可选，若不指定则不更新
  bookingTime?: number; // 可选，预订时间
  numberOfPeople?: number; // 可选，用餐人数
  status?: BookingStatus; // 可选，预订状态
  specialRequests?: string; // 可选，特殊要求
  isDeleted?: boolean; // 可选，软删除标志
}

export interface BookingFilter {
  userId?: string;
  tableId?: string;
  status?: BookingStatus;
  bookingTimeFrom?: number; // 预订时间范围开始
  bookingTimeTo?: number; // 预订时间范围结束
  isDeleted?: boolean; // 软删除过滤
}

export interface BookingListResult {
    total: number; // 总条数
  items: Booking[];
  page: number; // 当前页码
  pageSize: number; // 每页条数
}

export interface BookingMaintenance {
  id: string;
  tableId?: string;
  action: BookingAction; // 维护操作，如 'create', 'update', 'cancel', 'confirm', 'complete', 'no_show'
  performedBy: string; // 操作人ID
  performedAt: number; // 操作时间
  notes?: string; // 可选备注
}
