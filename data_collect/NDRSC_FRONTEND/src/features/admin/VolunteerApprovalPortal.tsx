import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getPendingVolunteers, updateVolunteerStatus } from '../../network/userService';
import {
    User,
    ShieldCheck,
    Users,
    XCircle,
    Mail,
    Fingerprint,
    BadgeCheck,
    Clock,
    CheckCircle2,
    MapPin,
    Eye,
    Search,
    Filter,
    RefreshCw,
    Download
} from 'lucide-react';

interface Volunteer {
    id: number;
    username: string;
    email: string;
    nic: string;
    enumeratorId: string;
    status: string;
    district?: string;
    createdAt?: string;
}

const VolunteerApprovalPortal: React.FC = () => {
    useTranslation();
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [refreshing, setRefreshing] = useState(false);

    // District modal states
    const [showDistrictModal, setShowDistrictModal] = useState(false);
    const [pendingApprovalId, setPendingApprovalId] = useState<number | null>(null);
    const [districtInput, setDistrictInput] = useState('');
    const [districtError, setDistrictError] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

    const fetchVolunteers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPendingVolunteers();
            const data = Array.isArray(res.data) ? res.data : [];
            setVolunteers(data);
            setFilteredVolunteers(data);
        } catch (err: any) {
            console.error('Error fetching volunteers:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchVolunteers();
    }, [fetchVolunteers]);

    // Filter volunteers based on search and status
    useEffect(() => {
        let filtered = volunteers;

        if (searchTerm) {
            filtered = filtered.filter(v =>
                v.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.nic.includes(searchTerm) ||
                v.enumeratorId.includes(searchTerm)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(v => v.status === statusFilter);
        }

        setFilteredVolunteers(filtered);
    }, [searchTerm, statusFilter, volunteers]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchVolunteers();
    };

    // Process approval with district - FIXED VERSION
    const processApproval = async (districtOverride?: string) => {
        if (pendingApprovalId == null) {
            console.error('No pending approval ID');
            return;
        }

        // Use an explicit district value when provided, otherwise current state
        const currentDistrict = districtOverride ?? districtInput;

        // Validate district input
        const trimmedDistrict = currentDistrict?.trim() || '';

        if (!trimmedDistrict) {
            setDistrictError('District is required');
            return;
        }

        if (trimmedDistrict.length < 3) {
            setDistrictError('District must be at least 3 characters long');
            return;
        }

        if (trimmedDistrict.length > 50) {
            setDistrictError('District must be less than 50 characters');
            return;
        }

        if (!/^[a-zA-Z\s\-]+$/.test(trimmedDistrict)) {
            setDistrictError('District can only contain letters, spaces, and hyphens');
            return;
        }

        setActionLoading(pendingApprovalId);
        try {
            await updateVolunteerStatus(pendingApprovalId, 'active', trimmedDistrict);

            // Update local state
            setVolunteers(prev => prev.filter(v => v.id !== pendingApprovalId));
            setFilteredVolunteers(prev => prev.filter(v => v.id !== pendingApprovalId));

            setFeedback({
                type: 'success',
                message: `Volunteer approved successfully and assigned to ${trimmedDistrict} district`
            });

            // Close modal and reset
            setShowDistrictModal(false);
            setPendingApprovalId(null);
            setDistrictInput('');
            setDistrictError('');
            setSelectedVolunteer(null);

        } catch (err: any) {
            console.error('Approval failed:', err);
            setFeedback({
                type: 'error',
                message: err.response?.data?.message || 'Failed to approve volunteer. Please try again.'
            });
        } finally {
            setActionLoading(null);
        }
    };

    // Process rejection
    const processRejection = async (id: number) => {
        setActionLoading(id);
        try {
            await updateVolunteerStatus(id, 'rejected', '');

            // Update local state
            setVolunteers(prev => prev.filter(v => v.id !== id));
            setFilteredVolunteers(prev => prev.filter(v => v.id !== id));

            setFeedback({
                type: 'success',
                message: 'Volunteer rejected successfully'
            });

            setSelectedVolunteer(null);

        } catch (err: any) {
            console.error('Rejection failed:', err);
            setFeedback({
                type: 'error',
                message: err.response?.data?.message || 'Failed to reject volunteer. Please try again.'
            });
        } finally {
            setActionLoading(null);
        }
    };

    // Handle action button click
    const handleAction = (id: number, status: 'active' | 'rejected') => {
        setFeedback(null);
        if (status === 'active') {
            // Show district modal for approval
            setPendingApprovalId(id);
            setShowDistrictModal(true);
            setDistrictInput('');
            setDistrictError('');
        } else {
            // Direct rejection
            processRejection(id);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    bg: colors.warning.bg,
                    text: colors.warning.main,
                    icon: Clock,
                    label: 'Pending'
                };
            case 'active':
                return {
                    bg: colors.success.bg,
                    text: colors.success.main,
                    icon: CheckCircle2,
                    label: 'Active'
                };
            case 'rejected':
                return {
                    bg: colors.error.bg,
                    text: colors.error.main,
                    icon: XCircle,
                    label: 'Rejected'
                };
            default:
                return {
                    bg: colors.info.bg,
                    text: colors.info.main,
                    icon: User,
                    label: status
                };
        }
    };

    // Common Sri Lankan districts for quick selection
    const commonDistricts = [
        'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
        'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
        'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
        'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
        'Moneragala', 'Ratnapura', 'Kegalle'
    ];

    const handleDistrictSelect = (district: string) => {
        setDistrictInput(district);
        setDistrictError('');
    };

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: colors.background.main }}>
            {/* Full-width Dashboard Layout */}
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b"
                    style={{ borderColor: colors.background.border }}>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary.bg }}>
                                <ShieldCheck size={20} style={{ color: colors.primary.main }} />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                                    Volunteer Approval Portal
                                </h1>
                                <p className="text-xs" style={{ color: colors.text.tertiary }}>
                                    Official Verification Dashboard
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
                    </div>
                </div>

                {/* Main Content Area - Full Width */}
                <div className="flex-1 overflow-auto">
                    <div className="p-6">
                        {feedback && (
                            <div
                                className="mb-4 px-4 py-3 text-sm rounded-lg border"
                                style={{
                                    backgroundColor: feedback.type === 'success' ? colors.success.bg : colors.error.bg,
                                    color: feedback.type === 'success' ? colors.success.main : colors.error.main,
                                    borderColor: feedback.type === 'success' ? colors.success.border : colors.error.border
                                }}
                            >
                                {feedback.message}
                            </div>
                        )}

                        {/* Stats Cards - Full Width Grid */}
                        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    label: 'Total Volunteers',
                                    value: volunteers.length,
                                    icon: Users,
                                    color: colors.primary.main,
                                    bg: colors.primary.bg
                                },
                                {
                                    label: 'Pending Approval',
                                    value: volunteers.filter(v => v.status === 'pending').length,
                                    icon: Clock,
                                    color: colors.warning.main,
                                    bg: colors.warning.bg
                                },
                                {
                                    label: 'Active Volunteers',
                                    value: volunteers.filter(v => v.status === 'active').length,
                                    icon: CheckCircle2,
                                    color: colors.success.main,
                                    bg: colors.success.bg
                                },
                                {
                                    label: 'Rejected',
                                    value: volunteers.filter(v => v.status === 'rejected').length,
                                    icon: XCircle,
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

                        {/* Search and Filter Bar - Full Width */}
                        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search size={18} className="absolute transform -translate-y-1/2 left-3 top-1/2"
                                    style={{ color: colors.text.tertiary }} />
                                <input
                                    type="text"
                                    placeholder="Search volunteers..."
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
                                    {['all', 'pending', 'active', 'rejected'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize"
                                            style={{
                                                backgroundColor: statusFilter === status
                                                    ? colors.primary.main
                                                    : 'transparent',
                                                color: statusFilter === status
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

                        {/* Main Table - Full Width */}
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
                                        Loading volunteer data...
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
                                                        <User size={14} />
                                                        Volunteer
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={14} />
                                                        Contact
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    <div className="flex items-center gap-2">
                                                        <Fingerprint size={14} />
                                                        NIC
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    <div className="flex items-center gap-2">
                                                        <BadgeCheck size={14} />
                                                        Enumerator ID
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} />
                                                        District
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} />
                                                        Registered
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase"
                                                    style={{ color: colors.text.secondary }}>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: colors.background.border }}>
                                            {filteredVolunteers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <Users size={48} style={{ color: colors.text.disabled }} />
                                                            <p className="mt-4 text-sm font-medium" style={{ color: colors.text.secondary }}>
                                                                No volunteers found
                                                            </p>
                                                            <p className="mt-1 text-xs" style={{ color: colors.text.tertiary }}>
                                                                {searchTerm ? 'Try adjusting your search' : 'No volunteers to display'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredVolunteers.map((volunteer) => {
                                                    const StatusBadge = getStatusBadge(volunteer.status);
                                                    const StatusIcon = StatusBadge.icon;

                                                    return (
                                                        <tr key={volunteer.id}
                                                            className="transition-colors hover:bg-gray-50">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-lg"
                                                                        style={{ backgroundColor: colors.primary.bg }}>
                                                                        <User size={16} style={{ color: colors.primary.main }} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium" style={{ color: colors.text.primary }}>
                                                                            {volunteer.username}
                                                                        </div>
                                                                        <div className="text-xs" style={{ color: colors.text.tertiary }}>
                                                                            ID: {volunteer.id}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm" style={{ color: colors.text.secondary }}>
                                                                    {volunteer.email}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-mono text-sm" style={{ color: colors.text.primary }}>
                                                                    {volunteer.nic}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md"
                                                                    style={{
                                                                        backgroundColor: colors.background.main,
                                                                        color: colors.text.secondary
                                                                    }}>
                                                                    {volunteer.enumeratorId}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm" style={{ color: colors.text.secondary }}>
                                                                    {volunteer.district || 'Not assigned'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm" style={{ color: colors.text.tertiary }}>
                                                                    {formatDate(volunteer.createdAt)}
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
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => setSelectedVolunteer(volunteer)}
                                                                        className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                                                                        style={{ color: colors.text.secondary }}
                                                                        title="View Details"
                                                                    >
                                                                        <Eye size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAction(volunteer.id, 'rejected')}
                                                                        disabled={actionLoading === volunteer.id}
                                                                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50"
                                                                        style={{
                                                                            color: colors.error.main,
                                                                            backgroundColor: colors.error.bg,
                                                                            border: `1px solid ${colors.error.border}`
                                                                        }}
                                                                    >
                                                                        {actionLoading === volunteer.id ? '...' : 'Reject'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAction(volunteer.id, 'active')}
                                                                        disabled={actionLoading === volunteer.id}
                                                                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50"
                                                                        style={{
                                                                            color: colors.text.inverse,
                                                                            backgroundColor: colors.success.main
                                                                        }}
                                                                    >
                                                                        {actionLoading === volunteer.id ? '...' : 'Approve'}
                                                                    </button>
                                                                </div>
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
                                Showing {filteredVolunteers.length} of {volunteers.length} volunteers
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* District Assignment Modal - FIXED */}
            {showDistrictModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-xl">
                        <div className="px-6 py-4 border-b" style={{ borderColor: colors.background.border }}>
                            <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                                Assign District
                            </h3>
                        </div>

                        <div className="p-6">
                            <p className="mb-4 text-sm" style={{ color: colors.text.secondary }}>
                                Please enter the district where this volunteer will be assigned:
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        value={districtInput}
                                        onChange={(e) => {
                                            setDistrictInput(e.target.value);
                                            setDistrictError('');
                                        }}
                                        placeholder="e.g., Colombo, Galle, Kandy"
                                        className="w-full px-4 py-3 text-sm transition-all border rounded-lg focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: districtError ? colors.error.main : colors.background.border
                                        }}
                                        autoFocus
                                    />
                                    {districtError && (
                                        <p className="mt-2 text-xs" style={{ color: colors.error.main }}>
                                            {districtError}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="mb-2 text-xs font-medium" style={{ color: colors.text.secondary }}>
                                        Common Districts:
                                    </p>
                                    <div className="flex flex-wrap gap-2 p-1 overflow-y-auto border rounded-lg max-h-32"
                                        style={{ borderColor: colors.background.border }}>
                                        {commonDistricts.map((dist) => (
                                            <button
                                                key={dist}
                                                type="button"
                                                onClick={() => handleDistrictSelect(dist)}
                                                className="px-3 py-1.5 text-xs font-medium transition-all rounded-full hover:bg-opacity-80"
                                                style={{
                                                    backgroundColor: districtInput === dist ? colors.primary.bg : colors.background.main,
                                                    color: districtInput === dist ? colors.primary.main : colors.text.secondary,
                                                    border: `1px solid ${districtInput === dist ? colors.primary.border : colors.background.border}`,
                                                    fontWeight: districtInput === dist ? '600' : '400'
                                                }}
                                            >
                                                {dist}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Show current selection */}
                                {districtInput && (
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: colors.success.bg }}>
                                        <p className="text-xs font-medium" style={{ color: colors.success.main }}>
                                            Selected District: <span className="font-bold">{districtInput}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: colors.background.border }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDistrictModal(false);
                                    setPendingApprovalId(null);
                                    setDistrictInput('');
                                    setDistrictError('');
                                }}
                                className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all border"
                                style={{
                                    color: colors.text.secondary,
                                    borderColor: colors.background.border,
                                    backgroundColor: 'white'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    processApproval(districtInput);
                                }}
                                disabled={actionLoading === pendingApprovalId}
                                className="flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: colors.success.main }}
                            >
                                {actionLoading === pendingApprovalId ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                                        Processing...
                                    </span>
                                ) : 'Approve'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedVolunteer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b"
                            style={{ borderColor: colors.background.border }}>
                            <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                                Volunteer Details
                            </h3>
                            <button
                                onClick={() => setSelectedVolunteer(null)}
                                className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                            >
                                <XCircle size={20} style={{ color: colors.text.tertiary }} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 rounded-xl" style={{ backgroundColor: colors.primary.bg }}>
                                    <User size={32} style={{ color: colors.primary.main }} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold" style={{ color: colors.text.primary }}>
                                        {selectedVolunteer.username}
                                    </h4>
                                    <p className="text-sm" style={{ color: colors.text.tertiary }}>
                                        {selectedVolunteer.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.background.main }}>
                                    <p className="mb-1 text-xs" style={{ color: colors.text.tertiary }}>NIC Number</p>
                                    <p className="font-mono font-medium" style={{ color: colors.text.primary }}>
                                        {selectedVolunteer.nic}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.background.main }}>
                                    <p className="mb-1 text-xs" style={{ color: colors.text.tertiary }}>Enumerator ID</p>
                                    <p className="font-medium" style={{ color: colors.text.primary }}>
                                        {selectedVolunteer.enumeratorId}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.background.main }}>
                                    <p className="mb-1 text-xs" style={{ color: colors.text.tertiary }}>Registration Date</p>
                                    <p className="font-medium" style={{ color: colors.text.primary }}>
                                        {formatDate(selectedVolunteer.createdAt)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.background.main }}>
                                    <p className="mb-1 text-xs" style={{ color: colors.text.tertiary }}>Current Status</p>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full"
                                        style={{
                                            backgroundColor: colors.warning.bg,
                                            color: colors.warning.main
                                        }}>
                                        <Clock size={12} />
                                        Pending Verification
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: colors.background.border }}>
                            <button
                                type="button"
                                onClick={() => processRejection(selectedVolunteer.id)}
                                disabled={actionLoading === selectedVolunteer.id}
                                className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all border disabled:opacity-50"
                                style={{
                                    color: colors.error.main,
                                    borderColor: colors.error.border,
                                    backgroundColor: colors.error.bg
                                }}
                            >
                                {actionLoading === selectedVolunteer.id ? 'Processing...' : 'Reject Application'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedVolunteer(null);
                                    handleAction(selectedVolunteer.id, 'active');
                                }}
                                disabled={actionLoading === selectedVolunteer.id}
                                className="flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50"
                                style={{ backgroundColor: colors.success.main }}
                            >
                                {actionLoading === selectedVolunteer.id ? 'Processing...' : 'Approve & Assign District'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VolunteerApprovalPortal;
