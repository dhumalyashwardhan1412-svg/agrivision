import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  FlaskConical,
  Sparkles,
  BookOpen,
  Calculator,
  TrendingUp,
  MapPin,
  Stethoscope,
  ShoppingBag,
  FileText,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AgriGuideDrawer } from '../components/ai/AgriGuideDrawer';

export const FarmerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard Overview', path: '/farmer', icon: LayoutDashboard },
    { name: 'My Farms & Land', path: '/farmer/farms', icon: Sprout },
    { name: 'Soil Testing Lab & AI', path: '/farmer/soil', icon: FlaskConical },
    { name: 'Crop Recommendations', path: '/farmer/recommendations', icon: Sparkles },
    { name: 'Farming Plans (Organic/Modern)', path: '/farmer/plans', icon: BookOpen },
    { name: 'Profit & ROI Calculator', path: '/farmer/profit', icon: Calculator },
    { name: 'APMC Mandi Prices', path: '/farmer/market', icon: TrendingUp },
    { name: 'Machinery Hub & Shops Map', path: '/farmer/equipment', icon: MapPin },
    { name: 'Crop Doctor (Disease Scan)', path: '/farmer/doctor', icon: Stethoscope },
    { name: 'My Produce Sales & Orders', path: '/farmer/sales', icon: ShoppingBag },
    { name: 'Smart Farm PDF Report', path: '/farmer/report', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-agri-700 text-white flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">AgriVision</span>
              <span className="block text-[10px] font-bold text-agri-700 uppercase -mt-0.5">Farmer Portal</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Farmer Profile Card */}
        <div className="p-4 mx-4 mt-4 bg-gradient-to-br from-agri-900 to-slate-900 rounded-2xl text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm">
              {user?.full_name?.charAt(0) || 'F'}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm truncate">{user?.full_name || 'Farmer Account'}</h4>
              <p className="text-[11px] text-emerald-400 font-medium truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Farmer
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-agri-700 text-white shadow-sm shadow-agri-700/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
              AgriVision Farmer Workspace
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/marketplace"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Buyer Marketplace
            </Link>
          </div>
        </header>

        {/* Dynamic Page Router Outlet */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Assistant */}
      <AgriGuideDrawer />
    </div>
  );
};
