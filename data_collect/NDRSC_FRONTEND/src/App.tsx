import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './foundation/state_hubs/AuthContext';
import { ThemeProvider } from './foundation/state_hubs/ThemeContext';
import { ToastProvider } from './foundation/state_hubs/ToastContext';
import Checkpoint, { AdminCheckpoint } from './navigation/checkpoint';
import MainLayout from './foundation/layout/MainLayout';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import UserManagement from './features/admin/UserManagement';
import PolicyManagement from './features/admin/PolicyManagement';
import CitizenReport from './features/admin/CitizenReport';
import PendingApprovals from './features/admin/PendingApprovals';
import ReliefApprovalPortal from './features/admin/ReliefApprovalPortal';
import VolunteerApprovalPortal from './features/admin/VolunteerApprovalPortal';
import Profile from './features/profile/Profile';
import CitizenEntry from './features/data_entry/CitizenEntry';
import ReliefEntry from './features/data_entry/ReliefEntry';
import MyRequests from './features/data_entry/MyRequests';
import NotFound from './features/errors/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import './i18n';

import { AbacProvider } from './foundation/security/AbacContext';

function App() {
    return (
        <Router>
            <ErrorBoundary>
                <AuthProvider>
                    <ThemeProvider>
                        <ToastProvider>
                        <AbacProvider>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                {/* Protected Routes — require authentication */}
                                <Route element={<Checkpoint />}>
                                    <Route element={<MainLayout />}>
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/data-entry/citizen" element={<CitizenEntry />} />
                                        <Route path="/data-entry/relief" element={<ReliefEntry />} />
                                        <Route path="/data-entry/my-requests" element={<MyRequests />} />
                                        <Route path="/profile" element={<Profile />} />

                                        {/* Admin-only routes — require National Officer or Super User role */}
                                        <Route element={<AdminCheckpoint />}>
                                            <Route path="/admin/users" element={<UserManagement />} />
                                            <Route path="/admin/policies" element={<PolicyManagement />} />
                                            <Route path="/admin/reports/citizens" element={<CitizenReport />} />
                                            <Route path="/admin/approvals/citizens" element={<PendingApprovals />} />
                                            <Route path="/admin/approvals/relief" element={<ReliefApprovalPortal />} />
                                            <Route path="/admin/approvals/volunteers" element={<VolunteerApprovalPortal />} />
                                        </Route>
                                    </Route>
                                </Route>

                                {/* 404 page for unknown routes */}
                                <Route path="/404" element={<NotFound />} />
                                <Route path="*" element={<Navigate to="/404" replace />} />
                            </Routes>
                        </AbacProvider>
                        </ToastProvider>
                    </ThemeProvider>
                </AuthProvider>
            </ErrorBoundary>
        </Router>
    );
}

export default App;
