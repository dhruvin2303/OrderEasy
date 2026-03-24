import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, User, Building2, AlertCircle, Mail, KeyRound, Shield, Home as HomeIcon, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    organization: '',
    email: '',
    otp: ''
  });
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password Strength Logic
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-slate-200', 'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];


  // Timer Countdown Logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/send-otp', { email: formData.email });
      setShowOtpInput(true);
      setTimer(60); // 1 minute countdown
      setError('OTP sent! Please check your email.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const { checkSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Updated: Send credentials as JSON body
        await api.post('/auth/login', {
          username: formData.username,
          password: formData.password
        });
        await checkSession();
        navigate('/dashboard');
      } else {
        // Signup with OTP
        await api.post('/auth/signup', {
          username: formData.username,
          password: formData.password,
          organization: formData.organization,
          email: formData.email,
          otp: formData.otp
        });

        setIsLogin(true);
        setError('Registration successful! Please login.');
        // Reset form but keep username for convenience potentially, or clear all
        setFormData({ username: '', password: '', organization: '', email: '', otp: '' });
        setShowOtpInput(false);
        setTimer(0);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Side - Brand/Visuals */}
        <div className="md:w-1/2 bg-gradient-to-br from-brand-600 to-indigo-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">

          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-6 right-6 z-20 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm flex items-center gap-2"
            title="Back to Home"
          >
            <HomeIcon className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </button>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/90 shadow-lg backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
              <Logo className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-bold mb-4">OrderEasy Analytics</h1>
            <p className="text-brand-100 text-lg leading-relaxed">
              A unified platform integrating smart order processing with predictive business intelligence.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="flex items-center gap-4 text-sm font-medium text-brand-200">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-brand-400 border-2 border-brand-600"></div>
                ))}
              </div>
              <p>Strategic Decision Intelligence</p>
            </div>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 mb-8">
            {isLogin ? 'Enter your details to access your dashboard.' : 'Get started with your organization today.'}
          </p>

          {error && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm ${error.includes('successful') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                      placeholder="Company or Business Name"
                      value={formData.organization}
                      onChange={e => setFormData({ ...formData, organization: e.target.value })}
                    />
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative flex gap-2">
                    <div className="relative flex-grow">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        required={!isLogin}
                        disabled={showOtpInput && timer > 0}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none disabled:bg-slate-100 disabled:text-slate-500"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || (timer > 0 && showOtpInput)}
                      className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {timer > 0 ? `${timer}s` : (showOtpInput ? 'Resend' : 'Send OTP')}
                    </button>
                  </div>
                </div>

                {showOtpInput && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">One-Time Password (OTP)</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        required={!isLogin}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                        placeholder="Enter 6-digit code"
                        value={formData.otp}
                        onChange={e => setFormData({ ...formData, otp: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Check your email inbox.</p>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {!isLogin && formData.password && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Security Strength</span>
                    <span className={`text-[10px] font-bold ${strength >= 3 ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step}
                        className={`flex-1 rounded-full transition-all duration-500 ${step <= strength ? strengthColors[strength] : 'bg-slate-100'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!isLogin ? (
                <p className="text-xs text-slate-400 mt-2">Must contain 1 letter, 1 number, 1 special char.</p>
              ) : (
                <div className="text-right mt-1.5">
                  <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-brand-600 font-semibold hover:text-brand-700 hover:underline"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
            <div className="mt-8 text-center">
              <Link 
                to="/privacy" 
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-brand-500 transition-all hover:scale-105 active:scale-95 py-1 px-3 rounded-full hover:bg-brand-500/10"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Privacy Policy</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
