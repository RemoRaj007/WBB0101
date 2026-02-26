import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, Users, Home, MapPin } from 'lucide-react';
import { useAuth } from '../../foundation/state_hubs/AuthContext';
import { useTranslation } from 'react-i18next';
import { getReliefRequests } from '../../network/reliefService';

interface StatsCardProps {
    title: string;
    value: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'primary';
    icon: React.ElementType;
    change?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, type, icon: Icon, change }) => {
    // Enhanced color palette for 24/7 usage
    const colors = {
        primary: {
            main: '#2563eb',
            light: '#3b82f6',
            dark: '#1d4ed8',
            bg: '#eff6ff',
            border: '#bfdbfe'
        },
        success: {
            main: '#059669',
            light: '#10b981',
            bg: '#ecfdf5',
            border: '#a7f3d0'
        },
        warning: {
            main: '#d97706',
            light: '#f59e0b',
            bg: '#fffbeb',
            border: '#fde68a'
        },
        error: {
            main: '#dc2626',
            light: '#ef4444',
            bg: '#fef2f2',
            border: '#fecaca'
        },
        info: {
            main: '#0891b2',
            light: '#06b6d4',
            bg: '#ecfeff',
            border: '#cffafe'
        },
        text: {
            primary: '#1e293b',
            secondary: '#475569',
            tertiary: '#64748b',
            disabled: '#94a3b8',
            inverse: '#ffffff'
        },
        background: {
            main: '#f8fafc',
            card: '#ffffff',
            hover: '#f1f5f9',
            border: '#e2e8f0'
        }
    };

    const getTypeColor = () => {
        switch (type) {
            case 'success': return colors.success;
            case 'warning': return colors.warning;
            case 'error': return colors.error;
            case 'info': return colors.info;
            default: return colors.primary;
        }
    };

    const typeColor = getTypeColor();

    return (
        <div className="p-6 bg-white border shadow-sm rounded-xl"
            style={{ borderColor: colors.background.border }}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="mb-1 text-sm" style={{ color: colors.text.tertiary }}>
                        {title}
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold" style={{ color: typeColor.main }}>
                            {value}
                        </p>
                        {change && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full"
                                style={{
                                    backgroundColor: typeColor.bg,
                                    color: typeColor.main,
                                    borderColor: typeColor.border
                                }}>
                                {change}
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: typeColor.bg }}>
                    <Icon size={24} style={{ color: typeColor.main }} />
                </div>
            </div>
        </div>
    );
};

