import React from 'react';
import { Activity, Users, AlertTriangle, Download, FileText, BarChart3, Map, Clock, Shield } from 'lucide-react';
import { useAuth } from '../../foundation/state_hubs/AuthContext';
import { useTranslation } from 'react-i18next';
import DistrictMap from './DistrictMap';

const NationalDashboard: React.FC = () => {
    const { user } = useAuth();
    useTranslation();

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header Section - Compact */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100">
                            <Map className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
                                National Overview
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-500">Role:</span>
                                <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* System Status */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
                            <Activity className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-[10px] font-medium text-green-700">Active</span>
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-[10px] text-gray-600 font-mono">
                                {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Full height without scroll */}
            <div className="flex-1 p-4">
                <div className="h-full grid grid-cols-12 gap-4">
                    {/* Map View - 8 columns */}
                    <div className="col-span-8 h-full">
                        <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Map className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-xs font-semibold text-gray-700">
                                        District-wise Distribution
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                                        25 Districts
                                    </span>
                                    <span className="text-[8px] text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                        Live
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <DistrictMap />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - 4 columns */}
                    <div className="col-span-4 h-full flex flex-col gap-4">
                        {/* Analytics Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                            <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-xs font-semibold text-gray-700">
                                        Relief Analytics
                                    </h3>
                                </div>
                            </div>
                            <div className="flex-1 p-4 flex flex-col justify-center">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-700 mb-1">
                                        Analytics Engine
                                    </p>
                                    <p className="text-[9px] text-gray-500 mb-3">
                                        Coming Soon
                                    </p>
                                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="w-3/4 h-full bg-blue-600 rounded-full"></div>
                                    </div>
                                    <p className="text-[8px] text-gray-400 mt-2">
                                        75% Complete
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reports Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                            <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        <h3 className="text-xs font-semibold text-gray-700">
                                            Reports
                                        </h3>
                                    </div>
                                    <span className="text-[8px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                        2 Formats
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 p-4">
                                <div className="space-y-2">
                                    {/* Excel Export */}
                                    <button
                                        onClick={() => import('../../network/reportService').then(m => m.downloadReport('relief', 'excel'))}
                                        className="w-full flex items-center justify-between p-2.5 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-green-200">
                                                <Download className="w-3.5 h-3.5 text-green-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-medium text-gray-700">Excel Report</p>
                                                <p className="text-[7px] text-gray-500">.xlsx</p>
                                            </div>
                                        </div>
                                        <span className="text-[8px] text-green-600 group-hover:translate-x-1 transition-transform">
                                            →
                                        </span>
                                    </button>

                                    {/* PDF Export */}
                                    <button
                                        onClick={() => import('../../network/reportService').then(m => m.downloadReport('relief', 'pdf'))}
                                        className="w-full flex items-center justify-between p-2.5 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-red-200">
                                                <FileText className="w-3.5 h-3.5 text-red-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-medium text-gray-700">PDF Report</p>
                                                <p className="text-[7px] text-gray-500">.pdf</p>
                                            </div>
                                        </div>
                                        <span className="text-[8px] text-red-600 group-hover:translate-x-1 transition-transform">
                                            →
                                        </span>
                                    </button>
                                </div>

                                {/* Report Info */}
                                <div className="mt-3 pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5">
                                        <AlertTriangle className="w-2.5 h-2.5 text-gray-400" />
                                        <span className="text-[7px] text-gray-400">
                                            All districts data included
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-[9px] font-medium text-blue-700">System Status</span>
                                </div>
                                <span className="text-[7px] text-blue-600 bg-white px-1.5 py-0.5 rounded-full border border-blue-200">
                                    v2.0.0
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[7px] text-blue-500">Last Updated</p>
                                    <p className="text-[8px] font-medium text-blue-700 font-mono">
                                        {new Date().toLocaleTimeString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[7px] text-blue-500">Districts</p>
                                    <p className="text-[8px] font-medium text-blue-700">25 Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - Compact */}
            <div className="border-t border-gray-200 bg-white px-6 py-2">
                <p className="text-[7px] text-gray-400 text-center">
                    National Disaster Relief Services Centre • Ministry of Disaster Management
                </p>
            </div>
        </div>
    );
};

export default NationalDashboard;