import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Calendar,
    Clock,
    LogOut,
    User,
    ChevronDown,
    Bell,
    Shield,
    LayoutDashboard,
    Settings,
    Search,
    Award,
    Menu
} from 'lucide-react';
import { useAuth } from '../state_hubs/AuthContext';
import { useLocation, Link } from 'react-router-dom';


const Header = () => {
    useTranslation();
    const { user, logout } = useAuth();
    const location = useLocation();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications] = useState(3);
    const [, setIsSearchFocused] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getPageTitle = () => {
        const path = location.pathname.split('/').pop();
        if (!path || path === 'dashboard') return 'Dashboard';
        if (path === 'relief') return 'Relief Management';
        if (path === 'users') return 'User Management';
        if (path === 'approvals') return 'Approvals';
        return path.charAt(0).toUpperCase() + path.slice(1).replace('_', ' ');
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between px-3 transition-all duration-200 bg-white border-b border-gray-200 shadow-sm h-14 sm:h-16 sm:px-4 lg:px-6">
            {/* Left: Mobile Menu + Government Emblem & Title */}
            <div className="flex items-center flex-1 min-w-0 sm:flex-initial">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 mr-2 transition-colors rounded-lg lg:hidden hover:bg-gray-100"
                    aria-label="Toggle menu"
                >
                    <Menu size={20} className="text-gray-600" />
                </button>

                <div className="flex items-center min-w-0 space-x-2 sm:space-x-3">
                    <div className="flex-shrink-0 p-1 rounded-lg sm:p-1.5 bg-blue-50 border border-blue-100">
                        <Award className="w-4 h-4 text-blue-700 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-base font-semibold text-gray-800 truncate sm:text-lg lg:text-xl">
                            {getPageTitle()}
                        </h1>
                    </div>
                </div>


            </div>

            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
                <div className="absolute inset-x-0 top-0 z-30 p-3 bg-white border-b border-gray-200 lg:hidden animate-in slide-in-from-top">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                autoFocus
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => setIsMobileSearchOpen(false)}
                            className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Center: Search Bar - Desktop only */}
            <div className="flex-1 hidden max-w-md mx-4 lg:block xl:mx-8">
                <div className={`relative transition-all duration-200`}>
                    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className="w-full py-2 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-200 rounded-lg bg-gray-50 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center flex-shrink-0 space-x-1 sm:space-x-2 lg:space-x-3">
                {/* Mobile Search Button */}
                <button
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="p-2 text-gray-500 transition-colors rounded-lg lg:hidden hover:bg-gray-100"
                    aria-label="Search"
                >
                    <Search size={18} />
                </button>



                {/* Notifications */}
                <button className="relative p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100">
                    <Bell size={18} />
                    {notifications > 0 && (
                        <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-600 text-white text-[7px] sm:text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                            {notifications > 9 ? '9+' : notifications}
                        </span>
                    )}
                </button>



                {/* Time & Date Display - Hidden on tablet and below */}
                <div className="hidden xl:flex items-center space-x-3 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center text-xs text-gray-600 whitespace-nowrap">
                        <Calendar size={14} className="mr-1.5 text-gray-400 flex-shrink-0" />
                        <span>{formatDate(currentTime)}</span>
                    </div>
                    <div className="w-px h-3 bg-gray-200"></div>
                    <div className="flex items-center text-xs text-gray-600 whitespace-nowrap">
                        <Clock size={14} className="mr-1.5 text-gray-400 flex-shrink-0" />
                        <span className="font-mono">{formatTime(currentTime)}</span>
                    </div>
                </div>

                {/* Time Only - Tablet version */}
                <div className="hidden md:flex xl:hidden items-center px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                    <Clock size={14} className="mr-1.5 text-gray-400" />
                    <span className="font-mono text-xs text-gray-600">{formatTime(currentTime)}</span>
                </div>

                {/* Profile Section */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 pr-1.5 sm:pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                        {/* Avatar */}
                        <div className="flex items-center justify-center text-xs font-medium text-white rounded-lg shadow-sm w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-700 sm:text-sm">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                                    alt={user.username}
                                    className="object-cover w-full h-full rounded-lg"
                                />
                            ) : (
                                <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                            )}
                        </div>

                        {/* User Info - Hidden on small mobile */}
                        <div className="hidden text-left sm:block">
                            <p className="text-xs font-medium leading-tight text-gray-800 sm:text-sm">
                                {user?.username || 'User'}
                            </p>
                            <p className="text-[8px] sm:text-[9px] text-gray-500 leading-tight">
                                {user?.role || 'Role'}
                            </p>
                        </div>

                        {/* Chevron */}
                        <ChevronDown size={14} className="text-gray-400 transition-colors sm:hidden group-hover:text-gray-600" />
                        <ChevronDown size={16} className="hidden text-gray-400 transition-colors sm:block group-hover:text-gray-600" />
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setIsProfileOpen(false)}
                            ></div>

                            {/* Dropdown Menu - Responsive width */}
                            <div className="absolute right-0 z-40 w-64 py-2 mt-2 duration-200 bg-white border border-gray-200 shadow-lg sm:w-72 rounded-xl animate-in fade-in zoom-in-95">
                                {/* User Info Header */}
                                <div className="px-3 py-2 border-b border-gray-100 sm:px-4 sm:py-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-base font-bold text-white rounded-lg sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 sm:text-lg">
                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 truncate sm:text-sm">{user?.username}</p>
                                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{user?.role}</p>
                                            <p className="text-[7px] sm:text-[8px] text-blue-600 mt-1 font-medium truncate">ID: {user?.employeeId || 'NDRSC001'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <Link
                                    to="/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center group"
                                >
                                    <User className="flex-shrink-0 mr-2 text-gray-400 sm:mr-3 group-hover:text-blue-600" size={14} />
                                    <span className="truncate">Profile Settings</span>
                                </Link>

                                <Link
                                    to="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center group"
                                >
                                    <Settings className="flex-shrink-0 mr-2 text-gray-400 sm:mr-3 group-hover:text-blue-600" size={14} />
                                    <span className="truncate">System Settings</span>
                                </Link>

                                <div className="h-px my-1 bg-gray-100 sm:my-2"></div>

                                {/* Department Info */}
                                <div className="px-3 py-1 sm:px-4 sm:py-2">
                                    <p className="text-[7px] sm:text-[8px] text-gray-400 uppercase tracking-wider">Department</p>
                                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1 truncate">National Disaster Relief</p>
                                    <p className="text-[8px] sm:text-[9px] text-gray-500 mt-0.5 truncate">Services Centre • Colombo</p>
                                </div>

                                <div className="h-px my-1 bg-gray-100 sm:my-2"></div>

                                <button
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        logout();
                                    }}
                                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center group"
                                >
                                    <LogOut className="flex-shrink-0 mr-2 transition-transform sm:mr-3 group-hover:scale-110" size={14} />
                                    <span className="truncate">Sign Out</span>
                                </button>

                                {/* Version Info - Simplified on mobile */}
                                <div className="px-3 sm:px-4 py-1.5 sm:py-2 mt-1 sm:mt-2 border-t border-gray-100">
                                    <p className="text-[7px] sm:text-[8px] text-gray-400 truncate">NDRSC v2.0.0</p>
                                    <p className="text-[6px] sm:text-[7px] text-gray-300 mt-0.5 hidden sm:block">Ministry of Disaster Management</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu Panel */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-30 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    {/* Menu Panel */}
                    <div className="fixed top-0 bottom-0 left-0 w-64 bg-white shadow-xl animate-in slide-in-from-left">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-blue-50">
                                    <Award className="w-6 h-6 text-blue-700" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">NDRSC Portal</p>
                                    <p className="text-[10px] text-gray-500">v2.0.0</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-2">
                            <Link
                                to="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50"
                            >
                                <LayoutDashboard size={18} className="mr-3 text-gray-500" />
                                Dashboard
                            </Link>
                            <Link
                                to="/data-entry/relief"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50"
                            >
                                <Award size={18} className="mr-3 text-gray-500" />
                                Relief Application
                            </Link>
                            <Link
                                to="/admin/users"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50"
                            >
                                <User size={18} className="mr-3 text-gray-500" />
                                User Management
                            </Link>
                            <Link
                                to="/admin/approvals/relief"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50"
                            >
                                <Shield size={18} className="mr-3 text-gray-500" />
                                Relief Approvals
                            </Link>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                            <p className="text-[8px] text-gray-400">Ministry of Disaster Management</p>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;