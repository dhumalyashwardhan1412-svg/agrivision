import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Sprout, UserPlus, Mail, Key, User, Phone, MapPin, ShoppingBag, Store, Shield } from 'lucide-react';
import { UserRole } from '../../types';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('FARMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('Ludhiana');
  const [landArea, setLandArea] = useState('3.0');
  const [irrigation, setIrrigation] = useState('Borewell & Drip');
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
        state,
        district,
        total_land_area: parseFloat(landArea) || 2.5,
        irrigation_source: irrigation,
      });

      if (role === 'FARMER') navigate('/farmer');
      else if (role === 'CUSTOMER') navigate('/customer');
      else if (role === 'SHOPKEEPER') navigate('/shopkeeper');
      else if (role === 'ADMIN') navigate('/admin');
    } catch (err: any) {
      console.error('Registration failed', err);
      setError(err.response?.data?.detail || 'Registration failed. Please check details.');
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
            Create Your AgriVision Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Select your account type to get started
          </p>
        </div>

        {/* Role Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setRole('FARMER')}
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              role === 'FARMER'
                ? 'bg-agri-700 text-white border-agri-700 shadow-md font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Sprout className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs block">Farmer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              role === 'CUSTOMER'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <ShoppingBag className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs block">Buyer / Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('SHOPKEEPER')}
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              role === 'SHOPKEEPER'
                ? 'bg-sky-600 text-white border-sky-600 shadow-md font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Store className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs block">Dealer / Rental</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('ADMIN')}
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              role === 'ADMIN'
                ? 'bg-purple-600 text-white border-purple-600 shadow-md font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Shield className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs block">Admin</span>
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
                label="Full Name"
                icon={User}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Gurpreet Singh"
                required
              />
              <Input
                label="Phone Number"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@agrivision.com"
              required
            />

            <Input
              label="Create Password"
              type="password"
              icon={Key}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="State"
                icon={MapPin}
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              <Input
                label="District"
                icon={MapPin}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </div>

            {role === 'FARMER' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                <Input
                  label="Total Farm Land (Acres)"
                  type="number"
                  step="0.5"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  required
                />
                <Input
                  label="Primary Irrigation Source"
                  value={irrigation}
                  onChange={(e) => setIrrigation(e.target.value)}
                  placeholder="e.g. Borewell / Canal"
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
              Complete Registration ({role})
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-agri-700 hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
