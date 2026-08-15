import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, LogIn, UserPlus, LogOut, LayoutDashboard, ShoppingBag, Bot, Compass, Bell, Shield, User, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LiveMandiTicker } from '../components/dashboard/LiveMandiTicker';
import { AgriGuideDrawer } from '../components/ai/AgriGuideDrawer';
import { marketApi } from '../services/marketApi';
import { MarketPrice } from '../types';

export const MainLayout: React.FC = () => {
  const { user, role, logout, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tickerPrices, setTickerPrices] = useState<MarketPrice[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await marketApi.getPrices();
        setTickerPrices(data);
      } catch (err) {
        console.error('Ticker fetch err', err);
      }
    };
    fetchPrices();
  }, []);

  const getDashboardRoute = () => {
    if (role === 'FARMER') return '/farmer';
    if (role === 'CUSTOMER') return '/customer';
    if (role === 'SHOPKEEPER') return '/shopkeeper';
    if (role === 'ADMIN') return '/admin';
    return '/farmer';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Live Mandi Ticker at Top */}
      <LiveMandiTicker prices={tickerPrices} />

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-agri-800 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-agri-700/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Agri<span className="text-agri-700">Vision</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 block -mt-1">
                Smart Agriculture OS
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link to="/" className={`hover:text-agri-700 transition ${location.pathname === '/' ? 'text-agri-700' : ''}`}>
              Overview
            </Link>
            <Link to="/marketplace" className={`hover:text-agri-700 transition flex items-center gap-1 ${location.pathname.startsWith('/marketplace') ? 'text-agri-700' : ''}`}>
              <ShoppingBag className="w-4 h-4 text-emerald-600" /> Marketplace
            </Link>
            <Link to="/markets" className="hover:text-agri-700 transition flex items-center gap-1">
              <Compass className="w-4 h-4 text-sky-600" /> APMC Mandis
            </Link>
            <Link to="/crop-doctor" className="hover:text-agri-700 transition flex items-center gap-1">
              <Bot className="w-4 h-4 text-purple-600" /> Crop Doctor AI
            </Link>
            <Link to="/3d" className="hover:text-emerald-800 transition flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> 3D Digital Twin
            </Link>
          </nav>

          {/* User Auth Buttons / Role Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardRoute()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-agri-100 text-agri-800 hover:bg-agri-200 transition shadow-2xs"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{user.role} Dashboard</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* 1-Click Demo Login Selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-slate-600">
                  <span className="px-2 text-slate-400">Demo:</span>
                  <button
                    onClick={() => quickDemoLogin('FARMER')}
                    className="px-2.5 py-1 bg-white rounded-lg shadow-2xs hover:text-agri-700 transition"
                  >
                    Farmer
                  </button>
                  <button
                    onClick={() => quickDemoLogin('CUSTOMER')}
                    className="px-2.5 py-1 bg-white rounded-lg shadow-2xs hover:text-agri-700 transition"
                  >
                    Buyer
                  </button>
                  <button
                    onClick={() => quickDemoLogin('SHOPKEEPER')}
                    className="px-2.5 py-1 bg-white rounded-lg shadow-2xs hover:text-agri-700 transition"
                  >
                    Dealer
                  </button>
                  <button
                    onClick={() => quickDemoLogin('ADMIN')}
                    className="px-2.5 py-1 bg-white rounded-lg shadow-2xs hover:text-agri-700 transition"
                  >
                    Admin
                  </button>
                </div>

                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-agri-800 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold bg-agri-700 hover:bg-agri-800 text-white rounded-xl shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 rounded-xl hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden p-4 bg-white border-b border-slate-200 space-y-3">
            <nav className="flex flex-col gap-2 font-semibold text-sm">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50">
                Overview
              </Link>
              <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" /> Marketplace
              </Link>
              <Link to="/markets" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-600" /> APMC Mandis
              </Link>
              <Link to="/crop-doctor" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" /> Crop Doctor AI
              </Link>
            </nav>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              {user ? (
                <Link
                  to={getDashboardRoute()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center block py-2.5 bg-agri-700 text-white font-bold rounded-xl text-sm"
                >
                  Go to {user.role} Dashboard
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 bg-slate-100 font-bold rounded-xl text-xs"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 bg-agri-700 text-white font-bold rounded-xl text-xs"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span>AgriVision Platform</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering farmers with hybrid AI recommendations, certified soil analysis, APMC mandi intelligence, and direct marketplace commerce.
            </p>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Farmer Tools</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/farmer/soil" className="hover:text-white transition">Soil Testing Lab & AI</Link></li>
              <li><Link to="/farmer/recommendations" className="hover:text-white transition">Hybrid Crop Suitability</Link></li>
              <li><Link to="/farmer/profit" className="hover:text-white transition">Profit & ROI Calculator</Link></li>
              <li><Link to="/farmer/doctor" className="hover:text-white transition">Crop Doctor (Disease Scan)</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Market & Commerce</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/marketplace" className="hover:text-white transition">Direct Farm Marketplace</Link></li>
              <li><Link to="/farmer/equipment" className="hover:text-white transition">Machinery & Tractor Rentals</Link></li>
              <li><Link to="/markets" className="hover:text-white transition">APMC Mandi Price Ticker</Link></li>
              <li><Link to="/farmer/report" className="hover:text-white transition">Smart Farm PDF Reports</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Advisory & Compliance</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              AgriVision incorporates agro-climatic norms from ICAR & PAU agronomic standards. Soil assays & crop recommendations are decision-support tools.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
              <Shield className="w-4 h-4" /> 100% Verified Agmarknet Data
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 AgriVision Inc. Smart Agriculture & Precision Agritech.</p>
          <p className="mt-2 sm:mt-0">Built with React, Vite, TypeScript & FastAPI</p>
        </div>
      </footer>

      {/* Persistent AI AgriGuide Floating Drawer */}
      <AgriGuideDrawer />
    </div>
  );
};
