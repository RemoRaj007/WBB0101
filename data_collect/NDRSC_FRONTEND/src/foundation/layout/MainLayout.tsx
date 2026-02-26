import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

    // Optimized color palette for 24/7 usage
    const colors = {
        primary: '#2563eb',
        background: {
            main: '#f8fafc',
            card: '#ffffff',
            border: '#e2e8f0'
        },
        text: {
            primary: '#1e293b',
            secondary: '#475569',
            tertiary: '#64748b',
            disabled: '#94a3b8'
        }
    };

    return (
        <div className="flex h-screen overflow-hidden antialiased" 
             style={{ 
                 backgroundColor: colors.background.main,
                 color: colors.text.primary 
             }}>
            
            {/* Sidebar - Fixed width, no margins */}
            <Sidebar 
                isMobileOpen={isSidebarOpen}
                onMobileClose={() => setIsSidebarOpen(false)}
            />

            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area - Full width, no margins */}
            <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
                
                {/* Header - Full width */}
                <Header />

                {/* Scrollable Content - Full width with minimal padding */}
                <main className="flex-1 w-full overflow-y-auto">
                    
                    {/* Content container - minimal padding only */}
                    <div className="w-full min-h-full">
                        
                        {/* Page Content - No padding, full width */}
                        <div className="w-full">
                            <Outlet />
                        </div>

                        {/* Footer - Full width with minimal padding */}
                        <footer className="w-full py-2 border-t" 
                                style={{ 
                                    borderColor: colors.background.border,
                                    backgroundColor: colors.background.card
                                }}>
                            
                            <div className="flex items-center justify-between w-full px-2">
                                
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    <p className="text-[10px]" style={{ color: colors.text.tertiary }}>
                                        NDRSC • Live
                                    </p>
                                </div>

                                <p className="text-[10px]" style={{ color: colors.text.disabled }}>
                                    © {new Date().getFullYear()}
                                </p>

                            </div>

                        </footer>

                    </div>

                </main>

            </div>
        </div>
    );
};

export default MainLayout;