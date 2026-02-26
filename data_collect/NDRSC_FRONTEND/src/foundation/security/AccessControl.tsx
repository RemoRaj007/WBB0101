import { ReactNode } from 'react';
import { useAbac } from './AbacContext';
import { AccessAction, AccessResource } from './policies';

interface AccessControlProps {
    action: AccessAction;
    resource: AccessResource;
    children: ReactNode;
    fallback?: ReactNode;
}

export const AccessControl: React.FC<AccessControlProps> = ({
    action,
    resource,
    children,
    fallback = null
}) => {
    const { checkAccess } = useAbac();

    if (checkAccess(action, resource)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
