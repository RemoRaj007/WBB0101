import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getReliefRequests, updateReliefRequestStatus, getReliefRequestById } from '../../network/reliefService';
import { useAuth } from '../../foundation/state_hubs/AuthContext';
import RemarkModal from '../../components/modals/RemarkModal';
import {
    CheckCircle2,
    XCircle,
    Banknote,
    Home,
    Search,
    ChevronRight,
    MessageSquare,
    FileSpreadsheet,
    FileText,
    ShieldCheck,
    AlertCircle,
    Filter,
    Download,
    Eye
} from 'lucide-react';

interface ReliefRequest {
    id: number;
    gnId?: string;
    gnDivision: string;
    dsDivision: string;
    householdId: string;
    incidentType: string;
    reliefAmount: string;
    status: string;
    remarks?: string;
    enumerator?: { username: string; id: number };
    createdAt: string;
    originalRequestId?: number;
    bankName?: string;
    branchName?: string;
    accountHolder?: string;
    accountNumber?: string;
    accountNic?: string;
    ownershipStatus?: string;
    isEstate?: boolean;
    damageZone?: string;
    damageSeverity?: string;
    assignedVolunteer?: { username: string; id: number };
    media?: { id: number; fileUrl: string; fileType: string }[];
    isDuplicate?: boolean;
    duplicateReason?: string;
}

type StatusType = 'pending' | 'approved' | 'rejected';

