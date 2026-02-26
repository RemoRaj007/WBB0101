import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../foundation/state_hubs/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Checkpoint = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner message="Loading session..." />;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminCheckpoint = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner message="Loading session..." />;
    }

    const adminRoles = ['Super User', 'National Officer'];
    if (!user || !adminRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default Checkpoint;
