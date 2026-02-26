import React, { useState } from 'react';
import CitizenForm from '../dashboard/CitizenForm';
import {
    UserPlus,
    ShieldCheck,
    Download,
    RefreshCw,
    Users,
    FileText,
    Camera,
    Fingerprint,
    ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CitizenEntry: React.FC = () => {
    const navigate = useNavigate();
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

    const handleRefresh = () => {
        setRefreshing(true);
        // Simulate refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: colors.background.main }}>
            {/* Main Content Area */}
            <div className="flex flex-col flex-1 w-full overflow-hidden">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b" 
                     style={{ borderColor: colors.background.border }}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                            style={{ color: colors.text.secondary }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary.bg }}>
                                <UserPlus size={20} style={{ color: colors.primary.main }} />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                                    Citizen Data Entry
                                </h1>
                                <p className="text-xs" style={{ color: colors.text.tertiary }}>
                                    Register new citizens into the system
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

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto">
                    <div className="p-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { 
                                    label: 'Total Citizens', 
                                    value: '2,847',
                                    icon: Users,
                                    color: colors.primary.main,
                                    bg: colors.primary.bg
                                },
                                { 
                                    label: 'Registered Today', 
                                    value: '24',
                                    icon: FileText,
                                    color: colors.success.main,
                                    bg: colors.success.bg
                                },
                                { 
                                    label: 'Pending Verification', 
                                    value: '13',
                                    icon: Camera,
                                    color: colors.warning.main,
                                    bg: colors.warning.bg
                                },
                                { 
                                    label: 'With Biometrics', 
                                    value: '1,892',
                                    icon: Fingerprint,
                                    color: colors.info.main,
                                    bg: colors.info.bg
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

                        {/* Info Banner */}
                        <div className="p-4 mb-6 bg-white border rounded-xl" 
                             style={{ borderColor: colors.background.border }}>
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary.bg }}>
                                    <ShieldCheck size={18} style={{ color: colors.primary.main }} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm" style={{ color: colors.text.secondary }}>
                                        Use this form to register new citizens into the system. Please ensure all details match the scanned document.
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[10px] font-medium" style={{ color: colors.text.disabled }}>
                                            System: NDRSC ECO-V4 Engine
                                        </span>
                                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.text.disabled }} />
                                        <span className="text-[10px] font-medium" style={{ color: colors.text.disabled }}>
                                            Secure Registration
                                        </span>
                                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.text.disabled }} />
                                        <span className="text-[10px] font-medium" style={{ color: colors.text.disabled }}>
                                            Real-time Validation
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Citizen Form */}
                        <div className="overflow-hidden bg-white border shadow-sm rounded-xl"
                             style={{ borderColor: colors.background.border }}>
                            <div className="flex items-center justify-between px-6 py-4 border-b" 
                                 style={{ borderColor: colors.background.border }}>
                                <h2 className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                                    Citizen Registration Form
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-medium" style={{ color: colors.text.disabled }}>
                                        Live Sync
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <CitizenForm />
                            </div>
                        </div>

                        {/* Form Footer */}
                        <div className="flex items-center justify-between mt-4 text-xs" style={{ color: colors.text.disabled }}>
                            <div className="flex items-center gap-4">
                                <span>* Required Fields</span>
                                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.text.disabled }} />
                                <span>Encrypted in Transit</span>
                                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.text.disabled }} />
                                <span>SSL Secure</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span>Live Sync</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CitizenEntry;