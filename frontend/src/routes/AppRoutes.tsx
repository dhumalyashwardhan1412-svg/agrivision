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
import { LandingPage } from '../pages/landing/LandingPage';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { MarketplaceBrowse } from '../pages/customer/MarketplaceBrowse';
import { MarketIntelligence } from '../pages/farmer/MarketIntelligence';
import { CropDoctor } from '../pages/farmer/CropDoctor';
import { AgriVision3DExperience } from '../components/farm3d/AgriVision3DExperience';

// Farmer Pages
import { FarmerDashboard } from '../pages/farmer/FarmerDashboard';
import { FarmManagement } from '../pages/farmer/FarmManagement';
import { SoilTesting } from '../pages/farmer/SoilTesting';
import { CropRecommendations } from '../pages/farmer/CropRecommendations';
import { FarmingPlanDetail } from '../pages/farmer/FarmingPlanDetail';
import { ProfitCalculator } from '../pages/farmer/ProfitCalculator';
import { EquipmentAndShops } from '../pages/farmer/EquipmentAndShops';
import { FarmerSales } from '../pages/farmer/FarmerSales';
import { FarmReportDownload } from '../pages/farmer/FarmReportDownload';

// Customer Pages
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';
import { CustomerOrders } from '../pages/customer/CustomerOrders';

// Shopkeeper Pages
import { ShopkeeperDashboard } from '../pages/shopkeeper/ShopkeeperDashboard';
import { ProductInventory } from '../pages/shopkeeper/ProductInventory';
import { EquipmentManager } from '../pages/shopkeeper/EquipmentManager';
import { ShopOrders } from '../pages/shopkeeper/ShopOrders';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { MarketPriceModeration } from '../pages/admin/MarketPriceModeration';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 3D Smart Farm Digital Twin Experience (Fullscreen) */}
      <Route path="/3d" element={<AgriVision3DExperience />} />

      {/* Public Pages wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
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
        <Route path="soil" element={<SoilTesting />} />
        <Route path="recommendations" element={<CropRecommendations />} />
        <Route path="plans" element={<FarmingPlanDetail />} />
        <Route path="profit" element={<ProfitCalculator />} />
        <Route path="market" element={<MarketIntelligence />} />
        <Route path="equipment" element={<EquipmentAndShops />} />
        <Route path="doctor" element={<CropDoctor />} />
        <Route path="sales" element={<FarmerSales />} />
        <Route path="report" element={<FarmReportDownload />} />
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
        <Route path="orders" element={<CustomerOrders />} />
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
        <Route path="equipment" element={<EquipmentManager />} />
        <Route path="orders" element={<ShopOrders />} />
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
        <Route path="users" element={<UserManagement />} />
        <Route path="markets" element={<MarketPriceModeration />} />
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
