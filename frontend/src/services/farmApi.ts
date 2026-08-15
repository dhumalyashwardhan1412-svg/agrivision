import api from './api';
import { Farm, FarmingActivity } from '../types';

export const farmApi = {
  getMyFarms: async (): Promise<Farm[]> => {
    const res = await api.get<Farm[]>('/farms');
    return res.data;
  },

  getFarmById: async (farmId: number): Promise<Farm> => {
    const res = await api.get<Farm>(`/farms/${farmId}`);
    return res.data;
  },

  createFarm: async (data: Partial<Farm>): Promise<Farm> => {
    const res = await api.post<Farm>('/farms', data);
    return res.data;
  },

  updateFarm: async (farmId: number, data: Partial<Farm>): Promise<Farm> => {
    const res = await api.put<Farm>(`/farms/${farmId}`, data);
    return res.data;
  },

  deleteFarm: async (farmId: number): Promise<void> => {
    await api.delete(`/farms/${farmId}`);
  },

  addActivity: async (farmId: number, data: Partial<FarmingActivity>): Promise<FarmingActivity> => {
    const res = await api.post<FarmingActivity>(`/farms/${farmId}/activities`, data);
    return res.data;
  }
};
