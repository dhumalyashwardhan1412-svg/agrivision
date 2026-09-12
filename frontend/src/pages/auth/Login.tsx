import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Sprout, LogIn, Key, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login({ email, password });
      const userRole = res?.role || localStorage.getItem('agrivision_role');
      if (userRole === 'ADMIN') navigate('/admin');
      else if (userRole === 'CUSTOMER') navigate('/customer');
      else if (userRole === 'SHOPKEEPER') navigate('/shopkeeper');
      else navigate('/farmer');
    } catch (err: any) {
      console.error('Login failure', err);
      setError(err.response?.data?.detail || t('auth.invalidCredentials', 'Invalid email or password. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-agri-50/40 via-slate-50 to-white">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-agri-700 text-white flex items-center justify-center shadow-md">
              <Sprout className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('auth.loginTitle', 'Sign In to AgriVision')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('auth.loginSubtitle', 'Access your agricultural intelligence workspace')}
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8 shadow-lg border-slate-200/90">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

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
              label={t('auth.password', 'Password')}
              type="password"
              icon={Key}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              icon={LogIn}
              isLoading={isLoading}
            >
              {t('auth.signInButton', 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
            <Link to="/register" className="font-bold text-agri-700 hover:underline">
              {t('auth.createFreeAccount', 'Create free account')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
