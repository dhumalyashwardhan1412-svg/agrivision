import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Users, TrendingUp, Activity, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/common/LanguageSelector';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: t('nav.adminDashboard', 'Admin Dashboard'), path: '/admin', icon: Activity },
    { name: t('nav.userManagement', 'User Management & Moderation'), path: '/admin/users', icon: Users },
    { name: t('nav.marketModeration', 'Mandi Price Moderation'), path: '/admin/markets', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight">{t('common.appName', 'AgriVision')}</span>
              <span className="block text-[10px] font-bold text-purple-400 uppercase -mt-0.5">{t('common.adminPortal', 'Admin Central')}</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/70" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Language:</span>
            <LanguageSelector variant="dark" />
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('common.signOut', 'Sign Out')}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 rounded-xl hover:bg-slate-100">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
              {t('common.appName', 'AgriVision')} {t('common.adminPortal', 'Platform Administration')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector variant="light" />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
