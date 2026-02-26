import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUnVolunteer } from '../../network/authService';
import { Lock, User, Mail, Fingerprint, Hash, ArrowRight, Eye, EyeOff } from 'lucide-react';
import LanguageSelector from '../../foundation/elements/widgets/LanguageSelector';
import ndrscLogo from '../../assets/ndrsc_logo.png';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        nic: '',
        email: '',
        password: '',
        enumeratorId: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await registerUnVolunteer(formData);
            setSuccess('Registration successful! Please wait for approval.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-3 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Main Container - Matches Login size */}
            <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[750px] lg:grid lg:grid-cols-2 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden relative z-10">

                {/* Visual Side - Hidden on mobile, visible on lg screens */}
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
                                UN Volunteer
                                <span className="block text-blue-200 text-xs mt-1">Registration</span>
                            </h1>
                            <div className="h-0.5 w-8 bg-blue-400/50 mx-auto"></div>
                            <p className="text-blue-200 font-medium text-[10px] tracking-wider">SRI LANKA</p>
                        </div>
                    </div>
                </div>

                {/* Registration Form Side */}
                <div className="p-4 sm:p-5 flex flex-col justify-center relative">
                    {/* Language Selector & Back Button */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 flex items-center space-x-2">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:flex items-center text-gray-400 hover:text-blue-600 transition-colors text-[10px] font-medium"
                        >
                            <ArrowRight size={12} className="mr-1 rotate-180" />
                            Back
                        </button>
                        <LanguageSelector />
                    </div>

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm p-1.5 sm:p-2 mb-1.5">
                            <img src={ndrscLogo} alt="NDRSC Logo" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-xs sm:text-sm font-semibold text-gray-800">NDRSC Sri Lanka</h2>
                    </div>

                    {/* Header Text */}
                    <div className="mb-3 sm:mb-4 text-center lg:text-left">
                        <h2 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight">
                            Join as Volunteer
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 font-medium">
                            Register for UN Volunteer account
                        </p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded-lg mb-3 flex items-center text-[10px] sm:text-xs">
                            <div className="w-1 h-1 bg-red-500 rounded-full mr-1.5 animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 p-2 rounded-lg mb-3 flex items-center text-[10px] sm:text-xs">
                            <div className="w-1 h-1 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                            {success}
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                        {/* Two Column Layout for Name & NIC */}
                        <div className="grid grid-cols-2 gap-2">
                            {/* Full Name */}
                            <div className="space-y-0.5">
                                <label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 ml-1">
                                    User Name
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <User size={10} className="sm:w-3 sm:h-3" />
                                    </span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 pl-6 pr-2 py-1.5 rounded-lg text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                                        placeholder="User Name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* NIC Number */}
                            <div className="space-y-0.5">
                                <label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 ml-1">
                                    NIC
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <Fingerprint size={10} className="sm:w-3 sm:h-3" />
                                    </span>
                                    <input
                                        type="text"
                                        name="nic"
                                        value={formData.nic}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 pl-6 pr-2 py-1.5 rounded-lg text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                                        placeholder="NIC Number"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Enumerator ID */}
                        <div className="space-y-0.5">
                            <label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 ml-1">
                                Enumerator ID
                            </label>
                            <div className="relative group">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Hash size={10} className="sm:w-3 sm:h-3" />
                                </span>
                                <input
                                    type="text"
                                    name="enumeratorId"
                                    value={formData.enumeratorId}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 pl-6 pr-2 py-1.5 rounded-lg text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                                    placeholder="Enumerator ID"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-0.5">
                            <label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 ml-1">
                                Email
                            </label>
                            <div className="relative group">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Mail size={10} className="sm:w-3 sm:h-3" />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 pl-6 pr-2 py-1.5 rounded-lg text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-0.5">
                            <label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500 ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={10} className="sm:w-3 sm:h-3" />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 pl-6 pr-6 py-1.5 rounded-lg text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? 
                                        <EyeOff size={10} className="sm:w-3 sm:h-3" /> : 
                                        <Eye size={10} className="sm:w-3 sm:h-3" />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-xs flex items-center justify-center transition-all shadow-md shadow-blue-600/25 group relative overflow-hidden ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Register
                                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                        <p className="text-[8px] sm:text-[10px] text-gray-500">
                            Already have an account?{' '}
                            <Link 
                                to="/login" 
                                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                            >
                                Sign In
                            </Link>
                        </p>
                        <p className="text-[6px] sm:text-[8px] text-gray-400 mt-1">
                            © 2024 NDRSC Sri Lanka
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default Register;