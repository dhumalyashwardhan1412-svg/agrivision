import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Sprout, UserPlus, Mail, Key, User, Phone, MapPin, ShoppingBag, Store } from 'lucide-react';

type PublicRegistrationRole = 'FARMER' | 'CUSTOMER' | 'SHOPKEEPER';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState<PublicRegistrationRole>('FARMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [landArea, setLandArea] = useState('');
  const [irrigation, setIrrigation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register({
        email,
        password,
        full_name: fullName,
        phone_number: phone,
        role,
        state: state.trim() || 'Maharashtra',
        district: district.trim() || 'Pune',
        total_land_area: landArea ? parseFloat(landArea) : 1.0,
        irrigation_source: irrigation.trim() || 'Borewell',
      });

      if (role === 'FARMER') navigate('/farmer');
      else if (role === 'CUSTOMER') navigate('/customer');
      else if (role === 'SHOPKEEPER') navigate('/shopkeeper');
    } catch (err: any) {
      console.error('Registration failed', err);
      setError(err.response?.data?.detail || t('auth.registrationFailed', 'Registration failed. Please check details.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-agri-50/40 via-slate-50 to-white">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-agri-700 text-white flex items-center justify-center shadow-md">
              <Sprout className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('auth.registerTitle', 'Create Your AgriVision Account')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('auth.registerSubtitle', 'Select your account type to get started')}
          </p>
        </div>

        {/* Role Selector Cards - 3 Centered/Evenly Balanced Roles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setRole('FARMER')}
            className={`p-4 rounded-2xl border text-center transition-all ${
              role === 'FARMER'
                ? 'bg-agri-700 text-white border-agri-700 shadow-md font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Sprout className="w-6 h-6 mx-auto mb-1.5" />
            <span className="text-sm font-bold block">{t('auth.farmer', 'Farmer')}</span>
            <span className="text-[11px] opacity-75 block mt-0.5">{t('auth.farmerSub', 'Growers & Producers')}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`p-4 rounded-2xl border text-center transition-all ${
              role === 'CUSTOMER'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <ShoppingBag className="w-6 h-6 mx-auto mb-1.5" />
            <span className="text-sm font-bold block">{t('auth.buyer', 'Buyer / Customer')}</span>
            <span className="text-[11px] opacity-75 block mt-0.5">{t('auth.buyerSub', 'Direct Farm Produce')}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('SHOPKEEPER')}
            className={`p-4 rounded-2xl border text-center transition-all ${
              role === 'SHOPKEEPER'
                ? 'bg-sky-600 text-white border-sky-600 shadow-md font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Store className="w-6 h-6 mx-auto mb-1.5" />
            <span className="text-sm font-bold block">{t('auth.dealer', 'Dealer / Rental')}</span>
            <span className="text-[11px] opacity-75 block mt-0.5">{t('auth.dealerSub', 'Inputs & Machinery')}</span>
          </button>
        </div>

        <Card className="p-6 sm:p-8 shadow-lg border-slate-200/90">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('auth.fullName', 'Full Name')}
                icon={User}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Gurpreet Singh"
                required
              />
              <Input
                label={t('auth.phone', 'Phone Number')}
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <Input
              label={t('auth.email', 'Email Address')}
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@agrivision.com"
              required
            />

            <Input
              label={t('auth.createPassword', 'Create Password')}
              type="password"
              icon={Key}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('auth.state', 'State')}
                icon={MapPin}
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                required
              />
              <Input
                label={t('auth.district', 'District')}
                icon={MapPin}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Pune"
                required
              />
            </div>

            {role === 'FARMER' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                <Input
                  label={t('auth.farmLand', 'Total Farm Land (Acres)')}
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  placeholder="e.g. 5.0"
                  required
                />
                <Input
                  label={t('auth.irrigation', 'Primary Irrigation Source')}
                  value={irrigation}
                  onChange={(e) => setIrrigation(e.target.value)}
                  placeholder={t('auth.irrigationPlaceholder', 'e.g. Borewell / Canal / Drip')}
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              icon={UserPlus}
              isLoading={isLoading}
            >
              {t('auth.completeRegistration', 'Complete Registration')} ({role === 'FARMER' ? t('auth.farmer', 'Farmer') : role === 'CUSTOMER' ? t('auth.buyer', 'Buyer') : t('auth.dealer', 'Dealer')})
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
            <Link to="/login" className="font-bold text-agri-700 hover:underline">
              {t('common.signIn', 'Sign In')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
