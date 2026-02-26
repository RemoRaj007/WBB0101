import React, { useState, useEffect } from 'react';
import { getReliefRequests } from '../../network/reliefService';
import {
    AlertCircle,
    CheckCircle2,
    List,
    Filter,
    Calendar,
    Home,
    User,
    Eye,
    Clock,
    RefreshCw,
    Search,
    Download
} from 'lucide-react';
import ViewRequestModal from '../../components/modals/ViewRequestModal';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const MyRequests: React.FC = () => {
    useTranslation();
    const navigate = useNavigate();
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

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

    const fetchMyRequests = async () => {
        setLoading(true);
        try {
            const response = await getReliefRequests('');
            const data = Array.isArray(response.data) ? response.data : [];
            setMyRequests(data);
            setFilteredRequests(data);
        } catch (err) {
            console.error("Failed to fetch my requests", err);
            setMyRequests([]);
            setFilteredRequests([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMyRequests();
    }, []);

    // Filter requests based on search and status
    useEffect(() => {
        let filtered = myRequests;

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(req => req.status === filterStatus);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(req =>
                req.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.householdId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.incidentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.nic?.includes(searchTerm)
            );
        }

        setFilteredRequests(filtered);
    }, [searchTerm, filterStatus, myRequests]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchMyRequests();
    };

    const handleViewRequest = (request: any) => {
        setSelectedRequest(request);
        setIsViewModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    bg: colors.success.bg,
                    text: colors.success.main,
                    icon: CheckCircle2,
                    label: 'Approved'
                };
            case 'rejected':
                return {
                    bg: colors.error.bg,
                    text: colors.error.main,
                    icon: AlertCircle,
                    label: 'Rejected'
                };
            case 'pending':
            default:
                return {
                    bg: colors.warning.bg,
                    text: colors.warning.main,
                    icon: Clock,
                    label: 'Pending'
                };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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
                                <List size={20} style={{ color: colors.primary.main }} />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                                    My Relief Applications
                                </h1>
                                <p className="text-xs" style={{ color: colors.text.tertiary }}>
                                    Track status of your submitted applications
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            style={{ borderColor: colors.background.border, color: colors.text.secondary }}
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all rounded-lg"
                            style={{ backgroundColor: colors.primary.main }}
                        >
                            <Download size={14} />
                            Export
                        </button>
                        <button
                            onClick={() => navigate('/data-entry/relief')}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all rounded-lg"
                            style={{ backgroundColor: colors.success.main }}
                        >
                            + New Application
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto">
                    <div className="p-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    label: 'Total Applications',
                                    value: myRequests.length,
                                    icon: List,
                                    color: colors.primary.main,
                                    bg: colors.primary.bg
                                },
                                {
                                    label: 'Pending',
                                    value: myRequests.filter(r => r.status === 'pending').length,
                                    icon: Clock,
                                    color: colors.warning.main,
                                    bg: colors.warning.bg
                                },
                                {
                                    label: 'Approved',
                                    value: myRequests.filter(r => r.status === 'approved').length,
                                    icon: CheckCircle2,
                                    color: colors.success.main,
                                    bg: colors.success.bg
                                },
                                {
                                    label: 'Rejected',
                                    value: myRequests.filter(r => r.status === 'rejected').length,
                                    icon: AlertCircle,
                                    color: colors.error.main,
                                    bg: colors.error.bg
                                }
                            ].map((stat, index) => (
                                <div key={index}
                                    className="p-6 bg-white border shadow-sm rounded-xl"
                                    style={{ borderColor: colors.background.border }}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="mb-1 text-sm" style={{ color: colors.text.tertiary }}>
                                                {stat.label}
                                            </p>
                                            <p className="text-3xl font-bold" style={{ color: stat.color }}>
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl" style={{ backgroundColor: stat.bg }}>
                                            <stat.icon size={24} style={{ color: stat.color }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search size={18} className="absolute transform -translate-y-1/2 left-3 top-1/2"
                                    style={{ color: colors.text.tertiary }} />
                                <input
                                    type="text"
                                    placeholder="Search by name, ID, incident..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                                    style={{
                                        borderColor: colors.background.border,
                                        color: colors.text.primary
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 p-1 bg-white border rounded-lg"
                                    style={{ borderColor: colors.background.border }}>
                                    <Filter size={16} className="ml-2" style={{ color: colors.text.tertiary }} />
                                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize"
                                            style={{
                                                backgroundColor: filterStatus === status
                                                    ? colors.primary.main
                                                    : 'transparent',
                                                color: filterStatus === status
                                                    ? colors.text.inverse
                                                    : colors.text.secondary,
                                            }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Table */}
                        <div className="overflow-hidden bg-white border shadow-sm rounded-xl"
                            style={{ borderColor: colors.background.border }}>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-12 h-12 mb-4 border-4 rounded-full animate-spin"
                                        style={{
                                            borderColor: colors.background.border,
                                            borderTopColor: colors.primary.main
                                        }} />
                                    <p className="text-sm font-medium" style={{ color: colors.text.tertiary }}>
                                        Loading your applications...
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1200px]">
                                        <thead>
                                            <tr style={{ backgroundColor: colors.background.main }}>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} />
                                                        Date
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} />
                                                        Applicant
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    <div className="flex items-center gap-2">
                                                        <Home size={14} />
                                                        Incident
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    <div className="flex items-center gap-2">
                                                        <span>Rs:</span>
                                                        Amount
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    Remarks
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: colors.background.border }}>
                                            {filteredRequests.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <List size={48} style={{ color: colors.text.disabled }} />
                                                            <p className="mt-4 text-sm font-medium" style={{ color: colors.text.secondary }}>
                                                                No applications found
                                                            </p>
                                                            <p className="mt-1 text-xs" style={{ color: colors.text.tertiary }}>
                                                                {searchTerm ? 'Try adjusting your search' : 'Submit your first relief application'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredRequests.map((request) => {
                                                    const StatusBadge = getStatusBadge(request.status);
                                                    const StatusIcon = StatusBadge.icon;

                                                    return (
                                                        <tr key={request.id}
                                                            className="transition-colors hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm" style={{ color: colors.text.primary }}>
                                                                    {formatDate(request.createdAt)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-lg"
                                                                        style={{ backgroundColor: colors.primary.bg }}>
                                                                        <User size={16} style={{ color: colors.primary.main }} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium" style={{ color: colors.text.primary }}>
                                                                            {request.fullName || 'N/A'}
                                                                        </div>
                                                                        {request.householdId && (
                                                                            <div className="text-xs mt-0.5" style={{ color: colors.text.tertiary }}>
                                                                                ID: {request.householdId}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md"
                                                                    style={{
                                                                        backgroundColor: colors.background.main,
                                                                        color: colors.text.secondary
                                                                    }}>
                                                                    {request.incidentType}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                                                                    LKR {Number(request.reliefAmount).toLocaleString()}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
                                                                    style={{
                                                                        backgroundColor: StatusBadge.bg,
                                                                        color: StatusBadge.text
                                                                    }}>
                                                                    <StatusIcon size={12} />
                                                                    {StatusBadge.label}
                                                                </span>
                                                            </td>
                                                            <td className="max-w-xs px-6 py-4">
                                                                {request.remarks ? (
                                                                    <p className="text-sm truncate" style={{ color: colors.text.secondary }}>
                                                                        {request.remarks}
                                                                    </p>
                                                                ) : (
                                                                    <span className="text-sm" style={{ color: colors.text.disabled }}>
                                                                        —
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    onClick={() => handleViewRequest(request)}
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all rounded-lg hover:bg-gray-100"
                                                                    style={{
                                                                        color: colors.primary.main,
                                                                        backgroundColor: 'transparent'
                                                                    }}
                                                                >
                                                                    <Eye size={14} />
                                                                    View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Table Footer */}
                        <div className="flex items-center justify-between mt-4 text-sm">
                            <div style={{ color: colors.text.tertiary }}>
                                Showing {filteredRequests.length} of {myRequests.length} applications
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Request Modal */}
            <ViewRequestModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                request={selectedRequest}
            />
        </div>
    );
};

export default MyRequests;