import api from './api';
import { BuyerRequirement, FarmerBuyerRequirement, CounterRequirementInput, MatchedFarmerItem, RequirementStatus, Offer } from '../types';

export interface CreateRequirementInput {
  title: string;
  crop_name: string;
  variety?: string;
  quantity: number;
  unit: string;
  min_quality_grade: string;
  target_price: number;
  price_unit: string;
  required_date?: string;
  delivery_preference: string;
  location_city: string;
  state: string;
  description?: string;
  expires_at?: string;
}

export const requirementsApi = {
  createRequirement: async (data: CreateRequirementInput) => {
    const response = await api.post<BuyerRequirement>('/buyer/requirements', data);
    return response.data;
  },

  listRequirements: async (params?: { status_filter?: RequirementStatus; crop_name?: string; my_only?: boolean }) => {
    const response = await api.get<BuyerRequirement[]>('/buyer/requirements', { params });
    return response.data;
  },

  getRequirement: async (id: number) => {
    const response = await api.get<BuyerRequirement>(`/buyer/requirements/${id}`);
    return response.data;
  },

  closeRequirement: async (id: number) => {
    const response = await api.post<BuyerRequirement>(`/buyer/requirements/${id}/close`);
    return response.data;
  },

  getMatchingFarmers: async (id: number) => {
    const response = await api.get<MatchedFarmerItem[]>(`/buyer/requirements/${id}/matching-farmers`);
    return response.data;
  },

  getFarmerBuyerRequirements: async (params?: { crop_name?: string }) => {
    const response = await api.get<FarmerBuyerRequirement[]>('/farmer/buyer-requirements', { params });
    return response.data;
  },

  acceptRequirementPrice: async (requirementId: number) => {
    const response = await api.post<Offer>(`/farmer/buyer-requirements/${requirementId}/accept`);
    return response.data;
  },

  counterRequirement: async (requirementId: number, data: CounterRequirementInput) => {
    const response = await api.post<Offer>(`/farmer/buyer-requirements/${requirementId}/counter`, data);
    return response.data;
  }
};

