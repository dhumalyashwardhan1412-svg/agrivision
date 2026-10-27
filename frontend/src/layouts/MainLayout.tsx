import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, LogIn, UserPlus, LogOut, LayoutDashboard, ShoppingBag, Bot, Compass, Bell, Shield, User, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LiveMandiTicker } from '../components/dashboard/LiveMandiTicker';
import { AgriGuideDrawer } from '../components/ai/AgriGuideDrawer';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { NotificationBell } from '../components/common/NotificationBell';
import { marketApi } from '../services/marketApi';
import { MarketPrice } from '../types';

export const MainLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { t } = useLanguage();
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
    <div className="min-h-screen flex flex-col bg-[#07130F] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Live Mandi Ticker at Top */}
      <LiveMandiTicker prices={tickerPrices} />

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#07130F]/85 backdrop-blur-xl border-b border-emerald-900/40 shadow-xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/home" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-950/50 group-hover:scale-105 transition-transform border border-emerald-400/30">
              <Sprout className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                Agri<span className="text-emerald-400">Vision</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-bold text-emerald-400/70 block -mt-1">
                {t('common.appTagline', 'Smart Agriculture & Direct Market Platform')}
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              to="/home"
              className={`transition-colors hover:text-emerald-400 ${
                location.pathname === '/home' || location.pathname === '/' ? 'text-emerald-400 font-bold' : 'text-slate-300'
              }`}
            >
              {t('nav.overview', 'Overview')}
            </Link>
            <Link
              to="/marketplace"
              className={`transition-colors hover:text-emerald-400 flex items-center gap-1.5 ${
                location.pathname.startsWith('/marketplace') ? 'text-emerald-400 font-bold' : 'text-slate-300'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>{t('nav.marketplace', 'Marketplace')}</span>
            </Link>
            <Link
              to="/markets"
              className={`transition-colors hover:text-emerald-400 flex items-center gap-1.5 ${
                location.pathname.startsWith('/markets') ? 'text-emerald-400 font-bold' : 'text-slate-300'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{t('nav.mandiPrices', 'APMC Mandis')}</span>
            </Link>
            <Link
              to="/crop-doctor"
              className={`transition-colors hover:text-emerald-400 flex items-center gap-1.5 ${
                location.pathname.startsWith('/crop-doctor') ? 'text-emerald-400 font-bold' : 'text-slate-300'
              }`}
            >
              <Bot className="w-4 h-4 text-teal-400" />
              <span>{t('nav.cropDoctor', 'Crop Doctor AI')}</span>
            </Link>
          </nav>

          {/* User Auth Buttons / Role Switcher & Language Selector */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSelector variant="dark" />

            {user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Link
                  to={getDashboardRoute()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/80 transition shadow-2xs"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{user.role} {t('nav.dashboard', 'Dashboard')}</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/5 transition"
                  title={t('common.signOut', 'Sign Out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                >
                  {t('common.signIn', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 rounded-xl shadow-lg shadow-emerald-950/50 transition transform hover:-translate-y-0.5"
                >
                  {t('common.getStarted', 'Get Started')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 rounded-xl hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden p-4 bg-[#07130F]/95 backdrop-blur-2xl border-b border-emerald-900/50 space-y-3">
            <nav className="flex flex-col gap-2 font-semibold text-sm">
              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200 hover:text-emerald-400"
              >
                {t('nav.overview', 'Overview')}
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200 hover:text-emerald-400 flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>{t('nav.marketplace', 'Marketplace')}</span>
              </Link>
              <Link
                to="/markets"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200 hover:text-emerald-400 flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>{t('nav.mandiPrices', 'APMC Mandis')}</span>
              </Link>
              <Link
                to="/crop-doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200 hover:text-emerald-400 flex items-center gap-2"
              >
                <Bot className="w-4 h-4 text-teal-400" />
                <span>{t('nav.cropDoctor', 'Crop Doctor AI')}</span>
              </Link>
            </nav>

            <div className="pt-3 border-t border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-xs font-semibold text-slate-400">{t('common.language', 'Language')}:</span>
                <LanguageSelector variant="dark" />
              </div>
              {user ? (
                <Link
                  to={getDashboardRoute()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center block py-2.5 bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-sm shadow-md"
                >
                  {t('farmer.activeFarm', 'Go to')} {user.role} {t('nav.dashboard', 'Dashboard')}
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs"
                  >
                    {t('common.signIn', 'Sign In')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-md"
                  >
                    {t('common.register', 'Register')}
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
      <footer className="bg-[#050D0A] text-slate-400 py-14 border-t border-emerald-950/60 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-extrabold text-base">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950">
                <Sprout className="w-4 h-4 text-slate-950" />
              </div>
              <span>Agri<span className="text-emerald-400">Vision</span> Platform</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t(
                'landing.footerDesc',
                'Empowering farmers with hybrid AI recommendations, certified soil analysis, APMC mandi intelligence, and direct marketplace commerce.'
              )}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Grow Smarter. Sell Better. Earn More.
              </span>
            </div>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 text-xs uppercase tracking-wider text-emerald-300">
              {t('landing.footerFarmerTools', 'Platform')}
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/home" className="hover:text-emerald-400 transition">
                  {t('nav.overview', 'Overview')}
                </Link>
              </li>
              <li>
                <Link to="/farmer/recommendations" className="hover:text-emerald-400 transition">
                  {t('nav.cropRecs', 'Crop Recommendations')}
                </Link>
              </li>
              <li>
                <Link to="/farmer/plans" className="hover:text-emerald-400 transition">
                  {t('nav.farmingPlans', 'Farming Plans')}
                </Link>
              </li>
              <li>
                <Link to="/farmer/profit" className="hover:text-emerald-400 transition">
                  {t('nav.profitCalc', 'Profitability Calculator')}
                </Link>
              </li>
              <li>
                <Link to="/crop-doctor" className="hover:text-emerald-400 transition">
                  {t('nav.cropDoctor', 'Crop Doctor AI')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 text-xs uppercase tracking-wider text-emerald-300">
              {t('landing.footerMarketCommerce', 'Marketplace')}
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition">
                  {t('nav.marketplace', 'Direct Farm Marketplace')}
                </Link>
              </li>
              <li>
                <Link to="/markets" className="hover:text-emerald-400 transition">
                  {t('nav.mandiPrices', 'APMC Mandis')}
                </Link>
              </li>
              <li>
                <Link to="/farmer/equipment" className="hover:text-emerald-400 transition">
                  {t('nav.machineryHub', 'Machinery Hub')}
                </Link>
              </li>
              <li>
                <Link to="/farmer/report" className="hover:text-emerald-400 transition">
                  {t('nav.smartReport', 'Smart Farm PDF Reports')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-3 text-xs uppercase tracking-wider text-emerald-300">
              {t('landing.footerAdvisory', 'Advisory & Resources')}
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t(
                'landing.footerAdvisoryDesc',
                'AgriVision incorporates agro-climatic norms from ICAR & PAU agronomic standards. Soil assays & crop recommendations are decision-support tools.'
              )}
            </p>
            <div className="mt-3.5 inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{t('landing.verifiedData', '100% Verified Agmarknet Data')}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-emerald-950/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>{t('landing.copyright', '© 2026 AgriVision Inc. Smart Agriculture & Precision Agritech.')}</p>
          <p className="mt-2 sm:mt-0 text-slate-400">{t('landing.techStack', 'Built with React, Vite, TypeScript & FastAPI')}</p>
        </div>
      </footer>

      {/* Persistent AI AgriGuide Floating Drawer */}
      <AgriGuideDrawer />
    </div>
  );
};
