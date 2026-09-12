import api from './api';
import {
  DealerDiscount,
  LowStockProduct,
  DemandInsightsResponse,
  DiscountType
} from '../types';

export interface DealerProduct {
  id: number;
  shop_id: number;
  name: string;
  category: string;
  brand?: string;
  price: number;
  unit: string;
  stock_quantity: number;
  stock: number;
  low_stock_threshold: number;
  is_organic: boolean;
  is_in_stock: boolean;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface CreateDealerProductInput {
  name: string;
  category: string;
  brand?: string;
  price: number;
  unit: string;
  stock_quantity: number;
  low_stock_threshold?: number;
  is_organic?: boolean;
  description?: string;
  image_url?: string;
}

export interface CreateDiscountInput {
  product_id: number;
  title: string;
  discount_type: DiscountType;
  discount_value: number;
  min_quantity: number;
  max_discount_inr?: number;
  max_discount_cap?: number;
  start_date: string;
  end_date: string;
  description?: string;
  is_active?: boolean;
}

export const dealerV3Api = {
  getProducts: async () => {
    const response = await api.get<DealerProduct[]>('/dealer/products');
    return response.data;
  },

  createProduct: async (data: CreateDealerProductInput) => {
    const response = await api.post<DealerProduct>('/dealer/products', data);
    return response.data;
  },

  getDiscounts: async () => {
    const response = await api.get<DealerDiscount[]>('/dealer/discounts');
    return response.data;
  },

  createDiscount: async (data: CreateDiscountInput) => {
    const response = await api.post<DealerDiscount>('/dealer/discounts', data);
    return response.data;
  },

  toggleDiscount: async (id: number) => {
    const response = await api.put<DealerDiscount>(`/dealer/discounts/${id}/toggle`);
    return response.data;
  },

  deleteDiscount: async (id: number) => {
    const response = await api.delete(`/dealer/discounts/${id}`);
    return response.data;
  },

  getLowStockProducts: async () => {
    const response = await api.get<LowStockProduct[]>('/dealer/low-stock');
    return response.data;
  },

  updateStockThreshold: async (productId: number, low_stock_threshold: number) => {
    const response = await api.put(`/dealer/products/${productId}/threshold`, { low_stock_threshold });
    return response.data;
  },

  updateStockQuantity: async (productId: number, stock_quantity: number) => {
    const response = await api.put(`/dealer/products/${productId}/stock`, { stock_quantity });
    return response.data;
  },

  getDemandInsights: async () => {
    const response = await api.get<DemandInsightsResponse>('/dealer/demand-insights');
    return response.data;
  }
};
