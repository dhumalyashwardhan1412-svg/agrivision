import api from './api';
import { SoilTest, SoilAnalysisResult } from '../types';

export const soilApi = {
  recordLabTest: async (data: Partial<SoilTest>): Promise<SoilTest> => {
    const res = await api.post<SoilTest>('/soil/lab-test', data);
    return res.data;
  },

  recordImageEstimate: async (data: Partial<SoilTest>): Promise<SoilTest> => {
    const res = await api.post<SoilTest>('/soil/image-estimate', data);
    return res.data;
  },

  getSoilRecords: async (farmId: number): Promise<SoilTest[]> => {
    const res = await api.get<SoilTest[]>(`/soil/records/${farmId}`);
    return res.data;
  },

  analyzeSoilTest: async (soilTestId: number): Promise<SoilAnalysisResult> => {
    const res = await api.get<SoilAnalysisResult>(`/soil/analyze/${soilTestId}`);
    return res.data;
  }
};
