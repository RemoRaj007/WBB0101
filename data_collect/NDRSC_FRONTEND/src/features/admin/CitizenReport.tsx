import React, { useEffect, useState } from 'react';
import { getCitizens } from '../../network/citizenService';
import { useAuth } from '../../foundation/state_hubs/AuthContext';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

interface Citizen {
    id: number;
    name: string;
    nic: string;
    status: string;
    enumerator?: { username: string; email: string };
    createdAt: string;
}

const CitizenReport: React.FC = () => {
    const { token, user } = useAuth();
    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ approved: 0, rejected: 0, total: 0 });

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                // Fetch all citizens (backend controller filters for National/Super to see all) and we filter client side for now 
                // OR ideally backend supports ?status=approved,rejected
                // Let's assume we fetch all and filter client side for simplicity given existing controller
                // Let's assume we fetch all and filter client side for simplicity given existing controller
                const res = await getCitizens();

                const allData: Citizen[] = res.data;
                const finalizedData = allData.filter(c => c.status === 'approved' || c.status === 'rejected');

                setCitizens(finalizedData);
                setStats({
                    approved: finalizedData.filter(c => c.status === 'approved').length,
                    rejected: finalizedData.filter(c => c.status === 'rejected').length,
                    total: finalizedData.length
                });
            } catch (error) {
                console.error("Failed to fetch report data", error);
            } finally {
                setLoading(false);
            }
        };

        if (token && (user?.role === 'National Officer' || user?.role === 'Super User')) {
            fetchReportData();
        }
    }, [token, user]);

    if (!user || (user.role !== 'National Officer' && user.role !== 'Super User')) {
        return <div className="p-8">Access Denied. Only National Officers and Super Users can view this report.</div>;
    }

    if (loading) return <div className="p-8">Loading report...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Citizen Verification Report</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Approved</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Rejected</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Processed</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Verification Details</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">List of all processed citizen data entries.</p>
                </div>
                <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {citizens.map((citizen) => (
                            <li key={citizen.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-blue-600 truncate">{citizen.name}</p>
                                        <p className="text-sm text-gray-500">{citizen.nic}</p>
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${citizen.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {citizen.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            Enumerator: {citizen.enumerator?.username}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <p>
                                            Logged on <time dateTime={citizen.createdAt}>{new Date(citizen.createdAt).toLocaleDateString()}</time>
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {citizens.length === 0 && (
                            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No processed records found.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CitizenReport;
