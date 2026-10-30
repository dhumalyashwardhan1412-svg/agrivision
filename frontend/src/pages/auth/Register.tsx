import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authApi } from '../../services/authApi';
import { Input } from '../../components/ui/Input';
import {
  Sprout,
  UserPlus,
  Mail,
  Key,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Store,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Cpu,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import loginFarmlandBg from '../../assets/login-farmland-bg.jpg';

type PublicRegistrationRole = 'FARMER' | 'CUSTOMER' | 'SHOPKEEPER';
type OTPStatus = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState<PublicRegistrationRole>('FARMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [landArea, setLandArea] = useState('');
  const [irrigation, setIrrigation] = useState('');

  // Phone OTP Verification States
  const [otpStatus, setOtpStatus] = useState<OTPStatus>('idle');
  const [otpRequestId, setOtpRequestId] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [phoneVerificationToken, setPhoneVerificationToken] = useState<string>('');
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [expiresSeconds, setExpiresSeconds] = useState<number>(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Expiration countdown timer
  useEffect(() => {
    if (expiresSeconds <= 0 || otpStatus === 'verified') return;
    const interval = setInterval(() => {
      setExpiresSeconds((prev) => {
        if (prev <= 1) {
          setOtpError(t('auth.otpExpired', 'Verification code expired. Please request a new OTP.'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresSeconds, otpStatus, t]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    handleFieldChange('phone', digitsOnly, setPhone);

    // If phone number changes after OTP sent or verified, invalidate OTP state immediately
    if (otpStatus !== 'idle') {
      setOtpStatus('idle');
      setOtpRequestId('');
      setOtpCode('');
      setPhoneVerificationToken('');
      setOtpError(null);
      setOtpSuccess(null);
      setCooldownSeconds(0);
      setExpiresSeconds(0);
    }
  };

  const handleSendOTP = async () => {
    setOtpError(null);
    setOtpSuccess(null);

    const phoneErr = validateField('phone', phone);
    if (phoneErr) {
      setTouched(prev => ({ ...prev, phone: true }));
      setFieldErrors(prev => ({ ...prev, phone: phoneErr }));
      return;
    }

    setOtpStatus('sending');
    try {
      const res = await authApi.sendOTP(phone.trim());
      setOtpRequestId(res.request_id);
      setCooldownSeconds(res.cooldown_seconds || 60);
      setExpiresSeconds(res.expires_in_seconds || 300);
      setOtpStatus('sent');
      setOtpCode('');
      setOtpSuccess(t('auth.otpSentSuccess', `6-digit OTP sent to +91 ******${phone.trim().slice(-4)}`));
    } catch (err: any) {
      setOtpStatus('idle');
      const msg = err.response?.data?.detail;
      setOtpError(typeof msg === 'string' ? msg : t('auth.otpSendFailed', 'Failed to send OTP. Please try again.'));
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError(null);
    setOtpSuccess(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
      setOtpError(t('auth.invalidOtpFormat', 'Please enter a valid 6-digit numeric OTP code.'));
      return;
    }

    setOtpStatus('verifying');
    try {
      const res = await authApi.verifyOTP(phone.trim(), otpRequestId, cleanOtp);
      setPhoneVerificationToken(res.verification_token);
      setOtpStatus('verified');
      setOtpSuccess(t('auth.otpVerifiedSuccess', 'Mobile number verified successfully!'));
    } catch (err: any) {
      setOtpStatus('sent');
      const msg = err.response?.data?.detail;
      setOtpError(typeof msg === 'string' ? msg : t('auth.otpVerifyFailed', 'Verification failed. Please check the code.'));
    }
  };


  const validateField = (field: string, value: any, currentRole = role): string | null => {
    switch (field) {
      case 'fullName': {
        const v = (value || '').trim();
        if (!v) return t('validation.nameRequired', 'Full name is required');
        if (v.length < 2 || v.length > 100) return t('validation.nameLength', 'Full name must be between 2 and 100 characters');
        if (/\d/.test(v)) return t('validation.nameNoNumbers', 'Full name cannot contain numbers');
        if (!/^[\p{L}\s'-.]+$/u.test(v)) return t('validation.nameInvalidChars', 'Full name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed');
        const letterCount = (v.match(/\p{L}/gu) || []).length;
        if (letterCount < 2) return t('validation.nameMinLetters', 'Full name must contain at least 2 letters');
        return null;
      }
      case 'phone': {
        const v = (value || '').trim();
        if (!v) return t('validation.phoneRequired', 'Phone number is required');
        if (/[^\d]/.test(v)) return t('validation.phoneDigitsOnly', 'Phone number must contain digits only without letters, spaces, or symbols');
        if (!/^[6-9]\d{9}$/.test(v)) return t('validation.phoneInvalidFormat', 'Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9');
        return null;
      }
      case 'email': {
        const v = (value || '').trim();
        if (!v) return t('validation.emailRequired', 'Email address is required');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return t('validation.emailInvalid', 'Please enter a valid email address');
        return null;
      }
      case 'password': {
        if (!value) return t('validation.passwordRequired', 'Password is required');
        if (value.length < 6) return t('validation.passwordMinLength', 'Password must be at least 6 characters long');
        return null;
      }
      case 'confirmPassword': {
        if (!value) return t('validation.confirmPasswordRequired', 'Please confirm your password');
        if (value !== password) return t('validation.passwordMismatch', 'Passwords do not match');
        return null;
      }
      case 'state': {
        const v = (value || '').trim();
        if (!v) return t('validation.stateRequired', 'State is required');
        if (v.length < 2 || v.length > 100) return t('validation.stateLength', 'State must be between 2 and 100 characters');
        if (/\d/.test(v)) return t('validation.stateNoNumbers', 'State cannot contain numbers');
        if (!/^[\p{L}\s'-.]+$/u.test(v)) return t('validation.stateInvalidChars', 'State contains invalid characters. Only letters, spaces, and hyphens are allowed');
        const letterCount = (v.match(/\p{L}/gu) || []).length;
        if (letterCount < 2) return t('validation.stateMinLetters', 'State must contain at least 2 letters');
        return null;
      }
      case 'district': {
        const v = (value || '').trim();
        if (!v) return t('validation.districtRequired', 'District is required');
        if (v.length < 2 || v.length > 100) return t('validation.districtLength', 'District must be between 2 and 100 characters');
        if (/\d/.test(v)) return t('validation.districtNoNumbers', 'District cannot contain numbers');
        if (!/^[\p{L}\s'-.]+$/u.test(v)) return t('validation.districtInvalidChars', 'District contains invalid characters. Only letters, spaces, and hyphens are allowed');
        const letterCount = (v.match(/\p{L}/gu) || []).length;
        if (letterCount < 2) return t('validation.districtMinLetters', 'District must contain at least 2 letters');
        return null;
      }
      case 'landArea': {
        if (currentRole === 'FARMER') {
          const v = (value || '').toString().trim();
          if (!v) return t('validation.landRequired', 'Total farm land area is required for farmers');
          const parsed = parseFloat(v);
          if (isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
            return t('validation.landInvalid', 'Total farm land area must be a valid positive number greater than 0');
          }
          if (parsed > 10000) return t('validation.landMax', 'Total farm land area cannot exceed 10,000 acres');
        }
        return null;
      }
      case 'irrigation': {
        if (currentRole === 'FARMER' && value) {
          const v = value.trim();
          if (v.length > 0) {
            if (v.length < 2 || v.length > 100) return t('validation.irrigationLength', 'Primary irrigation source must be between 2 and 100 characters');
            if (!/[\p{L}]/u.test(v)) return t('validation.irrigationMustHaveLetters', 'Primary irrigation source must contain valid alphabetic text');
            if (/[<>{};$]/.test(v)) return t('validation.irrigationInvalidChars', 'Primary irrigation source contains invalid characters');
          }
        }
        return null;
      }
      default:
        return null;
    }
  };

  const handleBlur = (field: string, value: any) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: err || '' }));
  };

  const handleFieldChange = (field: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (touched[field]) {
      const err = validateField(field, value);
      setFieldErrors(prev => ({ ...prev, [field]: err || '' }));
    }
  };

  const handleRoleChange = (newRole: PublicRegistrationRole) => {
    setRole(newRole);
    if (newRole !== 'FARMER') {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.landArea;
        delete next.irrigation;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const fieldsToValidate = ['fullName', 'phone', 'email', 'password', 'confirmPassword', 'state', 'district'];
    if (role === 'FARMER') {
      fieldsToValidate.push('landArea');
      if (irrigation) fieldsToValidate.push('irrigation');
    }

    const currentValues: Record<string, any> = {
      fullName,
      phone,
      email,
      password,
      confirmPassword,
      state,
      district,
      landArea,
      irrigation,
    };

    const newErrors: Record<string, string> = {};
    const allTouched: Record<string, boolean> = {};

    fieldsToValidate.forEach((f) => {
      allTouched[f] = true;
      const err = validateField(f, currentValues[f], role);
      if (err) newErrors[f] = err;
    });

    setTouched(prev => ({ ...prev, ...allTouched }));
    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setError(t('auth.fixErrors', 'Please correct the highlighted validation errors before proceeding.'));
      return;
    }

    // Phone OTP Verification temporarily bypassed due to SMS gateway issues
    /*
    if (!phoneVerificationToken || otpStatus !== 'verified') {
      setError(t('auth.verifyPhoneFirst', 'Please verify your phone number with SMS OTP before creating your account.'));
      setTouched(prev => ({ ...prev, phone: true }));
      return;
    }
    */

    setIsLoading(true);

    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
        phone_number: phone.trim(),
        // phone_verification_token: phoneVerificationToken, // Temporarily disabled
        role,
        state: state.trim(),
        district: district.trim(),
        total_land_area: role === 'FARMER' ? parseFloat(landArea) : undefined,
        irrigation_source: role === 'FARMER' && irrigation.trim() ? irrigation.trim() : undefined,
      });

      if (role === 'FARMER') navigate('/farmer');
      else if (role === 'CUSTOMER') navigate('/customer');
      else if (role === 'SHOPKEEPER') navigate('/shopkeeper');
    } catch (err: any) {
      console.error('Registration failed', err);
      if (err.response?.status === 422 && Array.isArray(err.response?.data?.detail)) {
        const backendErrors: Record<string, string> = {};
        err.response.data.detail.forEach((item: any) => {
          const fieldKey = item.loc?.[item.loc.length - 1];
          const mappedKey = fieldKey === 'full_name' ? 'fullName'
            : fieldKey === 'phone_number' ? 'phone'
            : fieldKey === 'total_land_area' ? 'landArea'
            : fieldKey === 'irrigation_source' ? 'irrigation'
            : fieldKey;
          const cleanMsg = (item.msg || '').replace(/^Value error,\s*/i, '');
          if (mappedKey) {
            backendErrors[mappedKey] = cleanMsg;
          }
        });
        setFieldErrors(prev => ({ ...prev, ...backendErrors }));
        setError(t('auth.fixErrors', 'Please correct the highlighted validation errors.'));
      } else {
        const errorDetail = err.response?.data?.detail;
        setError(typeof errorDetail === 'string' ? errorDetail : t('auth.registrationFailed', 'Registration failed. Please check your details.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmitButtonLabel = () => {
    if (isLoading) return t('auth.creatingAccount', 'Creating Account...');
    if (role === 'FARMER') return t('auth.createFarmerAccount', 'Create Farmer Account');
    if (role === 'CUSTOMER') return t('auth.createBuyerAccount', 'Create Buyer Account');
    return t('auth.createDealerAccount', 'Create Dealer Account');
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#F7FAF7] py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[740px]"
      >
        {/* ========================================================= */}
        {/* LEFT COLUMN: BRAND STORYTELLING (~42% desktop width)      */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 relative overflow-hidden flex flex-col justify-between p-8 sm:p-10 lg:p-12 text-white min-h-[460px] lg:min-h-full">
          {/* Background Farmland Landscape Photography */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
            style={{ backgroundImage: `url(${loginFarmlandBg})` }}
          />

          {/* Deep Forest-Green Overlays for Pristine Legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-950/80 to-slate-950/95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.22),transparent_70%)]" />

          {/* Content Layer */}
          <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
            {/* Top Brand Identity */}
            <div className="space-y-4">
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-white/20 group-hover:scale-105 transition-transform">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1">
                    Agri<span className="text-emerald-400">Vision</span>
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-emerald-200/80 block -mt-1">
                    Smart Farming Platform
                  </span>
                </div>
              </Link>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                SMART FARMING & DIRECT MARKET PLATFORM
              </div>
            </div>

            {/* Central Narrative & Core Value Proposition */}
            <div className="space-y-6 my-auto py-4 lg:py-0">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight leading-[1.15] text-white">
                  Grow Smarter.<br />
                  Harvest Better.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                    Earn More.
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed max-w-md pt-1">
                  Your farm deserves smarter decisions. Discover AI-powered farming insights, monitor market prices, and connect directly with buyers through one intelligent agricultural platform.
                </p>
              </div>

              {/* 3 Core Agricultural Feature Highlights */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">AI-Powered Farming</h4>
                    <p className="text-[11px] sm:text-xs text-emerald-200/75">Make smarter cultivation decisions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Live Mandi Insights</h4>
                    <p className="text-[11px] sm:text-xs text-emerald-200/75">Compare market prices before selling.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Direct Marketplace</h4>
                    <p className="text-[11px] sm:text-xs text-emerald-200/75">Connect with buyers and grow your business.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Trust Endorsement */}
            <div className="pt-6 border-t border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                Built for the next generation of Indian agriculture.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: REGISTRATION EXPERIENCE (~58% desktop width) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-[#F9FBFA] p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100">
          <div className="space-y-6">
            {/* Header Intro */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700">
                  JOIN AGRIVISION
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('auth.registerTitle', 'Create your account')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('auth.registerSubtitle', 'Start making smarter farming and business decisions today.')}
              </p>
            </div>

            {/* Account-Type Selection Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                Select Account Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Farmer Option */}
                <button
                  type="button"
                  onClick={() => handleRoleChange('FARMER')}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border text-left sm:text-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600/30 ${
                    role === 'FARMER'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-600/15'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                  }`}
                >
                  {role === 'FARMER' && (
                    <div className="absolute top-2.5 right-2.5 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
                    </div>
                  )}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center sm:mx-auto mb-2 transition-colors ${
                    role === 'FARMER' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    <Sprout className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-bold block ${role === 'FARMER' ? 'text-emerald-950 font-extrabold' : 'text-slate-800'}`}>
                    {t('auth.farmer', 'Farmer')}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 font-medium leading-tight">
                    {t('auth.farmerSub', 'Growers & Producers')}
                  </span>
                </button>

                {/* Buyer / Customer Option */}
                <button
                  type="button"
                  onClick={() => handleRoleChange('CUSTOMER')}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border text-left sm:text-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600/30 ${
                    role === 'CUSTOMER'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-600/15'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                  }`}
                >
                  {role === 'CUSTOMER' && (
                    <div className="absolute top-2.5 right-2.5 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
                    </div>
                  )}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center sm:mx-auto mb-2 transition-colors ${
                    role === 'CUSTOMER' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20' : 'bg-teal-50 text-teal-700'
                  }`}>
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-bold block ${role === 'CUSTOMER' ? 'text-emerald-950 font-extrabold' : 'text-slate-800'}`}>
                    {t('auth.buyer', 'Buyer / Customer')}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 font-medium leading-tight">
                    {t('auth.buyerSub', 'Direct Farm Produce')}
                  </span>
                </button>

                {/* Dealer / Rental Option */}
                <button
                  type="button"
                  onClick={() => handleRoleChange('SHOPKEEPER')}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border text-left sm:text-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600/30 ${
                    role === 'SHOPKEEPER'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-600/15'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                  }`}
                >
                  {role === 'SHOPKEEPER' && (
                    <div className="absolute top-2.5 right-2.5 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
                    </div>
                  )}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center sm:mx-auto mb-2 transition-colors ${
                    role === 'SHOPKEEPER' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20' : 'bg-sky-50 text-sky-700'
                  }`}>
                    <Store className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-bold block ${role === 'SHOPKEEPER' ? 'text-emerald-950 font-extrabold' : 'text-slate-800'}`}>
                    {t('auth.dealer', 'Dealer / Rental')}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 font-medium leading-tight">
                    {t('auth.dealerSub', 'Inputs & Machinery')}
                  </span>
                </button>
              </div>
            </div>

            {/* Registration Form with Sectioned Grouping */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5 text-xs sm:text-sm">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* SECTION A: PERSONAL INFORMATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Personal Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    label={t('auth.fullName', 'Full Name')}
                    icon={User}
                    value={fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value, setFullName)}
                    onBlur={() => handleBlur('fullName', fullName)}
                    error={touched.fullName ? fieldErrors.fullName : undefined}
                    placeholder="e.g. Rajesh Kumar"
                    maxLength={100}
                    required
                  />
                  <Input
                    label={t('auth.phone', 'Phone Number')}
                    type="tel"
                    inputMode="numeric"
                    icon={Phone}
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={() => handleBlur('phone', phone)}
                    error={touched.phone ? fieldErrors.phone : undefined}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                  />
                </div>
                <Input
                  label={t('auth.email', 'Email Address')}
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
                  onBlur={() => handleBlur('email', email)}
                  error={touched.email ? fieldErrors.email : undefined}
                  placeholder="user@agrivision.com"
                  required
                />
              </div>

              {/* SECTION B: ACCOUNT SECURITY */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Account Security</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    label={t('auth.createPassword', 'Create Password')}
                    type={showPassword ? 'text' : 'password'}
                    icon={Key}
                    value={password}
                    onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                    onBlur={() => handleBlur('password', password)}
                    error={touched.password ? fieldErrors.password : undefined}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors cursor-pointer"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    placeholder="••••••••"
                    required
                  />
                  <Input
                    label={t('auth.confirmPassword', 'Confirm Password')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    icon={Key}
                    value={confirmPassword}
                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value, setConfirmPassword)}
                    onBlur={() => handleBlur('confirmPassword', confirmPassword)}
                    error={touched.confirmPassword ? fieldErrors.confirmPassword : undefined}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors cursor-pointer"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* SECTION C: LOCATION & FARM DETAILS */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{role === 'FARMER' ? 'Farm & Location Details' : 'Location Details'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    label={t('auth.state', 'State')}
                    icon={MapPin}
                    value={state}
                    onChange={(e) => handleFieldChange('state', e.target.value, setState)}
                    onBlur={() => handleBlur('state', state)}
                    error={touched.state ? fieldErrors.state : undefined}
                    placeholder="e.g. Maharashtra"
                    maxLength={100}
                    required
                  />
                  <Input
                    label={t('auth.district', 'District')}
                    icon={MapPin}
                    value={district}
                    onChange={(e) => handleFieldChange('district', e.target.value, setDistrict)}
                    onBlur={() => handleBlur('district', district)}
                    error={touched.district ? fieldErrors.district : undefined}
                    placeholder="e.g. Pune"
                    maxLength={100}
                    required
                  />
                </div>

                {/* Farmer-Specific Land and Irrigation Inputs */}
                {role === 'FARMER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-emerald-50/60 border border-emerald-100/90 rounded-2xl mt-1">
                    <Input
                      label={t('auth.farmLand', 'Total Farm Land (Acres)')}
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10000"
                      value={landArea}
                      onChange={(e) => handleFieldChange('landArea', e.target.value, setLandArea)}
                      onBlur={() => handleBlur('landArea', landArea)}
                      error={touched.landArea ? fieldErrors.landArea : undefined}
                      placeholder="e.g. 5.0"
                      required
                    />
                    <Input
                      label={t('auth.irrigation', 'Primary Irrigation Source')}
                      value={irrigation}
                      onChange={(e) => handleFieldChange('irrigation', e.target.value, setIrrigation)}
                      onBlur={() => handleBlur('irrigation', irrigation)}
                      error={touched.irrigation ? fieldErrors.irrigation : undefined}
                      placeholder={t('auth.irrigationPlaceholder', 'e.g. Borewell / Canal / Drip')}
                      maxLength={100}
                    />
                  </div>
                )}
              </div>

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 font-bold py-3.5 px-6 rounded-xl text-white bg-[#15803D] hover:bg-[#14532D] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none transition-all duration-200 shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('auth.creatingAccount', 'Creating Account...')}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>{getSubmitButtonLabel()}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Area with Trust Badge and Sign-in Link */}
          <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Secure registration · Your information stays protected</span>
            </div>

            <div className="text-center text-xs text-slate-500">
              {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
              <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
                {t('common.signIn', 'Sign In')}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
