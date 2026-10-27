import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { AuthBackground } from '../../components/auth/AuthBackground';
import { authApi } from '../../services/authApi';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');

  // Mode: if token is present, show password reset form; otherwise request email form
  const isResetMode = Boolean(tokenParam && tokenParam.trim().length > 0);

  // Request Reset Link state
  const [email, setEmail] = useState('');
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState<string | null>(null);

  // Set New Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(trimmed);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setRequestError('Please enter your registered email address.');
      return;
    }

    if (!validateEmail(trimmed)) {
      setRequestError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setIsRequestLoading(true);

    try {
      const res = await authApi.forgotPassword(trimmed);
      setRequestSubmitted(true);
      setRequestMessage(
        res.message ||
          'If an account with this email exists, password reset instructions have been sent.'
      );
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setRequestError(
        err.response?.data?.detail ||
          'Unable to process password reset request right now. Please try again later.'
      );
    } finally {
      setIsRequestLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!tokenParam) {
      setResetError('Reset token is missing from the URL. Please request a new link.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please verify and retype.');
      return;
    }

    setIsResetLoading(true);

    try {
      await authApi.resetPassword({
        token: tokenParam.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setResetSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      console.error('Password reset completion error:', err);
      setResetError(
        err.response?.data?.detail ||
          'Failed to reset password. The token may be expired or already used.'
      );
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden select-none bg-[#0a1a0d]">
      {/* Farmland Background */}
      <AuthBackground />

      {/* Top Floating Glassmorphic Pill Header */}
      <header className="relative z-20 w-full pt-4 sm:pt-6 px-4 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-xl"
        >
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#163300] to-[#65A30D] flex items-center justify-center">
              <Sprout className="w-3.5 h-3.5 text-[#C7FF00]" />
            </div>
            <span className="text-xs font-black tracking-tight text-white">
              Agri<span className="text-[#C7FF00]">Vision</span>
            </span>
          </Link>
          <span className="text-white/30 text-xs">•</span>
          <span className="text-[11px] font-semibold text-white/85 tracking-wide">
            Account Recovery & Security
          </span>
        </motion.div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[28px] sm:rounded-[36px] p-7 sm:p-10 shadow-2xl border border-white/80"
        >
          {/* Subtle Organic Corner Leaf Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-lime-200/40 via-emerald-100/20 to-transparent rounded-tr-[28px] sm:rounded-tr-[36px] rounded-bl-[60px] pointer-events-none" />

          {/* Header Icon & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#163300] via-[#2F6B1B] to-[#65A30D] text-white shadow-lg shadow-emerald-950/20 mb-1">
              {isResetMode ? (
                <ShieldCheck className="w-6 h-6 text-[#C7FF00]" />
              ) : (
                <KeyRound className="w-6 h-6 text-[#C7FF00]" />
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152012] tracking-tight">
              {isResetMode ? 'Set New Password' : 'Password Recovery'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7566] max-w-sm mx-auto leading-relaxed">
              {isResetMode
                ? 'Create a secure new password for your AgriVision account.'
                : 'Enter your registered email address to receive secure password recovery instructions.'}
            </p>
          </div>

          {/* Mode 1: Reset Password with Token */}
          {isResetMode ? (
            <div>
              {resetSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-900">Password Reset Successful</h3>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Your password has been successfully updated. Redirecting you to the sign in
                    screen...
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#166534] hover:underline pt-2"
                  >
                    <span>Click here if not redirected automatically</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {/* Error Banner */}
                  <AnimatePresence>
                    {resetError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-rose-800"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1">{resetError}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="new-password"
                      className="flex items-center gap-1.5 text-xs font-bold text-[#152012]"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#2F6B1B]" />
                      <span>New Password</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        disabled={isResetLoading}
                        className="w-full bg-slate-50/70 px-3.5 py-3 pr-10 text-sm text-[#152012] font-medium placeholder-slate-400 border border-slate-200 rounded-xl focus:border-[#2F6B1B] focus:bg-white focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 text-slate-400 hover:text-[#2F6B1B] p-1.5"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirm-password"
                      className="flex items-center gap-1.5 text-xs font-bold text-[#152012]"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#2F6B1B]" />
                      <span>Confirm New Password</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Retype your new password"
                        required
                        disabled={isResetLoading}
                        className="w-full bg-slate-50/70 px-3.5 py-3 pr-10 text-sm text-[#152012] font-medium placeholder-slate-400 border border-slate-200 rounded-xl focus:border-[#2F6B1B] focus:bg-white focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 text-slate-400 hover:text-[#2F6B1B] p-1.5"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isResetLoading}
                      className="w-full h-[52px] rounded-xl bg-[#166534] hover:bg-[#14532D] active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-950/15 transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#166534] focus:ring-offset-2"
                    >
                      {isResetLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <span>Update Password</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Mode 2: Request Reset Email */
            <div>
              {requestSubmitted ? (
                <div className="space-y-5 text-center">
                  <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-[#166534]">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-emerald-900">Request Received</h3>
                    <p className="text-xs text-emerald-800 leading-relaxed">{requestMessage}</p>
                    <p className="text-[11px] text-emerald-600">
                      For security, reset links expire after 15 minutes.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRequestSubmitted(false);
                        setEmail('');
                      }}
                      className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                    >
                      Try another email address
                    </button>

                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#166534] hover:bg-[#14532D] text-xs font-bold text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Return to Sign In</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  {/* Error Banner */}
                  <AnimatePresence>
                    {requestError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-rose-800"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1">{requestError}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="recovery-email"
                      className="flex items-center gap-1.5 text-xs font-bold text-[#152012]"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#2F6B1B]" />
                      <span>Registered Email Address</span>
                    </label>
                    <input
                      id="recovery-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. farmer@agrivision.com"
                      required
                      autoComplete="email"
                      disabled={isRequestLoading}
                      className="w-full bg-slate-50/70 px-3.5 py-3 text-sm text-[#152012] font-medium placeholder-slate-400 border border-slate-200 rounded-xl focus:border-[#2F6B1B] focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isRequestLoading}
                      className="w-full h-[52px] rounded-xl bg-[#166534] hover:bg-[#14532D] active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-950/15 transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#166534] focus:ring-offset-2"
                    >
                      {isRequestLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Instructions...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Reset Link</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Bottom Navigation */}
          {!requestSubmitted && !resetSuccess && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                to="/login"
                className="font-bold text-[#2F6B1B] hover:text-[#163300] hover:underline flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>

              <Link
                to="/register"
                className="font-semibold text-slate-500 hover:text-slate-800 hover:underline"
              >
                Create Account
              </Link>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 pb-4 px-4 text-center">
        <p className="text-[11px] font-medium text-white/50 tracking-wider">
          © 2026 AgriVision Inc. · Protected by End-to-End Cryptographic Security
        </p>
      </footer>
    </div>
  );
};

export default ForgotPassword;