const GroundDashboard: React.FC = () => {
    const { user, token } = useAuth();
    useTranslation();
    const [stats, setStats] = useState({
        myEntries: 0,
        approvedEntries: 0,
        pendingEntries: 0,
        totalHouseholds: 0,
        activeRelief: 0
    });
    const [loading, setLoading] = useState(true);

    // Enhanced color palette for 24/7 usage
    const colors = {
        primary: {
            main: '#2563eb',
            light: '#3b82f6',
            dark: '#1d4ed8',
            bg: '#eff6ff',
            border: '#bfdbfe'
        },
        success: {
            main: '#059669',
            light: '#10b981',
            bg: '#ecfdf5',
            border: '#a7f3d0'
        },
        warning: {
            main: '#d97706',
            light: '#f59e0b',
            bg: '#fffbeb',
            border: '#fde68a'
        },
        error: {
            main: '#dc2626',
            light: '#ef4444',
            bg: '#fef2f2',
            border: '#fecaca'
        },
        info: {
            main: '#0891b2',
            light: '#06b6d4',
            bg: '#ecfeff',
            border: '#cffafe'
        },
        text: {
            primary: '#1e293b',
            secondary: '#475569',
            tertiary: '#64748b',
            disabled: '#94a3b8',
            inverse: '#ffffff'
        },
        background: {
            main: '#f8fafc',
            card: '#ffffff',
            hover: '#f1f5f9',
            border: '#e2e8f0'
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await getReliefRequests();

                if (Array.isArray(res.data)) {
                    // Filter based on user role
                    const myEntries = res.data.filter((r: any) => r.dataEnteredBy === user?.id);
                    const assignedToMe = res.data.filter((r: any) => r.assignedVolunteerId === user?.id);

                    // Unique involved items
                    const involvedItems = [...myEntries, ...assignedToMe].filter(
                        (v, i, a) => a.findIndex(t => t.id === v.id) === i
                    );

                    const approved = involvedItems.filter((c: any) => c.status === 'approved').length;
                    const pending = involvedItems.filter((c: any) => c.status === 'pending').length;

                    // Additional stats
                    const totalHouseholds = new Set(involvedItems.map((r: any) => r.householdId)).size;
                    const activeRelief = involvedItems.filter((r: any) =>
                        r.status === 'approved' || r.status === 'pending'
                    ).length;

                    setStats({
                        myEntries: involvedItems.length,
                        approvedEntries: approved,
                        pendingEntries: pending,
                        totalHouseholds: totalHouseholds,
                        activeRelief: activeRelief
                    });
                }
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token, user?.id]);

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: colors.background.main }}>
            {/* Main Content Area */}
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b"
                    style={{ borderColor: colors.background.border }}>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary.bg }}>
                                <Home size={20} style={{ color: colors.primary.main }} />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                                    Ground Dashboard
                                </h1>
                                <p className="text-xs" style={{ color: colors.text.tertiary }}>
                                    Overview for {user?.role}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg"
                            style={{ borderColor: colors.background.border }}>
                            <MapPin size={14} style={{ color: colors.primary.main }} />
                            <span className="text-xs font-medium" style={{ color: colors.text.secondary }}>
                                {user?.district || 'No District'} • {(user as any)?.dsDivision || 'DS Division'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto">
                    <div className="p-6">
                        {/* Welcome Section */}
                        <div className="mb-6">


                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 mb-4 border-4 rounded-full animate-spin"
                                    style={{
                                        borderColor: colors.background.border,
                                        borderTopColor: colors.primary.main
                                    }} />
                                <p className="text-sm font-medium" style={{ color: colors.text.tertiary }}>
                                    Loading dashboard data...
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Stats Cards Row 1 */}
                                <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
                                    <StatsCard
                                        title="My Total Entries"
                                        value={stats.myEntries.toString()}
                                        type="primary"
                                        icon={FileText}
                                        change="All Time"
                                    />
                                    <StatsCard
                                        title="Approved Records"
                                        value={stats.approvedEntries.toString()}
                                        type="success"
                                        icon={CheckCircle}
                                        change="Verified"
                                    />
                                    <StatsCard
                                        title="Pending Verification"
                                        value={stats.pendingEntries.toString()}
                                        type="warning"
                                        icon={Clock}
                                        change="Processing"
                                    />
                                    <StatsCard
                                        title="Total Households"
                                        value={stats.totalHouseholds.toString()}
                                        type="info"
                                        icon={Users}
                                        change="Unique"
                                    />
                                </div>

                                {/* Stats Cards Row 2 - Additional Metrics */}

                                {/* Recent Activity Placeholder */}
                                <div className="overflow-hidden bg-white border shadow-sm rounded-xl"
                                    style={{ borderColor: colors.background.border }}>
                                    <div className="flex items-center justify-between px-6 py-4 border-b"
                                        style={{ borderColor: colors.background.border }}>
                                        <h3 className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                                            Recent Activity
                                        </h3>
                                        <span className="px-2 py-1 text-xs rounded-full"
                                            style={{ backgroundColor: colors.primary.bg, color: colors.primary.main }}>
                                            Last 7 days
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-center py-8"
                                            style={{ color: colors.text.disabled }}>
                                            <p className="text-sm">No recent activity to display</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard Footer */}
                                <div className="flex items-center justify-between mt-4 text-xs" style={{ color: colors.text.disabled }}>
                                    <div className="flex items-center gap-4">
                                        <span>Last updated: {new Date().toLocaleTimeString()}</span>
                                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.text.disabled }} />
                                        <span>Real-time data</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span>Connected</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroundDashboard;