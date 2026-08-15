import api from './api';
import { MarketPrice, MarketTrend, MarketComparisonResponse, Equipment, EquipmentRental, Shop, ShopProduct } from '../types';

export const marketApi = {
  getPrices: async (params?: { commodity?: string; state?: string; district?: string; data_type?: string }): Promise<MarketPrice[]> => {
    const res = await api.get<MarketPrice[]>('/markets/prices', { params });
    return res.data;
  },

  getTrends: async (commodity: string): Promise<MarketTrend> => {
    const res = await api.get<MarketTrend>(`/markets/trends/${commodity}`);
    return res.data;
  },

  compareMarkets: async (commodity: string, state?: string): Promise<MarketComparisonResponse> => {
    const res = await api.post<MarketComparisonResponse>('/markets/compare', { commodity, state });
    return res.data;
  },

  // Equipment & Shops
  getEquipment: async (category?: string): Promise<Equipment[]> => {
    const res = await api.get<Equipment[]>('/equipment', { params: { category } });
    return res.data;
  },

  rentEquipment: async (data: { equipment_id: number; shop_id?: number; start_date: string; end_date: string; notes?: string }): Promise<EquipmentRental> => {
    const res = await api.post<EquipmentRental>('/equipment/rent', data);
    return res.data;
  },

  getMyRentals: async (): Promise<EquipmentRental[]> => {
    const res = await api.get<EquipmentRental[]>('/equipment/my-rentals');
    return res.data;
  },

  getShops: async (params?: { user_lat?: number; user_lng?: number; shop_type?: string; district?: string }): Promise<Shop[]> => {
    const res = await api.get<Shop[]>('/shops', { params });
    return res.data;
  },

  createShop: async (data: Partial<Shop>): Promise<Shop> => {
    const res = await api.post<Shop>('/shops', data);
    return res.data;
  },

  getShopProducts: async (shopId: number): Promise<ShopProduct[]> => {
    const res = await api.get<ShopProduct[]>(`/shops/${shopId}/products`);
    return res.data;
  },

  addProductToShop: async (shopId: number, data: Partial<ShopProduct>): Promise<ShopProduct> => {
    const res = await api.post<ShopProduct>(`/shops/${shopId}/products`, data);
    return res.data;
  }
};
