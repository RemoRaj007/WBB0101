import React, { useEffect, useState } from 'react';
import StatsCard from './StatCard';
import { FileText, CheckCircle, Clock, Map, Building2 } from 'lucide-react';
import { useAuth } from '../../foundation/state_hubs/AuthContext';
import { useTranslation } from 'react-i18next';
import { getReliefRequests } from '../../network/reliefService';

const DistrictDashboard: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalRequests: 0,
        approvedRequests: 0,
        pendingRequests: 0,
        divisions: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all requests for this district (filtered by backend)
                const res = await getReliefRequests('');
                const requests = res.data;

                if (Array.isArray(requests)) {
                    const total = requests.length;
                    const approved = requests.filter((r: any) => r.status === 'approved').length;
                    const pending = requests.filter((r: any) => r.status === 'pending').length;

                    // Count unique DS Divisions
                    const uniqueDivisions = new Set(requests.map((r: any) => r.dsDivision)).size;

                    setStats({
                        totalRequests: total,
                        approvedRequests: approved,
                        pendingRequests: pending,
                        divisions: uniqueDivisions
                    });
                }
            } catch (error) {
                console.error("Error fetching district stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-8">
            <h1 className="text-3xl font-black text-text-main mb-2 tracking-tight">
                {user?.district} {t('districtOverview')}
            </h1>
            <p className="text-text-muted font-bold mb-8 flex items-center gap-2">
                <Map size={16} />
                District Secretariat Portal
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatsCard
                    title={t('totalReliefRequests')}
                    value={stats.totalRequests.toString()}
                    type="info"
                    icon={FileText}
                    change={t('districtWide')}
                />
                <StatsCard
                    title={t('activeDivisions')}
                    value={stats.divisions.toString()}
                    type="warning"
                    icon={Building2}
                    change={t('reportingData')}
                />
                <StatsCard
                    title={t('approvedRequests')}
                    value={stats.approvedRequests.toString()}
                    type="success"
                    icon={CheckCircle}
                    change={t('verified')}
                />
                <StatsCard
                    title={t('pendingApproval')}
                    value={stats.pendingRequests.toString()}
                    type="danger"
                    icon={Clock}
                    change={t('actionRequired')}
                />
            </div>

            {/* Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black text-text-main tracking-tight uppercase">{t('districtReports')}</h3>
                            <p className="text-xs text-text-muted font-bold">Export data for {user?.district} District</p>
                        </div>
                        <FileText className="text-primary-600" size={24} />
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => import('../../network/reportService').then(m => m.downloadReport('relief', 'excel'))}
                            className="btn btn-secondary flex-1 py-3 font-bold flex items-center justify-center gap-2"
                        >
                            {t('exportExcel')}
                        </button>
                        <button
                            onClick={() => import('../../network/reportService').then(m => m.downloadReport('relief', 'pdf'))}
                            className="btn btn-outline flex-1 py-3 font-bold flex items-center justify-center gap-2"
                        >
                            {t('exportPdf')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DistrictDashboard;
