import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state_hubs/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Users,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Layers,
    Activity,
    CheckSquare,
    UserCheck,
    Edit3,
    List,
    Award,
    X,
    Menu
} from 'lucide-react';

interface SidebarProps {
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

const Sidebar = ({ isMobileOpen, onMobileClose }: SidebarProps) => {
    const { user, logout } = useAuth();
    useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            // Auto collapse on mobile
            if (mobile) {
                setCollapsed(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        if (!isMobile) {
            setCollapsed(!collapsed);
        }
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        // Close mobile sidebar after navigation
        if (onMobileClose && isMobile) {
            onMobileClose();
        }
    };

    const handleLogout = () => {
        logout();
        if (onMobileClose && isMobile) {
            onMobileClose();
        }
    };

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super User', 'National Officer', 'District Officer', 'Division Officer', 'GN Officer', 'UN Volunteer'] },
        { path: '/data-entry/relief', label: 'Relief Application', icon: Edit3, roles: ['District Officer', 'Division Officer', 'GN Officer', 'UN Volunteer'] },
        { path: '/data-entry/my-requests', label: 'My Requests', icon: List, roles: ['GN Officer', 'UN Volunteer'] },
        { path: '/admin/users', label: 'User Management', icon: Users, roles: ['Super User'] },
        { path: '/admin/approvals/relief', label: 'Relief Approvals', icon: CheckSquare, roles: ['Super User', 'National Officer', 'District Officer'] },
        { path: '/admin/approvals/volunteers', label: 'Volunteer Approvals', icon: UserCheck, roles: ['Super User', 'National Officer'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role || ''));

    // Don't render if not open on mobile
    if (isMobile && !isMobileOpen) {
        return null;
    }

    return (
        <>
            {/* Mobile Header with Menu Button - Only visible on mobile when sidebar is closed */}
            {isMobile && !isMobileOpen && (
                <button
                    onClick={onMobileClose}
                    className="fixed top-3 left-3 z-50 p-2.5 bg-blue-600 text-white rounded-lg shadow-lg lg:hidden hover:bg-blue-700 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>
            )}

            <aside
                className={`
                    flex flex-col h-screen bg-white border-r border-gray-200 text-gray-700 
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'w-20' : 'w-64'}
                    ${isMobile
                        ? `fixed top-0 left-0 z-40 shadow-2xl ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`
                        : 'relative lg:translate-x-0'
                    }
                    overflow-hidden
                `}
            >
                {/* Mobile Header */}
                {isMobile && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                                <Award className="text-white" size={16} />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">NDRSC</span>
                        </div>
                        <button
                            onClick={onMobileClose}
                            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={18} className="text-gray-600" />
                        </button>
                    </div>
                )}

                {/* Government Branding - Hidden on mobile (moved to mobile header) */}
                {!isMobile && (
                    <div className={`p-5 flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} mb-2 pt-6`}>
                        <div className="flex items-center justify-center flex-shrink-0 bg-blue-600 rounded-lg shadow-sm w-9 h-9">
                            <Award className="text-white" size={18} />
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden duration-500 whitespace-nowrap animate-in fade-in slide-in-from-left-4">
                                <h1 className="text-base font-semibold leading-none tracking-tight text-gray-800">NDRSC</h1>
                                <p className="text-[8px] text-gray-500 font-medium tracking-wider mt-0.5">Govt of Sri Lanka</p>
                            </div>
                        )}
                    </div>
                )}

