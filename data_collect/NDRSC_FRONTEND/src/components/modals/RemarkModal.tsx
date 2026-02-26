import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RemarkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (remarks: string) => void;
    title?: string;
    actionType?: 'reject' | 'approve';
}

const RemarkModal: React.FC<RemarkModalProps> = ({ isOpen, onClose, onSubmit, title, actionType = 'reject' }) => {
    const { t } = useTranslation();
    const [remarks, setRemarks] = useState('');
    const [selectedReason, setSelectedReason] = useState<string | null>(null);

    if (!isOpen) return null;

    const commonReasons = [
        "Incorrect Household ID",
        "Bank Details Mismatch",
        "Duplicate Entry",
        "Insufficient Evidence",
        "Ineligible for Relief"
    ];

    const handleSubmit = () => {
        if (!remarks.trim()) {
            alert(t('pleaseEnterRemarks'));
            return;
        }
        onSubmit(remarks);
        setRemarks('');
        setSelectedReason(null);
        onClose();
    };

    const handleReasonClick = (reason: string) => {
        if (selectedReason === reason) {
            setSelectedReason(null);
            setRemarks('');
        } else {
            setSelectedReason(reason);
            setRemarks((prev) => prev ? `${prev}\n${reason}` : reason);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${actionType === 'reject' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {actionType === 'reject' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                            {title || (actionType === 'reject' ? t('rejectRequest') : t('approveRequest'))}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6">
                    {actionType === 'reject' && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Common Reasons</p>
                            <div className="flex flex-wrap gap-2">
                                {commonReasons.map((reason) => (
                                    <button
                                        key={reason}
                                        onClick={() => handleReasonClick(reason)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedReason === reason
                                                ? 'bg-slate-800 text-white border-slate-800'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                            }`}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            {t('remarks')} / {t('reason')}
                        </p>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder={t('enterRemarksPlaceholder') || "Enter detailed remarks here..."}
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleSubmit}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all ${actionType === 'reject'
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                                }`}
                        >
                            {t('submitDecision')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RemarkModal;
