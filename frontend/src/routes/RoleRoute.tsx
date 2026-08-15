import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-agri-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !role || !allowedRoles.includes(role)) {
    // If not authorized for this specific role, redirect to appropriate home
    if (role === 'CUSTOMER') return <Navigate to="/customer" replace />;
    if (role === 'SHOPKEEPER') return <Navigate to="/shopkeeper" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/farmer" replace />;
  }

  return <>{children}</>;
};
