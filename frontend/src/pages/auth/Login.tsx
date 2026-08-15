import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Sprout, LogIn, Key, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

export const Login: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
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
      await login({ email, password });
      navigate('/farmer');
    } catch (err: any) {
      console.error('Login failure', err);
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      await quickDemoLogin(role);
      if (role === 'FARMER') navigate('/farmer');
      else if (role === 'CUSTOMER') navigate('/customer');
      else if (role === 'SHOPKEEPER') navigate('/shopkeeper');
      else if (role === 'ADMIN') navigate('/admin');
    } catch (err: any) {
      setError('Quick login failed. Ensure the backend server is running.');
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
            Sign In to AgriVision
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Access your agricultural intelligence workspace
          </p>
        </div>

        {/* 1-Click Demo Accounts Card */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between font-bold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" /> 1-Click Instant Demo Login:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('FARMER')}
              className="px-3 py-2 bg-white text-slate-800 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100/50 shadow-2xs transition text-left"
            >
              🌾 Farmer <span className="block text-[10px] text-slate-500 font-normal">Rajesh Kumar</span>
            </button>
            <button
              onClick={() => handleQuickLogin('CUSTOMER')}
              className="px-3 py-2 bg-white text-slate-800 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100/50 shadow-2xs transition text-left"
            >
              🛒 Buyer <span className="block text-[10px] text-slate-500 font-normal">Pooja Sharma</span>
            </button>
            <button
              onClick={() => handleQuickLogin('SHOPKEEPER')}
              className="px-3 py-2 bg-white text-slate-800 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100/50 shadow-2xs transition text-left"
            >
              🏪 Dealer <span className="block text-[10px] text-slate-500 font-normal">Gurpreet Singh</span>
            </button>
            <button
              onClick={() => handleQuickLogin('ADMIN')}
              className="px-3 py-2 bg-white text-slate-800 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100/50 shadow-2xs transition text-left"
            >
              🛡️ Admin <span className="block text-[10px] text-slate-500 font-normal">Dr. Arvind Patel</span>
            </button>
          </div>
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
              label="Email Address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@agrivision.com"
              required
            />

            <Input
              label="Password"
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
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-agri-700 hover:underline">
              Create free account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
