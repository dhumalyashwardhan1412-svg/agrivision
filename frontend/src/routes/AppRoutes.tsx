import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { FarmerLayout } from '../layouts/FarmerLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { ShopkeeperLayout } from '../layouts/ShopkeeperLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Public Pages
import { AgriVisionIntro } from '../pages/intro/AgriVisionIntro';
import { LandingPage } from '../pages/landing/LandingPage';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { MarketplaceBrowse } from '../pages/customer/MarketplaceBrowse';
import { MarketIntelligence } from '../pages/farmer/MarketIntelligence';
import { CropDoctor } from '../pages/farmer/CropDoctor';

// Farmer Pages
import { FarmerDashboard } from '../pages/farmer/FarmerDashboard';
import { FarmManagement } from '../pages/farmer/FarmManagement';
import { CropRecommendations } from '../pages/farmer/CropRecommendations';
import { FarmingPlanDetail } from '../pages/farmer/FarmingPlanDetail';
import { ProfitCalculator } from '../pages/farmer/ProfitCalculator';
import { EquipmentAndShops } from '../pages/farmer/EquipmentAndShops';
import { FarmerSales } from '../pages/farmer/FarmerSales';
import { FarmReportDownload } from '../pages/farmer/FarmReportDownload';
import { GovernmentSchemes } from '../pages/farmer/GovernmentSchemes';
import { FarmerBuyerOffers } from '../pages/farmer/BuyerOffers';
import { OfflineData } from '../pages/farmer/OfflineData';

// Customer Pages
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';
import { CustomerOrders } from '../pages/customer/CustomerOrders';
import { PostRequirement } from '../pages/customer/PostRequirement';
import { MyRequirements } from '../pages/customer/MyRequirements';
import { CustomerBuyerOffers } from '../pages/customer/BuyerOffers';

// Shopkeeper Pages
import { ShopkeeperDashboard } from '../pages/shopkeeper/ShopkeeperDashboard';
import { ProductInventory } from '../pages/shopkeeper/ProductInventory';
import { EquipmentManager } from '../pages/shopkeeper/EquipmentManager';
import { ShopOrders } from '../pages/shopkeeper/ShopOrders';
import { OffersDiscounts } from '../pages/shopkeeper/OffersDiscounts';
import { DemandInsights } from '../pages/shopkeeper/DemandInsights';
import { LowStockAlerts } from '../pages/shopkeeper/LowStockAlerts';
import { CustomerReviews } from '../pages/shopkeeper/CustomerReviews';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { MarketPriceModeration } from '../pages/admin/MarketPriceModeration';
import { VerificationManager } from '../pages/admin/VerificationManager';
import { SchemeManager } from '../pages/admin/SchemeManager';
import { AuditLogs } from '../pages/admin/AuditLogs';
import { OfflineSyncMonitor } from '../pages/admin/OfflineSyncMonitor';

import { useAuth } from '../context/AuthContext';
import { NotificationsPage } from '../pages/common/NotificationsPage';

const RoleNotificationsRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role?.toLowerCase();
  if (role === 'farmer') return <Navigate to="/farmer/notifications" replace />;
  if (role === 'customer') return <Navigate to="/customer/notifications" replace />;
  if (role === 'shopkeeper') return <Navigate to="/shopkeeper/notifications" replace />;
  if (role === 'admin') return <Navigate to="/admin/notifications" replace />;
  return <Navigate to="/" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Glyph Portal Interactive Start/Intro Page */}
      <Route path="/" element={<AgriVisionIntro />} />

      {/* Public Pages wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<MarketplaceBrowse />} />
        <Route path="/markets" element={<MarketIntelligence />} />
        <Route path="/crop-doctor" element={<CropDoctor />} />
      </Route>

      {/* Farmer Protected Routes */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['FARMER', 'ADMIN']}>
              <FarmerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<FarmerDashboard />} />
        <Route path="farms" element={<FarmManagement />} />
        <Route path="schemes" element={<GovernmentSchemes />} />
        <Route path="offers" element={<FarmerBuyerOffers />} />
        <Route path="offline" element={<OfflineData />} />
        <Route path="recommendations" element={<CropRecommendations />} />
        <Route path="plans" element={<FarmingPlanDetail />} />
        <Route path="profit" element={<ProfitCalculator />} />
        <Route path="market" element={<MarketIntelligence />} />
        <Route path="equipment" element={<EquipmentAndShops />} />
        <Route path="doctor" element={<CropDoctor />} />
        <Route path="sales" element={<FarmerSales />} />
        <Route path="report" element={<FarmReportDownload />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Customer Protected Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <CustomerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="post-requirement" element={<PostRequirement />} />
        <Route path="requirements" element={<MyRequirements />} />
        <Route path="offers" element={<CustomerBuyerOffers />} />
        <Route path="orders" element={<CustomerOrders />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Shopkeeper Protected Routes */}
      <Route
        path="/shopkeeper"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['SHOPKEEPER', 'ADMIN']}>
              <ShopkeeperLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<ShopkeeperDashboard />} />
        <Route path="products" element={<ProductInventory />} />
        <Route path="discounts" element={<OffersDiscounts />} />
        <Route path="demand" element={<DemandInsights />} />
        <Route path="low-stock" element={<LowStockAlerts />} />
        <Route path="reviews" element={<CustomerReviews />} />
        <Route path="equipment" element={<EquipmentManager />} />
        <Route path="orders" element={<ShopOrders />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="verifications" element={<VerificationManager />} />
        <Route path="schemes" element={<SchemeManager />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="offline-sync" element={<OfflineSyncMonitor />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="markets" element={<MarketPriceModeration />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Universal Notifications Redirect */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <RoleNotificationsRedirect />
          </ProtectedRoute>
        }
      />

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
