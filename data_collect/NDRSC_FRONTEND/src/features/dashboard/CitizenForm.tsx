import { useState } from 'react';
import { registerCitizen } from '../../network/citizenService';
import { UserPlus, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CitizenForm: React.FC = () => {
    const { t } = useTranslation();
    // We don't need useAuth here as dispatch handles the token automatically
    const [formData, setFormData] = useState({
        name: '',
        nic: '',
        address: '',
        phone: '',
        gnDivision: '',
        dsDivision: '',
        district: ''
    });
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            await registerCitizen(formData, file);
            setMessage(t('citizenSuccess'));
            setFormData({
                name: '',
                nic: '',
                address: '',
                phone: '',
                gnDivision: '',
                dsDivision: '',
                district: ''
            });
            setFile(null);
        } catch (err: any) {
            setError(err.response?.data?.message || t('submissionFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-2xl border-border/50">
            <div className="flex items-center mb-8">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mr-4">
                    <UserPlus className="text-primary-600" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-text-main tracking-tight uppercase">{t('registerCitizen')}</h3>
                    <p className="text-xs font-bold text-text-muted mt-0.5 tracking-widest uppercase opacity-60">{t('identityMgmt')}</p>
                </div>
            </div>

            {message && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-2xl flex items-center font-bold animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={18} className="mr-3" />
                    {message}
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl flex items-center font-bold animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="mr-3" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-2 ml-1">{t('fullName')}</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="e.g. John Doe" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-2 ml-1">{t('nicNumber')}</label>
                        <input type="text" name="nic" value={formData.nic} onChange={handleChange} required className="form-input" placeholder="e.g. 199012345678" />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase text-text-muted mb-2 ml-1">{t('currentAddress')}</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} required rows={3} className="form-input resize-none" placeholder="Enter residential address..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-2 ml-1">{t('phoneNumber')}</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="e.g. +94 7X XXX XXXX" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-2 ml-1">{t('district')}</label>
                        <input type="text" name="district" value={formData.district} onChange={handleChange} required className="form-input" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-2 ml-1">{t('dsDivision')}</label>
                        <input type="text" name="dsDivision" value={formData.dsDivision} onChange={handleChange} required className="form-input" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-text-muted mb-2 ml-1">{t('gnDivision')}</label>
                        <input type="text" name="gnDivision" value={formData.gnDivision} onChange={handleChange} required className="form-input" />
                    </div>
                </div>

                <div className="p-6 bg-main/50 rounded-2xl border border-dashed border-border group hover:border-primary-500/50 transition-colors">
                    <label className="block text-[10px] font-black uppercase text-text-muted mb-3 ml-1">{t('officialDoc')}</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="block w-full text-sm text-text-muted file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-primary-600 file:text-white hover:file:bg-primary-700 file:transition-all cursor-pointer"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-600/20 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        ) : (
                            <Save size={18} className="mr-3" />
                        )}
                        {loading ? t('processing') : t('secureSubmit')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CitizenForm;
