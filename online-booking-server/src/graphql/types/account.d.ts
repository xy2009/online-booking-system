type Role = 'customer' | 'staff' | 'admin';
type Statuse = 'active' | 'inactive' | 'banned' | 'deleted';

export interface Account {
    id: string;
    mobile: string;
    password: string; // hashed password, only for create or update
    role: Role;
    status: Statuse;
    username?: string;
    createdAt: number;
    updatedAt: number;
    lastLogin?: number;
    issuer?: string;
    userId?: string;
    type: string;
}

export interface AccountInput {
    mobile: string;
    password: string; // plain text password, only for create or update
    role?: Role; // optional, default to 'customer'
    status?: Statuse; // optional, default to 'active'
    username?: string;
}

export interface AccountUpdateInput {
    password?: string; // plain text password, only for update
    status?: Statuse; // optional
    username?: string;
}

export interface AccountFilter {
    mobile?: string; // support fuzzy search
    role?: Role;
    status?: Statuse;
    createdFrom?: number; // created time range start
    createdTo?: number; // created time range end
}

export interface AccountListResult {
    total: number; // total count
    items: Account[];
    page: number; // current page number
    pageSize: number; // page size
}

