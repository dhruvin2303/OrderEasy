import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion, AnimatePresence } from 'framer-motion';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [accessToken, setAccessToken] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Supabase redirects to /#/reset-password#access_token=...&type=recovery
        // The location.hash will contain everything after the first '#'
        // For HashRouter, that includes /reset-password#access_token=...

        const rawHash = window.location.hash;

        // We look for access_token anywhere in the hash string
        if (rawHash.includes('access_token')) {
            // Split by '#' and find the part with access_token
            const parts = rawHash.split('#');
            const tokenPart = parts.find(p => p.includes('access_token'));

            if (tokenPart) {
                // Parse params from the part containing the token
                const params = new URLSearchParams(tokenPart.includes('?') ? tokenPart.split('?')[1] : tokenPart);
                const token = params.get('access_token');
                if (token) {
                    setAccessToken(token);
                    return;
                }
            }
        }

        // Check if token is already set, if not, show error
        if (!accessToken) {
            setStatus('error');
            setMessage('Invalid or missing secure reset token. Please request a new password reset link.');
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) return;

        if (newPassword !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }

        if (!accessToken) {
            setStatus('error');
            setMessage('Missing secure reset token.');
            return;
        }

        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const response = await api.post<any>('/auth/reset-password', {
                new_password: newPassword,
                access_token: accessToken
            });

            setStatus('success');
            setMessage(response.message || "Your password has been securely updated.");
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'An error occurred while trying to update your password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-brand-600 to-indigo-900 origin-top transform -skew-y-6 z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-1/4 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-white/90 backdrop-blur-xl border border-white/60 p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-100 mb-6 group hover:scale-105 transition-transform duration-300">
                            <Logo className="w-10 h-10 sm:w-12 sm:h-12 transform group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create New Password</h1>
                        <p className="text-slate-500 mt-3 text-sm font-medium">
                            Please enter your new secure password below to regain access to your dashboard.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6"
                            >
                                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Password Updated!</h3>
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                    {message}
                                </p>

                                <Link
                                    to="/login"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-brand-500/30 group hover:-translate-y-0.5"
                                >
                                    Return to Login
                                    <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                {status === 'error' && (
                                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium flex items-start gap-3 animate-shake">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span>{message}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-1.5 focus-within:text-brand-600 transition-colors">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">New Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all hover:border-slate-300"
                                                placeholder="Min. 8 characters"
                                                required
                                                autoFocus
                                                disabled={!accessToken}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 focus-within:text-brand-600 transition-colors">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Confirm New Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all hover:border-slate-300"
                                                placeholder="Confirm your password"
                                                required
                                                disabled={!accessToken}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading || !newPassword || !confirmPassword || !accessToken}
                                        className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-500/30 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transform transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                Update Password
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="text-center pt-2">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors hover:underline"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Cancel and return to login
                                    </Link>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