                {/* User Info - Only when expanded and not mobile header case */}
                {!collapsed && user && !isMobile && (
                    <div className="p-3 mx-3 mb-4 border border-blue-100 rounded-lg bg-blue-50">
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-blue-600 rounded-lg">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800 truncate">
                                    {user?.username || 'User'}
                                </p>
                                <p className="text-[8px] text-gray-500 truncate mt-0.5">
                                    {user?.role} • ID: {user?.employeeId || 'EMP001'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Info - Mobile version (simplified) */}
                {isMobile && user && (
                    <div className="p-3 mx-3 mt-3 mb-2 border border-blue-100 rounded-lg bg-blue-50">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 text-base font-medium text-white bg-blue-600 rounded-lg">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                    {user?.username || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.role}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                    ID: {user?.employeeId || 'EMP001'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <div className="flex-1 px-2 py-3 overflow-y-auto no-scrollbar sm:px-3">
                    <div className="space-y-1">
                        {!collapsed && !isMobile && (
                            <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                                Main Menu
                            </p>
                        )}

                        {/* Mobile Section Title */}
                        {isMobile && (
                            <p className="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                Navigation
                            </p>
                        )}

                        {filteredItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`
                                    w-full flex items-center py-2.5 px-3 rounded-lg transition-all duration-200 group relative
                                    ${location.pathname === item.path
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                    ${collapsed && !isMobile ? 'justify-center' : ''}
                                    ${isMobile ? 'py-3' : ''}
                                `}
                                title={collapsed && !isMobile ? item.label : undefined}
                            >
                                <item.icon
                                    size={isMobile ? 20 : 18}
                                    className={`
                                        ${collapsed && !isMobile ? '' : 'mr-3'} 
                                        flex-shrink-0
                                        ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'}
                                    `}
                                />
                                {(!collapsed || isMobile) && (
                                    <span className="flex-1 text-xs text-left sm:text-sm">
                                        {item.label}
                                    </span>
                                )}
                                {location.pathname === item.path && !collapsed && !isMobile && (
                                    <div className="absolute right-0 w-1 h-4 bg-blue-600 rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* System Section - Desktop */}
                    {!isMobile && !collapsed && user?.role === 'Super User' && (
                        <div className="pt-4 mt-6 border-t border-gray-200">


                        </div>
                    )}

                    {/* System Section - Mobile */}
                    {isMobile && user?.role === 'Super User' && (
                        <div className="pt-4 mt-4 border-t border-gray-200">
                            <p className="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                System
                            </p>
                            <div className="space-y-1">
                                <button
                                    onClick={() => handleNavigation('/system/performance')}
                                    className={`
                                        w-full flex items-center py-3 px-3 rounded-lg text-sm transition-colors
                                        ${location.pathname === '/system/performance'
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <Activity size={18} className="mr-3" />
                                    Performance
                                </button>
                                <button
                                    onClick={() => handleNavigation('/system/cluster-status')}
                                    className={`
                                        w-full flex items-center py-3 px-3 rounded-lg text-sm transition-colors
                                        ${location.pathname === '/system/cluster-status'
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <Layers size={18} className="mr-3" />
                                    Cluster Status
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-2 space-y-2 border-t border-gray-200 sm:p-3">
                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 group ${collapsed && !isMobile ? 'justify-center' : ''
                            } ${isMobile ? 'py-3' : ''}`}
                        title={collapsed && !isMobile ? "Logout" : undefined}
                    >
                        <LogOut size={isMobile ? 20 : 18} className={`${collapsed && !isMobile ? '' : 'mr-3'} transition-transform group-hover:scale-105`} />
                        {(!collapsed || isMobile) && <span className="text-xs font-medium sm:text-sm">Logout</span>}
                    </button>

                    {/* Collapse Toggle - Desktop only */}
                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className="flex items-center justify-center w-full py-2 text-gray-400 transition-colors hover:text-gray-600 group"
                        >
                            {collapsed ? (
                                <ChevronRight size={18} />
                            ) : (
                                <div className="flex items-center text-[9px] font-medium uppercase tracking-wider opacity-60 group-hover:opacity-100">
                                    <ChevronLeft size={14} className="mr-1.5" />
                                    Collapse Menu
                                </div>
                            )}
                        </button>
                    )}
                </div>

                {/* Version Info - Desktop only */}
                {!isMobile && !collapsed && (
                    <div className="pb-3 text-center">
                        <p className="text-[7px] text-gray-400">NDRSC v2.0.0</p>
                        <p className="text-[6px] text-gray-300 mt-0.5">Ministry of Disaster Management</p>
                    </div>
                )}

                {/* Version Info - Mobile */}
                {isMobile && (
                    <div className="p-3 text-center border-t border-gray-200">
                        <p className="text-[9px] text-gray-400">NDRSC v2.0.0 • Ministry of Disaster Management</p>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;