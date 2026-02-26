import { useState, useEffect } from 'react';
import { getUsers } from '../../network/userService';
import { Edit, Trash, Search, Shield, ChevronRight, UserPlus, Filter, MapPin, Mail, User as UserIcon } from 'lucide-react';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    district?: string;
    employeeId?: string;
    status?: 'active' | 'inactive' | 'pending';
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role: string) => {
        switch(role) {
            case 'Super User':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'National Officer':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'District Officer':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'Division Officer':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'GN Officer':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'UN Volunteer':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header Section - Compact */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
                                Personnel Directory
                            </h1>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                                Manage authentication and roles for NDRSC officers
                            </p>
                        </div>
                    </div>

                    {/* Register Button */}
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm">
                        <UserPlus size={14} />
                        Register Officer
                    </button>
                </div>
            </div>

            {/* Main Content - Full height without scroll */}
            <div className="flex-1 p-4">
                {/* Filter Bar */}
                <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="all">All Roles</option>
                            <option value="Super User">Super User</option>
                            <option value="National Officer">National Officer</option>
                            <option value="District Officer">District Officer</option>
                            <option value="Division Officer">Division Officer</option>
                            <option value="GN Officer">GN Officer</option>
                            <option value="UN Volunteer">UN Volunteer</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[calc(100%-60px)]">
                    <div className="overflow-auto h-full">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Officer</th>
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">District</th>
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                                                <p className="text-xs text-gray-400">Loading personnel...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center">
                                            <p className="text-xs text-gray-400">No personnel found matching the criteria</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-medium">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-600">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-600">{user.district || 'National'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Shield className="w-3 h-3 text-green-500" />
                                                    <span className="text-[9px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                                        Active
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                                        <Trash size={14} />
                                                    </button>
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
                    <span>Total Personnel: {filteredUsers.length}</span>
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;