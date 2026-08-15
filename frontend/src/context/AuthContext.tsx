import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('agrivision_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('agrivision_token'));
  const [role, setRole] = useState<UserRole | null>(() => {
    const cached = localStorage.getItem('agrivision_role');
    return cached ? (cached as UserRole) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const storedToken = localStorage.getItem('agrivision_token');
    if (!storedToken) {
      setUser(null);
      setRole(null);
      setIsLoading(false);
      return;
    }
    try {
      const userData = await authApi.getMe();
      setUser(userData);
      setRole(userData.role);
      localStorage.setItem('agrivision_user', JSON.stringify(userData));
      localStorage.setItem('agrivision_role', userData.role);
    } catch (err) {
      console.error('Failed to load user profile', err);
      localStorage.removeItem('agrivision_token');
      localStorage.removeItem('agrivision_user');
      localStorage.removeItem('agrivision_role');
      setUser(null);
      setToken(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(payload);
      localStorage.setItem('agrivision_token', res.access_token);
      localStorage.setItem('agrivision_role', res.role);
      setToken(res.access_token);
      setRole(res.role);
      await fetchCurrentUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      localStorage.setItem('agrivision_token', res.access_token);
      localStorage.setItem('agrivision_role', res.role);
      setToken(res.access_token);
      setRole(res.role);
      await fetchCurrentUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('agrivision_token');
    localStorage.removeItem('agrivision_user');
    localStorage.removeItem('agrivision_role');
    setUser(null);
    setToken(null);
    setRole(null);
  };

  const quickDemoLogin = async (demoRole: UserRole) => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      FARMER: { email: 'farmer@agrivision.com', pass: 'Farmer@123' },
      CUSTOMER: { email: 'customer@agrivision.com', pass: 'Customer@123' },
      SHOPKEEPER: { email: 'shopkeeper@agrivision.com', pass: 'Shop@123' },
      ADMIN: { email: 'admin@agrivision.com', pass: 'Admin@123' },
    };
    const { email, pass } = creds[demoRole];
    await login({ email, password: pass });
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
