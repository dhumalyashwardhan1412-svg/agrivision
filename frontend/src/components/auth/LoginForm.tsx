import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface LoginFormProps {
  onSuccess: (role: string) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    if (!googleClientId) return;

    const loadGsiScript = () => {
      if (document.getElementById('google-gsi-client')) return;
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });
        }
      };
      document.body.appendChild(script);
    };

    loadGsiScript();
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      setError('Google Sign-In was cancelled or failed to provide credentials.');
      setIsGoogleLoading(false);
      return;
    }

    setIsGoogleLoading(true);
    setError(null);

    try {
      const res = await loginWithGoogle(response.credential);
      const detectedRole = res?.role || localStorage.getItem('agrivision_role') || 'CUSTOMER';
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(detectedRole);
      }, 700);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(
        err.response?.data?.detail ||
          'Google authentication failed. Please try again or sign in with your password.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (isLoading || isSuccess || isGoogleLoading) return;

    if (!googleClientId) {
      // Credentials not configured: show clear configuration dialog
      setShowGoogleModal(true);
      return;
    }

    // Trigger Google prompt if script loaded
    if (window.google?.accounts?.id) {
      setIsGoogleLoading(true);
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleLoading(false);
        }
      });
    } else {
      setShowGoogleModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess || isGoogleLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await login({ email, password });
      const detectedRole = res?.role || localStorage.getItem('agrivision_role') || 'FARMER';
      setIsSuccess(true);
      // Wait for success animation before navigating
      setTimeout(() => {
        onSuccess(detectedRole);
      }, 750);
    } catch (err: any) {
      console.error('Login failure:', err);
      setError(
        err.response?.data?.detail ||
          t('auth.invalidCredentials', 'Incorrect email or password. Please try again.')
      );
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 35, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full lg:w-[52%] bg-white/95 backdrop-blur-xl rounded-[28px] sm:rounded-[36px] p-7 sm:p-9 lg:p-11 shadow-2xl border border-white/80 flex flex-col justify-center"
    >
      {/* Decorative Organic Corner Leaf Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-lime-200/40 via-emerald-100/20 to-transparent rounded-tr-[28px] sm:rounded-tr-[36px] rounded-bl-[60px] pointer-events-none" />

      {/* Header Section */}
      <div className="text-center sm:text-left space-y-1.5 mb-6">
        <div className="flex items-center justify-center sm:justify-start gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#163300] via-[#2F6B1B] to-[#65A30D] text-white flex items-center justify-center shadow-md shadow-emerald-900/15">
            <Sprout className="w-6 h-6 text-[#C7FF00]" />
          </div>
          <span className="text-xs font-extrabold tracking-wider uppercase text-[#2F6B1B]">
            AgriVision Portal
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#152012] tracking-tight pt-1">
          {t('auth.welcomeBack', 'Welcome Back')}
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7566] leading-relaxed">
          {t('auth.welcomeSubtitle', 'Access your AgriVision account and continue growing smarter.')}
        </p>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs font-semibold text-rose-800 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-700 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-4.5">
        {/* Email Address with Minimalist Bottom-Border */}
        <div className="space-y-1.5 group">
          <label
            htmlFor="agri-email"
            className="flex items-center gap-1.5 text-xs font-bold text-[#152012] tracking-wide"
          >
            <Mail className="w-3.5 h-3.5 text-[#2F6B1B]" />
            {t('auth.email', 'Email Address')}
          </label>
          <div className="relative">
            <input
              id="agri-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={isLoading || isSuccess || isGoogleLoading}
              className="w-full bg-transparent px-1 py-2.5 text-sm text-[#152012] font-medium placeholder-slate-400 border-b-2 border-slate-200 focus:border-[#166534] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Password with Minimalist Bottom-Border & Eye Toggle */}
        <div className="space-y-1.5 group">
          <label
            htmlFor="agri-password"
            className="flex items-center gap-1.5 text-xs font-bold text-[#152012] tracking-wide"
          >
            <Lock className="w-3.5 h-3.5 text-[#2F6B1B]" />
            {t('auth.password', 'Password')}
          </label>
          <div className="relative flex items-center">
            <input
              id="agri-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={isLoading || isSuccess || isGoogleLoading}
              className="w-full bg-transparent px-1 py-2.5 pr-10 text-sm text-[#152012] font-medium placeholder-slate-400 border-b-2 border-slate-200 focus:border-[#166534] focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-1 text-slate-400 hover:text-[#166534] p-1.5 rounded-lg transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Functional Forgot Password Row */}
        <div className="flex items-center justify-between pt-1 text-xs font-medium">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#6B7566] hover:text-[#152012] transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-md text-[#166534] border-slate-300 focus:ring-[#166534] cursor-pointer"
            />
            <span>{t('auth.rememberMe', 'Remember me')}</span>
          </label>

          {/* Yellow Feature A: Functional Link to Forgot Password Flow */}
          <Link
            to="/forgot-password"
            className="font-bold text-[#166534] hover:text-[#14532D] hover:underline transition-colors"
          >
            {t('auth.forgotPassword', 'Forgot Password?')}
          </Link>
        </div>

        {/* Blue Feature: Redesigned Professional SaaS Login Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || isSuccess || isGoogleLoading}
            className={`w-full group h-[52px] rounded-xl px-5 text-white font-bold text-sm sm:text-base flex items-center justify-between shadow-md shadow-emerald-950/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#166534] focus:ring-offset-2 ${
              isSuccess
                ? 'bg-emerald-600 shadow-emerald-600/30 cursor-default'
                : 'bg-[#166534] hover:bg-[#14532D] hover:shadow-lg active:scale-[0.99]'
            } disabled:opacity-75 disabled:cursor-not-allowed`}
          >
            {/* Left Status Label */}
            <span className="flex items-center gap-2.5">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Signing in...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>✓ Sign In Successful</span>
                </>
              ) : (
                <span>Sign In to AgriVision</span>
              )}
            </span>

            {/* Right Subtle Arrow Icon */}
            <ArrowRight
              className={`w-4 h-4 transition-transform duration-200 ${
                isSuccess
                  ? 'text-emerald-200'
                  : 'text-white/90 group-hover:translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </form>

      {/* Account Links & Divider */}
      <div className="mt-5 space-y-3.5">
        <div className="text-center text-xs text-[#6B7566]">
          {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
          <Link
            to="/register"
            className="font-bold text-[#166534] hover:text-[#14532D] hover:underline ml-1"
          >
            {t('auth.createAccount', 'Create Account')}
          </Link>
        </div>

        {/* Subtle Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            or
          </span>
        </div>

        {/* Yellow Feature B: Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isLoading || isSuccess || isGoogleLoading}
          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/90 text-xs font-bold text-slate-700 flex items-center justify-center gap-3 transition-colors hover:shadow-xs active:bg-slate-200/60 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              {/* Google Icon SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>
      </div>

      {/* Google OAuth Configuration & Guidance Modal (When Credentials Not Set in Env) */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 relative space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Google OAuth Setup Required</h3>
                </div>
                <button
                  onClick={() => setShowGoogleModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Google Single Sign-On requires configuring OAuth 2.0 Client credentials in your environment.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 font-mono">
                <div>
                  <span className="font-semibold text-slate-900">Frontend (.env):</span>
                  <div className="text-[11px] text-emerald-800 bg-white p-1.5 rounded mt-0.5 border border-slate-200 select-all">
                    VITE_GOOGLE_CLIENT_ID=&lt;your-client-id&gt;.apps.googleusercontent.com
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Backend (.env):</span>
                  <div className="text-[11px] text-emerald-800 bg-white p-1.5 rounded mt-0.5 border border-slate-200 select-all">
                    GOOGLE_CLIENT_ID=&lt;your-client-id&gt;.apps.googleusercontent.com
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-normal">
                Once configured, Google Sign-In will securely verify user identity through Google Identity Services without passwords.
              </div>

              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="w-full py-2.5 bg-[#166534] text-white font-bold rounded-xl text-xs hover:bg-[#14532D] transition-colors"
              >
                Close & Return to Sign In
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
