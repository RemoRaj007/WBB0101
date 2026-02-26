export type AccessAction = 'view' | 'create' | 'edit' | 'delete' | 'approve';
export type AccessResource = 'dashboard' | 'users' | 'reports' | 'settings';

export interface UserAttributes {
    role: string;
    district?: string;
}

export interface Policy {
    resource: AccessResource;
    action: AccessAction;
    isAllowed: (user: UserAttributes) => boolean;
}

export const POLICIES: Policy[] = [
    {
        resource: 'dashboard',
        action: 'view',
        isAllowed: (user) => ['admin', 'officer', 'citizen'].includes(user.role)
    },
    {
        resource: 'users',
        action: 'view',
        isAllowed: (user) => user.role === 'admin'
    },
    {
        resource: 'users',
        action: 'create',
        isAllowed: (user) => user.role === 'admin'
    },
    {
        resource: 'users',
        action: 'edit',
        isAllowed: (user) => user.role === 'admin'
    },
    {
        resource: 'users',
        action: 'delete',
        isAllowed: (user) => user.role === 'admin'
    }
];
