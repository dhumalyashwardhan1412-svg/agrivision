import api from './api';
import {
  Crop,
  CropRecommendation,
  FarmingPlan,
  ProfitCalculationResponse,
  WhatIfRequest,
  WhatIfComparisonResponse,
  MultiScenarioRequest,
  MultiScenarioResponse
} from '../types';

export const cropApi = {
  getCrops: async (category?: string, season?: string): Promise<Crop[]> => {
    const res = await api.get<Crop[]>('/crops', { params: { category, season } });
    return res.data;
  },

  getCropById: async (cropId: number): Promise<Crop> => {
    const res = await api.get<Crop>(`/crops/${cropId}`);
    return res.data;
  },

  getRecommendationsForFarm: async (farmId: number): Promise<CropRecommendation[]> => {
    const res = await api.get<CropRecommendation[]>(`/recommendations/farm/${farmId}`);
    return res.data;
  },

  generateFarmingPlan: async (data: { farm_id: number; crop_id: number; methodology: string; target_area_acres: number }): Promise<FarmingPlan> => {
    const res = await api.post<FarmingPlan>('/farming-plans/generate', data);
    return res.data;
  },

  getPlansForFarm: async (farmId: number): Promise<FarmingPlan[]> => {
    const res = await api.get<FarmingPlan[]>(`/farming-plans/farm/${farmId}`);
    return res.data;
  },

  getPlanById: async (planId: number): Promise<FarmingPlan> => {
    const res = await api.get<FarmingPlan>(`/farming-plans/${planId}`);
    return res.data;
  },

  calculateProfit: async (data: Record<string, any>): Promise<ProfitCalculationResponse> => {
    const res = await api.post<ProfitCalculationResponse>('/profit/calculate', data);
    return res.data;
  },

  calculateWhatIf: async (data: WhatIfRequest): Promise<WhatIfComparisonResponse> => {
    const res = await api.post<WhatIfComparisonResponse>('/profit/what-if', data);
    return res.data;
  },

  calculateScenarios: async (data: MultiScenarioRequest): Promise<MultiScenarioResponse> => {
    const res = await api.post<MultiScenarioResponse>('/profit/scenarios', data);
    return res.data;
  }
};
