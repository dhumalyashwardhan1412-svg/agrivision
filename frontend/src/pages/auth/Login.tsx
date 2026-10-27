import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuthBackground } from '../../components/auth/AuthBackground';
import { LoginVisualPanel } from '../../components/auth/LoginVisualPanel';
import { LoginForm } from '../../components/auth/LoginForm';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [successRole, setSuccessRole] = useState<string | null>(null);

  const handleRoleRedirect = (role: string) => {
    setSuccessRole(role);
    // Smooth transition into dashboard
    setTimeout(() => {
      const normalizedRole = role?.toUpperCase();
      if (normalizedRole === 'ADMIN') {
        navigate('/admin');
      } else if (normalizedRole === 'CUSTOMER') {
        navigate('/customer');
      } else if (normalizedRole === 'SHOPKEEPER') {
        navigate('/shopkeeper');
      } else {
        navigate('/farmer');
      }
    }, 750);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden select-none bg-[#0a1a0d]">
      {/* Cinematic Farmland Background */}
      <AuthBackground />

      {/* Desktop Floating Glassmorphic Top Pill Navbar */}
      <header className="relative z-20 w-full pt-4 sm:pt-6 px-4 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="hidden sm:inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-xl"
        >
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#163300] to-[#65A30D] flex items-center justify-center">
              <Sprout className="w-3.5 h-3.5 text-[#C7FF00]" />
            </div>
            <span className="text-xs font-black tracking-tight text-white">
              Agri<span className="text-[#C7FF00]">Vision</span>
            </span>
          </Link>
          <span className="text-white/30 text-xs">•</span>
          <span className="text-[11px] font-semibold text-white/85 tracking-wide">
            Smart Farming • Direct Markets • Better Decisions
          </span>
          <span className="text-white/30 text-xs">•</span>
          <Link
            to="/home"
            className="text-[11px] font-bold text-[#C7FF00] hover:underline flex items-center gap-1"
          >
            <span>Explore Platform</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </header>

      {/* Main Centered Authentication Container */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
          {/* Left Visual Frosted Panel (Promotional & Branding) */}
          <LoginVisualPanel />

          {/* Right Organic Login Card (Authentication Form) */}
          <LoginForm onSuccess={handleRoleRedirect} />
        </div>
      </main>

      {/* Bottom Subtle Copyright Bar */}
      <footer className="relative z-20 pb-4 px-4 text-center">
        <p className="text-[11px] font-medium text-white/50 tracking-wider">
          © 2026 AgriVision Inc. · Protected by Enterprise JWT & Role-Based Access Control
        </p>
      </footer>

      {/* Success Full-Screen Portal Transition */}
      <AnimatePresence>
        {successRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center p-8 rounded-3xl bg-[#0f2913]/90 border border-[#2F6B1B]/80 shadow-2xl max-w-sm mx-4 space-y-4 text-white"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#2F6B1B] to-[#C7FF00] p-1 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <div className="w-full h-full rounded-full bg-[#0a1c0e] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#C7FF00]" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white">Welcome to AgriVision</h3>
                <p className="text-xs text-emerald-200/80">
                  Authentication verified. Launching your {successRole} workspace...
                </p>
              </div>
              <div className="w-36 h-1 mx-auto bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                  className="w-full h-full bg-[#C7FF00]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
