

export interface IAccount {
    id: string;
    mobile: string;
    password: string; // hashed password
    role: 'customer' | 'staff' | 'admin';
    status: 'active' | 'inactive' | 'banned' | 'deleted';
    username?: string;
    createdAt: number;
    updatedAt: number;
    lastLogin?: number;
    issuer?: string;
    userId?: string;
}

export interface IAccountResponse extends Omit<IAccount, 'password'> {
    nickName?: string;
    password?: string;
    type?: string;

    // authMiddleware 通过会附加上
    clientId?: string;
}

export interface IProfile {
    id: string;
    accountId: string;
    nickName: string;
    avatarUrl?: string;
    createdAt: number;
    updatedAt: number;
    type?: string;
}