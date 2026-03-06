import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trash2, AlertTriangle, CheckCircle, User, Shield, Key, ChevronRight, Save, Upload, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Settings: React.FC = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'danger'>('profile');
    const [logoUploading, setLogoUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Password Change State
    // Password Change State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    // Global Notification Toast
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Delete Account State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }

        setPassLoading(true);
        try {
            await api.post('/auth/change-password?current_password=' + encodeURIComponent(currentPassword) +
                '&new_password=' + encodeURIComponent(newPassword) +
                '&confirm_new_password=' + encodeURIComponent(confirmPassword), {});
            showNotification('Password changed successfully', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            showNotification(err.message || 'Failed to change password', 'error');
        } finally {
            setPassLoading(false);
        }
    };

    const handleDeleteAccount = async () => {

        try {
            await api.delete('/auth/delete-account');
            logout();
            navigate('/login');
        } catch (err: any) {
            alert(err.message || "Failed to delete account");
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Information', icon: User, desc: 'Your personal and organizational details' },
        { id: 'security', label: 'Security & Password', icon: Shield, desc: 'Manage your password and security' },
        ...(!user?.is_admin ? [{ id: 'danger', label: 'Danger Zone', icon: Trash2, desc: 'Delete account and data' }] : [])
    ];

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        try {
            setLogoUploading(true);

            // 1. Upload to Cloudinary via generic upload endpoint
            const uploadRes = await api.upload('/upload/?folder=ordereasy/logos', file);

            // 2. Save the URL to the user profile
            const updateRes = await api.put('/auth/update-logo', { logo_url: uploadRes.url });

            // 3. Update Global Context
            updateUser({ logo_url: uploadRes.url });
            showNotification('Logo uploaded successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Failed to upload logo', 'error');
        } finally {
            setLogoUploading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto position-relative">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-24 right-6 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right fade-in ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <p className="font-medium">{notification.message}</p>
                </div>
            )}

            {/* Header */}
            <div className="mb-8 animate-fade-in-up">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
                <p className="text-slate-500 mt-2 text-lg">Manage your profile, security, and preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-80 flex-shrink-0 space-y-2 animate-fade-in-up">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 text-left border ${isActive
                                    ? 'bg-white border-brand-200 shadow-md shadow-brand-100 ring-1 ring-brand-100'
                                    : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-600'
                                    }`}
                            >
                                <div className={`p-2.5 rounded-lg mr-4 flex-shrink-0 transition-colors ${isActive ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-semibold ${isActive ? 'text-brand-900' : 'text-slate-700'}`}>{tab.label}</h3>
                                    <p className={`text-xs mt-0.5 ${isActive ? 'text-brand-600/70' : 'text-slate-400'}`}>{tab.desc}</p>
                                </div>
                                {isActive && <ChevronRight className="w-5 h-5 text-brand-400" />}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                            >
                                {/* Cover Banner */}
                                <div className="h-32 bg-gradient-to-r from-brand-600 to-indigo-600 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay pattern-grid-lg"></div>
                                </div>

                                <div className="px-8 pb-8">
                                    {/* Avatar */}
                                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                                        <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-xl border border-slate-100/50 relative group">
                                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-brand-100 to-indigo-50 flex items-center justify-center text-5xl font-extrabold text-brand-600 shadow-inner border border-brand-200/50 overflow-hidden relative">
                                                {user?.logo_url ? (
                                                    <img src={user.logo_url} alt="Organization Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    user?.username.charAt(0).toUpperCase()
                                                )}

                                                {/* Upload Overlay */}
                                                {!user?.is_admin && (
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={logoUploading}
                                                        title="Upload custom organization logo"
                                                        className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer disabled:cursor-wait"
                                                    >
                                                        {logoUploading ? (
                                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Camera className="w-8 h-8 mb-1" />
                                                                <span className="text-xs font-bold tracking-wider uppercase">Upload</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                            />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="px-4 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-semibold border border-brand-100 flex items-center gap-2 shadow-sm shadow-brand-100">
                                                <Shield className="w-4 h-4" />
                                                {user?.is_admin ? 'Super Administrator' : 'Organization Admin'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <div>
                                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.organization}</h2>
                                            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1.5">
                                                <User className="w-4 h-4" /> @{user?.username}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                                            <div className="space-y-2 group">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Organization Name</label>
                                                <div className="p-4 bg-slate-50/50 group-hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-800 font-semibold text-lg transition-colors">
                                                    {user?.organization}
                                                </div>
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                                                <div className="p-4 bg-slate-50/50 group-hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-800 font-semibold text-lg transition-colors">
                                                    {user?.username}
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2 group">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                                <div className="p-4 bg-slate-50/50 group-hover:bg-slate-50 rounded-xl border border-slate-100 text-slate-800 font-semibold text-lg flex justify-between items-center transition-colors">
                                                    <span>{user?.email || 'No email provided'}</span>
                                                    {!user?.email && <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-md font-bold shadow-sm shadow-amber-200/50 uppercase tracking-wider">MISSING</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-8"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner border border-indigo-100/50">
                                        <Key className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Password</h2>
                                        <p className="text-slate-500 text-base mt-2 font-medium">Keep your account secure by using a strong, unique password.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleChangePassword} className="max-w-2xl space-y-6">
                                    <div className="space-y-2 transition-colors">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Current Password</label>
                                        <input
                                            type="password" required
                                            className="w-full p-3.5 border border-slate-200 rounded-xl text-md shadow-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-white text-slate-900 font-medium"
                                            value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                                            placeholder="Enter your current password"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-2 transition-colors">
                                            <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                                            <input
                                                type="password" required minLength={4}
                                                className="w-full p-3.5 border border-slate-200 rounded-xl text-md shadow-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-white text-slate-900 font-medium"
                                                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <div className="space-y-2 transition-colors">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                                            <input
                                                type="password" required minLength={4}
                                                className="w-full p-3.5 border border-slate-200 rounded-xl text-md shadow-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all bg-white text-slate-900 font-medium"
                                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-8 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-slate-100">
                                        <button
                                            type="submit" disabled={passLoading}
                                            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-brand-600/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
                                        >
                                            {passLoading ? <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                            {passLoading ? 'Updating Security...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'danger' && !user?.is_admin && (
                            <motion.div
                                key="danger"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                            >
                                <div className="p-8">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl shadow-inner border border-rose-100/50">
                                            <AlertTriangle className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Danger Zone</h2>
                                            <p className="text-slate-500 text-base mt-2 font-medium">Irreversible actions that permanently alter or destroy your account.</p>
                                        </div>
                                    </div>

                                    <div className="border shadow-sm shadow-rose-100 border-rose-200 rounded-2xl p-8 bg-gradient-to-br from-white via-rose-50/30 to-rose-50/50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                                            <Trash2 className="w-48 h-48 text-rose-500 rotate-12" />
                                        </div>

                                        <div className="relative z-10">
                                            <h3 className="text-xl font-extrabold text-rose-900 mb-3 tracking-tight">Delete Organization Account</h3>
                                            <p className="text-slate-700 mb-8 max-w-2xl leading-relaxed font-medium">
                                                Once you delete your account, there is absolutely no going back. Please be certain.
                                                This will permanently delete your organization details, all associated orders, active deliveries, and uploaded files.
                                            </p>

                                            {!showDeleteConfirm ? (
                                                <button
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="bg-white border-2 border-rose-200 text-rose-600 font-bold text-md px-8 py-3.5 rounded-xl hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                    Proceed to Delete Account
                                                </button>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    className="p-8 bg-white rounded-2xl border-2 border-rose-500 shadow-2xl shadow-rose-500/20 max-w-xl"
                                                >
                                                    <div className="flex items-start gap-5 mb-8">
                                                        <div className="p-3 bg-rose-100 text-rose-600 rounded-full flex-shrink-0 shadow-inner">
                                                            <AlertTriangle className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xl font-extrabold text-rose-800 tracking-tight">Are you absolutely sure?</p>
                                                            <p className="text-rose-700/80 mt-2 text-md font-semibold leading-snug">This action will immediately and permanently erase all data. This is not reversible, no backups will be kept.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-rose-100">
                                                        <button
                                                            onClick={handleDeleteAccount}
                                                            className="flex-1 bg-rose-600 text-white font-bold px-6 py-4 rounded-xl hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 hover:-translate-y-0.5 active:translate-y-0 text-md"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                            Yes, Delete Everything
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(false)}
                                                            className="sm:w-32 text-slate-700 bg-slate-100 font-bold px-6 py-4 rounded-xl hover:bg-slate-200 transition-colors text-md hover:-translate-y-0.5 active:translate-y-0"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Settings;
