import React from 'react';
import { useAuth } from '../../foundation/state_hubs/AuthContext';
import DistrictDashboard from './DistrictDashboard';
import DivisionDashboard from './DivisionDashboard';
import NationalDashboard from './NationalDashboard';
import GroundDashboard from './GroundDashboard';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const role = user?.role;

    // National Level Roles
    if (role === 'National Officer' || role === 'Super User') {
        return <NationalDashboard />;
    }

    // District Level Roles
    if (role === 'District Officer') {
        return <DistrictDashboard />;
    }

    // Division Level Roles
    if (role === 'Division Officer') {
        return <DivisionDashboard />;
    }

    // Ground Level Roles
    if (role === 'GN Officer' || role === 'UN Volunteer') {
        return <GroundDashboard />;
    }

    // Default / Fallback
    return <GroundDashboard />;
};

export default Dashboard;
