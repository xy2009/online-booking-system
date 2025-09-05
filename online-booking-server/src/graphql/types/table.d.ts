export type TableStatus =
  | 'free'         // 空闲，可直接分配或预订
  | 'reserved'     // 预留（内部锁定或临时锁定）
  | 'booked'       // 顾客已预订
  | 'confirmed'    // 预订已确认（如已支付定金）
  | 'occupied'     // 顾客已到店并入座
  | 'cleaning'     // 清洁中，用餐结束后，清洁中，暂不可用
  | 'maintenance'  // 维修中，暂不可用
  | 'unavailable'; // 不可用，如封禁等特殊情况，不可分配或预订

export type TableLocation =
  | 'indoor'   // 室内
  | 'outdoor'  // 室外
  | 'private'; // 包间  

export interface Table {
  id: string;
  branchId: string; // 所属分店ID
  name: string;
  size: number;// 默认容量
  maxSize?: number; // 最大容量，可选
  // 位置类型：室内、室外、吧台、包间等
  location?: TableLocation;
  // 状态：空闲、预留、预订、确认、入座、清洁中、维修中、不可用等
  status: TableStatus;
  turntableCycle: number; // 翻台周期，单位分钟
  description?: string;// 可选描述
  tags?: string[];// 可选标签
  createdAt: number;
  updatedAt: number;
  lastOccupiedAt?: number;// 最后一次入座时间
  lastCleanedAt?: number;// 最后一次清洁时间
  type: string;// 集合类型
  createdBy?: string;// 创建者ID
  updatedBy?: string;// 更新者ID
}

export interface TableInput {
    branchId: string;
    name: string;
    size: number;
    maxSize?: number; // 最大容量，可选
    location?: TableLocation;
    status: TableStatus; // 可选，默认为 'free'
    turntableCycle: number; // 翻台周期，单位分钟
    description?: string; // 可选描述
    tags?: string[]; // 可选标签
    }

export interface TableUpdateInput {
    name?: string;
    size?: number;
    maxSize?: number; // 最大容量，可选
    location?: TableLocation;
    status?: TableStatus; // 可选，默认为 'free'
    description?: string; // 可选描述
    tags?: string[]; // 可选标签
    turntableCycle?: number; // 翻台周期，单位分钟 150
}

export interface TableFilter {
    name?: string; // 支持模糊搜索
    location?: TableLocation;
    status?: TableStatus;
    sizeMin?: number; // 最小容量
    sizeMax?: number; // 最大容量
}

export interface TableListResult {
    total: number; // 总条数
    items: Table[];
    page: number; // 当前页码
    pageSize: number; // 每页条数
}

export interface TableBookingFilter {
  branchId: string
  startTime: number
  size: number
  location: TableLocation
  name: string
  minSize: number
  maxSize: number
}
