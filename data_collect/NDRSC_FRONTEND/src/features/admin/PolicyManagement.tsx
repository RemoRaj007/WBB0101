import { useState, useEffect } from 'react';
import { getPolicies } from '../../network/adminService';
import { Plus, Edit, Trash, Shield, History, Cpu, Lock, ChevronRight } from 'lucide-react';

interface Policy {
    id: number;
    name: string;
    effect: 'ALLOW' | 'DENY';
    resource: string;
    action: string;
    subject: Record<string, any>;
}

const PolicyManagement = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        setIsLoading(true);
        try {
            const response = await getPolicies();
            setPolicies(response.data);
        } catch (error) {
            console.error('Failed to fetch policies', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
                        <Lock className="mr-3 text-blue-600" size={32} />
                        Security Governance
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Configure Attribute-Based Access Control (ABAC) protocols for the entire national infrastructure.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center shadow-sm">
                        <History size={18} className="mr-2 text-slate-400" />
                        Audit Logs
                    </button>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center transition-all shadow-xl shadow-blue-600/20 font-black text-sm uppercase tracking-widest group"
                    >
                        <Plus size={18} className="mr-2 group-hover:scale-125 transition-transform" />
                        Define Policy
                    </button>
                </div>
            </div>

            {/* Engine Status Placeholder */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] border border-slate-700 shadow-2xl flex items-center justify-between text-white relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-full bg-blue-500/10 blur-3xl rounded-full"></div>
                <div className="flex items-center space-x-6 relative">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center backdrop-blur-md">
                        <Cpu className="text-blue-400 animate-pulse" size={28} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold">ABAC Enforcement Engine</h4>
                        <div className="flex items-center mt-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            <span className="text-xs font-black uppercase tracking-widest text-blue-300">Operational & Active</span>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:flex items-center space-x-12 relative px-8 border-l border-white/5">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Active Protocols</p>
                        <p className="text-xl font-black">{policies.length}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Last Deploy</p>
                        <p className="text font-bold text-sm">6 mins ago</p>
                    </div>
                </div>
            </div>

            {/* Policy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center"><p className="font-black text-slate-300 uppercase tracking-[0.3em]">Querying centralized policy vault...</p></div>
                ) : (
                    policies.map((policy) => (
                        <div key={policy.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all relative group flex flex-col h-full">
                            <div className="flex items-start justify-between mb-8">
                                <div className={`p-4 rounded-3xl ${policy.effect === 'ALLOW' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} border ${policy.effect === 'ALLOW' ? 'border-green-100' : 'border-red-100'}`}>
                                    <Shield size={24} />
                                </div>
                                <span className={`px-4 py-1.5 text-[11px] font-black rounded-full uppercase tracking-widest ${policy.effect === 'ALLOW' ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'}`}>
                                    {policy.effect} ACCESS
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-slate-800 mb-2 truncate" title={policy.name}>{policy.name}</h3>
                            <p className="text-sm text-slate-500 font-medium mb-8">Authorizes specific interactions with system resources based on verified user attributes.</p>

                            <div className="space-y-4 text-sm font-bold flex-1 pt-4 border-t border-slate-50">
                                <div className="flex justify-between items-center group/item hover:bg-slate-50 p-2 rounded-xl transition-colors">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Resource</span>
                                    <span className="font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs">{policy.resource}</span>
                                </div>
                                <div className="flex justify-between items-center group/item hover:bg-slate-50 p-2 rounded-xl transition-colors">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Action</span>
                                    <span className="font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs">{policy.action}</span>
                                </div>
                                <div className="mt-6">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Target Attributes</p>
                                    <div className="bg-slate-900 p-4 rounded-2xl shadow-inner">
                                        <code className="text-xs text-blue-300 break-all font-mono">
                                            {JSON.stringify(policy.subject, null, 2)}
                                        </code>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex space-x-1">
                                    <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                                        <Edit size={20} />
                                    </button>
                                    <button className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                        <Trash size={20} />
                                    </button>
                                </div>
                                <button className="flex items-center text-xs font-black text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-[0.2em]">
                                    Details <ChevronRight size={14} className="ml-1" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Editor Modal Overlay */}
            {isEditing && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
                        <div className="p-10">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Configure Protocol</h2>
                            <p className="text-slate-500 font-medium mb-8 italic text-sm">Drafting a new ABAC governance rule for live deployment.</p>

                            {/* Dummy Form */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Protocol Name</label>
                                        <input type="text" className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" placeholder="E.g. District Level View Access" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Target Effect</label>
                                        <select className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold appearance-none">
                                            <option>ALLOW ACCESS</option>
                                            <option>DENY ACCESS</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-12 pt-10 border-t border-slate-100">
                                <button onClick={() => setIsEditing(false)} className="px-8 py-4 font-black text-slate-400 hover:text-slate-700 transition-all uppercase text-xs tracking-widest">Discard Entry</button>
                                <button className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">Commit to Engine</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolicyManagement;
