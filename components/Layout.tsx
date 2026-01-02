import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  BarChart2,
  TrendingUp,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  FileText,
  Settings
} from 'lucide-react';
import { Logo } from './Logo';
import { Link, useLocation } from 'react-router-dom'; // Will use HashRouter in App.tsx

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Orders', path: '/orders', icon: Package },
    { label: 'Analytics', path: '/analytics', icon: BarChart2 },
    { label: 'Exports', path: '/exports', icon: FileText },
  ];

  if (user?.is_admin) {
    navItems.push({ label: 'Admin', path: '/admin', icon: ShieldCheck });
  }

  const getLinkClasses = (active: boolean) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out group hover:translate-x-1 ${active
    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 ring-1 ring-brand-500 ring-offset-2 ring-offset-white'
    : 'text-slate-500 hover:bg-brand-50 hover:text-brand-600'
    }`;

  const getIconClasses = (active: boolean) => `w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-brand-600'}`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-20">
        <div className="p-6 flex items-center gap-3 animate-fade-in-up">
          <div className="transition-transform duration-300 hover:rotate-12 hover:scale-110">
            <Logo className="w-8 h-8" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-800">
            OrderEasy
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={getLinkClasses(active)}
              >
                <Icon className={getIconClasses(active)} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {/* 1. Make this clickable for Settings */}
              <Link to="/settings" className="block hover:underline">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.username}</p>
                <p className="text-xs text-slate-500 truncate">{user?.organization}</p>
              </Link>
            </div>

            {/* 2. Optional direct settings icon */}
            <Link to="/settings" className="text-slate-400 hover:text-brand-600">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-100 z-30 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="font-bold text-slate-800">OrderEasy</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="text-slate-600" /> : <Menu className="text-slate-600" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-20 pt-16 px-4 pb-6 flex flex-col">
          <nav className="space-y-2 mt-4 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={getLinkClasses(active)}
                >
                  <Icon className={getIconClasses(active)} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 text-rose-500 bg-rose-50 rounded-lg font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 mt-14 md:mt-0 overflow-x-hidden animate-fade-in-up delay-100">
        {children}
      </main>
    </div>
  );
};

export default Layout;