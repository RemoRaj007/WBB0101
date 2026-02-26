import React from 'react';
import { X, Calendar, MapPin, AlertTriangle, Building, User, FileText } from 'lucide-react';

interface ViewRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: any;
}

const ViewRequestModal: React.FC<ViewRequestModalProps> = ({ isOpen, onClose, request }) => {
    if (!isOpen || !request) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const sectionStyle = "bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-4";
    const labelStyle = "text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1";
    const valueStyle = "text-sm font-bold text-slate-800";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Request Details</h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(request.status)}`}>
                                {request.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Recorded on {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 md:p-8">

                    {/* Status & Remarks Section */}
                    {request.remarks && (
                        <div className={`p-5 rounded-2xl mb-6 flex items-start gap-4 ${request.status === 'rejected' ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'}`}>
                            {request.status === 'rejected' ? <AlertTriangle className="text-red-500 shrink-0" size={20} /> : <FileText className="text-blue-500 shrink-0" size={20} />}
                            <div>
                                <h3 className={`text-xs font-black uppercase tracking-widest mb-1 ${request.status === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>
                                    {request.status === 'rejected' ? 'Rejection Reason' : 'Remarks'}
                                </h3>
                                <p className={`text-sm font-medium ${request.status === 'rejected' ? 'text-red-600' : 'text-blue-600'}`}>
                                    {request.remarks}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div className={sectionStyle}>
                                <div className="flex items-center gap-2 mb-4 text-slate-400">
                                    <User size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">Applicant Details</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className={labelStyle}>User Name</p>
                                        <p className={valueStyle}>{request.fullName || request.householdId}</p>
                                        {/* Fallback to householdId if name isn't directly on request (depending on backend response, usually joined) */}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className={labelStyle}>NIC / Household ID</p>
                                            <p className={valueStyle}>{request.accountNic || request.householdId}</p>
                                        </div>
                                        <div>
                                            <p className={labelStyle}>Phone</p>
                                            <p className={valueStyle}>{request.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={sectionStyle}>
                                <div className="flex items-center gap-2 mb-4 text-slate-400">
                                    <MapPin size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">Location</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className={labelStyle}>District</p>
                                        <p className={valueStyle}>{request.district}</p>
                                    </div>
                                    <div>
                                        <p className={labelStyle}>DS Division</p>
                                        <p className={valueStyle}>{request.dsDivision}</p>
                                    </div>
                                    <div>
                                        <p className={labelStyle}>GN Division</p>
                                        <p className={valueStyle}>{request.gnDivision}</p>
                                    </div>
                                    <div>
                                        <p className={labelStyle}>GN ID</p>
                                        <p className={valueStyle}>{request.gnId}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div className={sectionStyle}>
                                <div className="flex items-center gap-2 mb-4 text-slate-400">
                                    <AlertTriangle size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">Incident Details</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className={labelStyle}>Type</p>
                                        <p className={valueStyle}>{request.incidentType}</p>
                                    </div>
                                    <div>
                                        <p className={labelStyle}>Date</p>
                                        <div className="flex items-center gap-2 text-slate-800">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-sm font-bold">{request.incidentDate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className={labelStyle}>Damage Severity</p>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${request.damageSeverity === 'Full' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                            {request.damageSeverity}
                                        </span>
                                    </div>
                                    <div>
                                        <p className={labelStyle}>Relief Amount</p>
                                        <p className="text-blue-600 font-black">LKR {request.reliefAmount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={sectionStyle}>
                                <div className="flex items-center gap-2 mb-4 text-slate-400">
                                    <Building size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">Banking Details</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className={labelStyle}>Bank</p>
                                            <p className={valueStyle}>{request.bankName}</p>
                                        </div>
                                        <div>
                                            <p className={labelStyle}>Branch</p>
                                            <p className={valueStyle}>{request.branchName}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className={labelStyle}>Account Number</p>
                                        <p className="font-mono text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg inline-block">{request.accountNumber}</p>
                                    </div>
                                    <div>
                                        <p className={labelStyle}>Account Holder</p>
                                        <p className={valueStyle}>{request.accountHolder}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-[2rem] flex justify-end">
                    <button onClick={onClose} className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewRequestModal;
