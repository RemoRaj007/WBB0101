import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../state_hubs/AuthContext';
import { POLICIES, AccessAction, AccessResource } from './policies';

interface AbacContextType {
    checkAccess: (action: AccessAction, resource: AccessResource) => boolean;
}

const AbacContext = createContext<AbacContextType | undefined>(undefined);

export const AbacProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    const checkAccess = (action: AccessAction, resource: AccessResource): boolean => {
        if (!user) return false;

        const policy = POLICIES.find(p => p.resource === resource && p.action === action);
        if (!policy) return false; // Default deny

        return policy.isAllowed({ role: user.role, district: user.district });
    };

    return (
        <AbacContext.Provider value={{ checkAccess }}>
            {children}
        </AbacContext.Provider>
    );
};

export const useAbac = () => {
    const context = useContext(AbacContext);
    if (!context) throw new Error('useAbac must be used within an AbacProvider');
    return context;
};
