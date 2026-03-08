import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            // Pass the root origin with the hash route as the redirect_to URL.
            // This ensures Supabase redirects the user directly to the reset-password page.
            const redirectTo = `${window.location.origin}/#/reset-password`;

            const response = await api.post<any>('/auth/forgot-password', {
                email,
                redirect_to: redirectTo
            });

            setStatus('success');
            setMessage(response.message || "If an account with that email exists, we have sent a reset link to it.");
        } catch (err: any) {
            // In a real production app we often still show "Success" to prevent email enumeration,
            // but our backend already handles that for us.
            setStatus('error');
            setMessage(err.message || 'An error occurred while trying to send the reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
            {/* Dynamic Background Elements (Same as Login) */}
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
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password</h1>
                        <p className="text-slate-500 mt-3 text-sm font-medium">
                            Enter your organization's email address and we'll send you a link to reset your password.
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
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Check your email</h3>
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                    {message}
                                </p>

                                <Link
                                    to="/login"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-300 shadow-sm border border-slate-200/50 group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Return to Login
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

                                <div className="space-y-1.5 focus-within:text-brand-600 transition-colors">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all hover:border-slate-300"
                                            placeholder="admin@abhayengineering.com"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading || !email}
                                        className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-500/30 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transform transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                Send Reset Link
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
                                        Back to login
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

export default ForgotPassword;
