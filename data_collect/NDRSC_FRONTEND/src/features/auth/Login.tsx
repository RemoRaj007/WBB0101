import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../../network/authService';
import { useAuth } from '../../foundation/state_hubs/AuthContext';
import { Lock, User, Eye, EyeOff, LogIn } from 'lucide-react';
import LanguageSelector from '../../foundation/elements/widgets/LanguageSelector';
import ndrscLogo from '../../assets/ndrsc_logo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await loginService({ username, password });
            const { accessToken, user } = response.data;
            login(accessToken, user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-3 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Main Container - Smaller */}
            <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[750px] lg:grid lg:grid-cols-2 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden relative z-10">

                {/* Visual Side - Hidden on mobile, visible on lg screens - Smaller */}
                <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-white/20 rounded-tl-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-white/20 rounded-br-2xl"></div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-white/95 rounded-xl shadow-2xl flex items-center justify-center p-3 mb-4 transform hover:scale-105 transition-all duration-500">
                            <img src={ndrscLogo} alt="NDRSC Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-base font-bold text-white leading-tight">
                                National Disaster Relief
                                <span className="block text-blue-200 text-xs mt-1">Services Centre</span>
                            </h1>
                            <div className="h-0.5 w-8 bg-blue-400/50 mx-auto"></div>
                            <p className="text-blue-200 font-medium text-[10px] tracking-wider">SRI LANKA</p>
                        </div>
                    </div>
                </div>

                {/* Login Form Side - Smaller padding */}
                <div className="p-4 sm:p-5 flex flex-col justify-center relative">
                    {/* Language Selector - Smaller */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 scale-90">
                        <LanguageSelector />
                    </div>

                    {/* Mobile Logo - Only visible on mobile - Smaller */}
                    <div className="lg:hidden flex flex-col items-center mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm p-1.5 sm:p-2 mb-1.5">
                            <img src={ndrscLogo} alt="NDRSC Logo" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-xs sm:text-sm font-semibold text-gray-800">NDRSC Sri Lanka</h2>
                    </div>

                    {/* Header Text - Smaller */}
                    <div className="mb-3 sm:mb-4 text-center lg:text-left">
                        <h2 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 font-medium">
                            Sign in to Officer Portal
                        </p>
                    </div>

                    {/* Error Message - Smaller */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded-lg mb-3 flex items-center text-[10px] sm:text-xs">
                            <div className="w-1 h-1 bg-red-500 rounded-full mr-1.5 animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Username Field - Smaller */}
                        <div className="space-y-0.5">
                            <label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 ml-1">
                                Username
                            </label>
                            <div className="relative group">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <User size={12} className="sm:w-3.5 sm:h-3.5" />
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 pl-7 sm:pl-8 pr-2.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                                    placeholder="Username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field - Smaller */}
                        <div className="space-y-0.5">
                            <label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={12} className="sm:w-3.5 sm:h-3.5" />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 pl-7 sm:pl-8 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                                    placeholder="Password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? 
                                        <EyeOff size={12} className="sm:w-3.5 sm:h-3.5" /> : 
                                        <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password - Smaller */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-1.5 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                />
                                <span className="text-[9px] sm:text-xs text-gray-600 group-hover:text-gray-800 transition-colors">
                                    Remember
                                </span>
                            </label>
                            <button
                                type="button"
                                className="text-[9px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Forgot?
                            </button>
                        </div>

                        {/* Submit Button - Smaller */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-xs flex items-center justify-center transition-all shadow-md shadow-blue-600/25 group relative overflow-hidden ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                                    Sign In
                                </>
                            )}
                        </button>

                        {/* Register Link - Smaller */}
                        <div className="text-center pt-1">
                            <p className="text-[9px] sm:text-xs text-gray-500">
                                UN Volunteer?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/register')}
                                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                                >
                                    Register
                                </button>
                            </p>
                        </div>
                    </form>

                    {/* Footer - Smaller */}
                    <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                        <p className="text-[7px] sm:text-[9px] text-gray-400 font-medium">
                            Authorized personnel only
                        </p>
                        <p className="text-[6px] sm:text-[8px] text-gray-300 mt-0.5">
                            © 2024 NDRSC
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;