const ReliefApprovalPortal: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [activeStatus, setActiveStatus] = useState<StatusType>('pending');

    // Relief State
    const [requests, setRequests] = useState<ReliefRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Modal State
    const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
    const [rejectionTargetId, setRejectionTargetId] = useState<number | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<ReliefRequest | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            console.log(`[ReliefPortal] Fetching ${activeStatus} requests...`);
            const res = await getReliefRequests(activeStatus);
            console.log(`[ReliefPortal] Received ${res.data.length} requests:`, res.data);
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('[ReliefPortal] Error fetching relief requests:', err);
        } finally {
            setLoading(false);
        }
    }, [activeStatus]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (id: number, status: 'approved' | 'rejected') => {
        if (status === 'rejected') {
            setRejectionTargetId(id);
            setIsRemarkModalOpen(true);
            return;
        }

        // Approval Flow
        if (!window.confirm(t('confirmApproval'))) return;

        setActionLoading(id);
        try {
            const role = user?.role === 'District Officer' ? 'District Officer' : 'Division Officer';
            await updateReliefRequestStatus(id, status, `Approved by ${role}`);
            setRequests(prev => prev.filter(r => r.id !== id));
            if (selectedRequest?.id === id) setSelectedRequest(null);
        } catch (err: any) {
            alert(err.response?.data?.message || t('actionFailed'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleConfirmRejection = async (remarks: string) => {
        if (!rejectionTargetId) return;

        setActionLoading(rejectionTargetId);
        try {
            await updateReliefRequestStatus(rejectionTargetId, 'rejected', remarks);
            setRequests(prev => prev.filter(r => r.id !== rejectionTargetId));
            if (selectedRequest?.id === rejectionTargetId) setSelectedRequest(null);
        } catch (err: any) {
            alert(err.response?.data?.message || t('actionFailed'));
        } finally {
            setActionLoading(null);
            setRejectionTargetId(null);
        }
    };

    const downloadReport = (type: 'excel' | 'pdf') => {
        import('../../network/reportService').then(m => m.downloadReport('relief', type));
    };

    const filteredRequests = requests.filter(r =>
        r.householdId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.gnDivision.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    const getSeverityBadgeColor = (severity?: string) => {
        return severity === 'Full'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-orange-50 text-orange-700 border-orange-200';
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header Section */}
            <div className="px-6 py-3 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                                Relief Approvals
                            </h1>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                                Review and manage relief assistance requests
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4">
                {/* Search and Filter Bar */}
                <div className="flex items-center gap-3 p-3 mb-4 bg-white border border-gray-200 rounded-lg">
                    <div className="relative flex-1">
                        <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                            type="text"
                            placeholder="Search by household ID or GN division..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-2 pr-3 text-xs text-gray-700 placeholder-gray-400 transition-all border border-gray-200 rounded-lg pl-9 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <div className="flex gap-1 p-1 border border-gray-200 rounded-lg bg-gray-50">
                            {(['pending', 'approved', 'rejected'] as StatusType[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setActiveStatus(status)}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-medium transition-all ${activeStatus === status
                                            ? status === 'pending'
                                                ? 'bg-amber-100 text-amber-700'
                                                : status === 'approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            : 'text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {t(status)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Report Download Cards */}
                <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-2">
                    <button
                        onClick={() => downloadReport('excel')}
                        className="flex items-center justify-between p-3 transition-all bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 transition-colors border border-green-100 rounded-lg bg-green-50 group-hover:bg-green-100">
                                <FileSpreadsheet size={16} className="text-green-600" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xs font-medium text-gray-700">Excel Report</h3>
                                <p className="text-[9px] text-gray-400">Download complete relief data</p>
                            </div>
                        </div>
                        <Download size={14} className="text-gray-400 group-hover:text-blue-600" />
                    </button>

                    <button
                        onClick={() => downloadReport('pdf')}
                        className="flex items-center justify-between p-3 transition-all bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 transition-colors border border-red-100 rounded-lg bg-red-50 group-hover:bg-red-100">
                                <FileText size={16} className="text-red-600" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xs font-medium text-gray-700">PDF Report</h3>
                                <p className="text-[9px] text-gray-400">Governance snapshot</p>
                            </div>
                        </div>
                        <Download size={14} className="text-gray-400 group-hover:text-blue-600" />
                    </button>
                </div>

                {/* Requests Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[calc(100%-180px)]">
                    <div className="h-full overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-gray-50">
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Request Info</th>
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Household</th>
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-gray-200 rounded-full border-t-blue-600 animate-spin"></div>
                                                <p className="text-xs text-gray-400">Loading requests...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center">
                                            <p className="text-xs text-gray-400">No relief requests found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((request) => (
                                        <tr key={request.id} className="transition-colors hover:bg-gray-50/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center justify-center border border-blue-100 rounded-lg w-7 h-7 bg-blue-50">
                                                        <Banknote className="w-3.5 h-3.5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-700">{request.incidentType}</p>
                                                        <p className="text-[9px] text-gray-400">{request.gnDivision}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Home className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-600">{request.householdId}</span>
                                                </div>
                                                {request.isDuplicate && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <AlertCircle size={8} className="text-amber-500" />
                                                        <span className="text-[8px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                                                            Duplicate
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-medium text-gray-700">
                                                    LKR {parseFloat(request.reliefAmount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium border ${getStatusBadgeColor(request.status)}`}>
                                                    {t(request.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setSelectedRequest(request)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>

                                                    {(user?.role === 'Division Officer' || user?.role === 'Super User' || user?.role === 'District Officer') &&
                                                        activeStatus === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAction(request.id, 'approved')}
                                                                    disabled={actionLoading === request.id}
                                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                                    title="Approve"
                                                                >
                                                                    {actionLoading === request.id ? (
                                                                        <div className="w-3.5 h-3.5 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle2 size={14} />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(request.id, 'rejected')}
                                                                    disabled={actionLoading === request.id}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle size={14} />
                                                                </button>
                                                            </>
                                                        )}

                                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                                                        <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="mt-3 flex items-center justify-between text-[9px] text-gray-400">
                    <span>Total Requests: {FileReader.length}</span>
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-gray-800">Relief Request Details</h2>
                                        <p className="text-[10px] text-gray-500">ID: {selectedRequest.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Duplicate Warning */}
                            {selectedRequest.isDuplicate && (
                                <div className="flex items-start gap-2 p-3 mb-4 border rounded-lg bg-amber-50 border-amber-200">
                                    <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-medium text-amber-800">Potential Duplicate Detected</p>
                                        <p className="text-[10px] text-amber-600 mb-2">{selectedRequest.duplicateReason}</p>
                                        {selectedRequest.originalRequestId && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await getReliefRequestById(selectedRequest.originalRequestId!);
                                                        setSelectedRequest(res.data);
                                                    } catch (error) {
                                                        console.error("Failed to fetch original request", error);
                                                    }
                                                }}
                                                className="text-[9px] bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded-md transition-colors"
                                            >
                                                View Original #{selectedRequest.originalRequestId}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                {/* Left Column - Main Info */}
                                <div className="space-y-4 lg:col-span-2">
                                    {/* Basic Information */}
                                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Basic Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] text-gray-400">GN Division</p>
                                                <p className="text-xs font-medium text-gray-700">{selectedRequest.gnDivision}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400">DS Division</p>
                                                <p className="text-xs font-medium text-gray-700">{selectedRequest.dsDivision}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400">Household ID</p>
                                                <p className="text-xs font-medium text-gray-700">{selectedRequest.householdId}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400">GN ID</p>
                                                <p className="text-xs font-medium text-gray-700">{selectedRequest.gnId || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Incident & Damage */}
                                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Incident Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] text-gray-400">Incident Type</p>
                                                <p className="text-xs font-medium text-gray-700">{selectedRequest.incidentType}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400">Severity</p>
                                                {selectedRequest.damageSeverity && (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium border ${getSeverityBadgeColor(selectedRequest.damageSeverity)}`}>
                                                        {selectedRequest.damageSeverity === 'Full' ? 'FULL DAMAGE' : 'PARTIAL DAMAGE'}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400">Estate</p>
                                                <p className="text-xs font-medium text-gray-700">{selectedRequest.isEstate ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Banking Details */}
                                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Banking Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <p className="text-[9px] text-gray-400">Account Holder</p>
                                                <p className="text-xs font-medium text-gray-700">{selectedRequest.accountHolder || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400">Bank & Branch</p>
                                                <p className="text-xs text-gray-600">{selectedRequest.bankName || 'N/A'} - {selectedRequest.branchName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400">Account Number</p>
                                                <p className="font-mono text-xs text-gray-700">{selectedRequest.accountNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400">NIC</p>
                                                <p className="text-xs text-gray-600">{selectedRequest.accountNic || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Audit & Evidence */}
                                <div className="space-y-4">
                                    {/* Amount Card */}
                                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                                        <p className="text-[9px] text-blue-600 font-semibold uppercase tracking-wider mb-1">Relief Amount</p>
                                        <p className="text-2xl font-semibold text-blue-700">
                                            LKR {parseFloat(selectedRequest.reliefAmount).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Status Card */}
                                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium border ${getStatusBadgeColor(selectedRequest.status)}`}>
                                                {t(selectedRequest.status)}
                                            </span>
                                        </div>

                                        {/* Audit Trail */}
                                        <div className="pt-3 mt-3 space-y-2 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[9px] text-gray-400">Enumerator</p>
                                                <p className="text-[10px] font-medium text-gray-700">{selectedRequest.enumerator?.username || 'System'}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[9px] text-gray-400">Volunteer</p>
                                                <p className="text-[10px] text-gray-600">{selectedRequest.assignedVolunteer?.username || 'Unassigned'}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[9px] text-gray-400">Created</p>
                                                <p className="text-[10px] text-gray-600">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remarks */}
                                    {selectedRequest.remarks && (
                                        <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <MessageSquare size={12} className="text-amber-600" />
                                                <p className="text-[9px] font-semibold text-amber-700 uppercase tracking-wider">Remarks</p>
                                            </div>
                                            <p className="text-[10px] text-amber-800 italic">"{selectedRequest.remarks}"</p>
                                        </div>
                                    )}

                                    {/* Evidence */}
                                    {selectedRequest.media && selectedRequest.media.length > 0 && (
                                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                            <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                                Evidence ({selectedRequest.media.length})
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {selectedRequest.media.map((media, index) => (
                                                    <a
                                                        key={media.id || index}
                                                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${media.fileUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block overflow-hidden transition-colors bg-white border border-gray-200 rounded-lg aspect-video hover:border-blue-300"
                                                    >
                                                        {media.fileType?.startsWith('image/') ? (
                                                            <img
                                                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${media.fileUrl}`}
                                                                alt="Evidence"
                                                                className="object-cover w-full h-full"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full h-full bg-gray-100">
                                                                <FileText size={16} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        {selectedRequest.status === 'pending' && (
                            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => {
                                        handleAction(selectedRequest.id, 'rejected');
                                        setSelectedRequest(null);
                                    }}
                                    disabled={actionLoading === selectedRequest.id}
                                    className="px-4 py-2 text-xs font-medium text-red-600 transition-colors border border-red-200 rounded-lg hover:bg-red-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        handleAction(selectedRequest.id, 'approved');
                                        setSelectedRequest(null);
                                    }}
                                    disabled={actionLoading === selectedRequest.id}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    {actionLoading === selectedRequest.id ? (
                                        <div className="w-3 h-3 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={14} />
                                    )}
                                    Approve Request
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <RemarkModal
                isOpen={isRemarkModalOpen}
                onClose={() => {
                    setIsRemarkModalOpen(false);
                    setRejectionTargetId(null);
                }}
                onSubmit={handleConfirmRejection}
                title="Reject with Remarks"
                actionType="reject"
            />
        </div>
    );
};

export default ReliefApprovalPortal;