import api from './api';
import { GovernmentScheme, SavedScheme, SchemeEligibilityResult } from '../types';

export const schemesApi = {
  getSchemes: async (params?: { q?: string; government_type?: string; category?: string; state?: string }) => {
    const response = await api.get<GovernmentScheme[]>('/schemes', { params });
    return response.data;
  },

  getRecommendedSchemes: async () => {
    const response = await api.get<GovernmentScheme[]>('/schemes/recommended');
    return response.data;
  },

  getSavedSchemes: async () => {
    const response = await api.get<SavedScheme[]>('/schemes/saved');
    return response.data;
  },

  saveScheme: async (schemeId: number, notes?: string) => {
    const response = await api.post<SavedScheme>(`/schemes/${schemeId}/save`, { scheme_id: schemeId, notes });
    return response.data;
  },

  unsaveScheme: async (schemeId: number) => {
    const response = await api.delete(`/schemes/${schemeId}/save`);
    return response.data;
  },

  getSchemeById: async (schemeId: number) => {
    const response = await api.get<GovernmentScheme>(`/schemes/${schemeId}`);
    return response.data;
  },

  checkEligibility: async (schemeId: number) => {
    const response = await api.get<SchemeEligibilityResult>(`/schemes/${schemeId}/eligibility`);
    return response.data;
  }
};
