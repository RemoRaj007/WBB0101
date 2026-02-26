import { useState, useEffect } from 'react';
import { useAuth } from '../../foundation/state_hubs/AuthContext';
import { updateProfile } from '../../network/userService';
import { Mail, Phone, Camera, Save, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../foundation/state_hubs/ToastContext';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        bio: '',
        district: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                bio: user.bio || '',
                district: user.district || ''
            });
            // If user has an avatar, set it as preview (prepend server URL if relative)
            if (user.avatar) {
                const avatarUrl = user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`;
                setImagePreview(avatarUrl);
            }
        }
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        // Reset form data if cancelling? Optional, but good UX if we want to revert changes
        if (isEditing && user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                bio: user.bio || '',
                district: user.district || ''
            });
            setImagePreview(user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) : null);
            setSelectedFile(null);
        }
    };

    const handleSaveSuccess = () => {
        setIsEditing(false);
    };

    // Override existing handleSubmit to use handleSaveSuccess
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('username', formData.username);
            data.append('email', formData.email);
            data.append('phoneNumber', formData.phoneNumber);
            data.append('bio', formData.bio);

            if (selectedFile) {
                data.append('avatar', selectedFile);
            }

            const response = await updateProfile(data);

            if (response.data.user) {
                updateUser(response.data.user);
            }

            showToast(t('profile_updated_successfully') || 'Profile updated successfully', 'success');
            handleSaveSuccess();
        } catch (error) {
            showToast('Failed to update profile', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-black text-text-main mb-8">{t('profile')}</h1>

            <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
                <div className="md:flex">
                    {/* Left Panel - Avatar & Quick Info */}
                    <div className="md:w-1/3 bg-main p-8 flex flex-col items-center border-r border-border">
                        <div className="relative group mb-6">
                            <div className="w-32 h-32 rounded-full ring-4 ring-card shadow-lg overflow-hidden bg-main flex items-center justify-center relative border border-border">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-black text-text-muted">{user?.username?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            {isEditing && (
                                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary-600 text-white p-2.5 rounded-full shadow-lg hover:bg-primary-700 transition-colors cursor-pointer">
                                    <Camera size={18} />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-text-main mb-1">{user?.username}</h2>
                        <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-wider rounded-full mb-6">
                            {user?.role}
                        </span>

                        <div className="w-full space-y-4">
                            <div className="flex items-center text-text-muted text-sm">
                                <Mail size={16} className="mr-3 text-text-muted" />
                                {user?.email}
                            </div>
                            <div className="flex items-center text-text-muted text-sm">
                                <Shield size={16} className="mr-3 text-text-muted" />
                                ID: {user?.id}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - View/Edit Mode */}
                    <div className="md:w-2/3 p-8">
                        {!isEditing ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-black uppercase text-text-muted tracking-wider mb-1">Username</p>
                                        <p className="text-lg font-medium text-text-main">{user?.username || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-text-muted tracking-wider mb-1">Phone</p>
                                        <p className="text-lg font-medium text-text-main">{user?.phoneNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-text-muted tracking-wider mb-1">Email</p>
                                        <p className="text-lg font-medium text-text-main">{user?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-text-muted tracking-wider mb-1">District</p>
                                        <p className="text-lg font-medium text-text-main">{user?.district || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase text-text-muted tracking-wider mb-1">Bio</p>
                                    <p className="text-base text-text-muted leading-relaxed">
                                        {user?.bio || 'No bio available.'}
                                    </p>
                                </div>
                                <div className="pt-6 border-t border-border flex justify-end">
                                    <button
                                        onClick={toggleEdit}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-600/30 transition-all flex items-center"
                                    >
                                        <div className="mr-2"><Save size={16} /></div>
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-text-muted tracking-wider mb-2">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="w-full bg-main border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-text-main"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-text-muted tracking-wider mb-2">Phone</label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-4 top-3.5 text-text-muted" />
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                className="w-full bg-main border border-border rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-text-main"
                                                placeholder="+94"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-text-muted tracking-wider mb-2">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full bg-main border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none text-text-main"
                                        placeholder="Tell us about your role..."
                                    ></textarea>
                                </div>

                                <div className="flex items-center justify-end pt-4 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={toggleEdit}
                                        className="mr-4 px-6 py-2.5 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-600/30 flex items-center transition-all disabled:opacity-70"
                                    >
                                        {isLoading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        ) : (
                                            <Save size={16} className="mr-2" />
                                        )}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
