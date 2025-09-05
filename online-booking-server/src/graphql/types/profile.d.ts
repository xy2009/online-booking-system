export interface Profile {
    id: string;
    accountId: string;
    nickName: string;
    avatarUrl?: string;
    createdAt: number;
    updatedAt: number;
    type: string;
}

export interface ProfileInput {
    nickName: string;
    avatarUrl?: string;
}

export interface ProfileUpdateInput {
    nickName?: string;
    avatarUrl?: string;
}

export interface ProfileFilter {
    userId?: string;
    accountId?: string;
}
