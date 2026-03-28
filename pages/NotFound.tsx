import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center border border-slate-100">
        
        <div className="mx-auto w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-12 h-12 text-rose-500" />
        </div>
        
        <h1 className="text-7xl font-extrabold text-slate-900 mb-2 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Page Not Found</h2>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          Oops! It seems you've followed a broken link or entered a URL that doesn't exist on this server.
        </p>
        
        <button
          onClick={() => navigate('/')}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
