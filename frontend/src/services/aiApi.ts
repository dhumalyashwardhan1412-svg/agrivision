import api from './api';
import { CropDiagnosis, SoilObservation } from '../types';

export interface ChatResponse {
  response: string;
  suggested_actions: string[];
  source: string;
}

export const aiApi = {
  chat: async (message: string, farmId?: number, contextData?: Record<string, any>): Promise<ChatResponse> => {
    const res = await api.post<ChatResponse>('/ai/chat', {
      message,
      farm_id: farmId,
      context_data: contextData
    });
    return res.data;
  },

  analyzeCropLeaf: async (file: File, cropHint?: string, farmId?: number): Promise<CropDiagnosis> => {
    const formData = new FormData();
    formData.append('file', file);
    if (cropHint) formData.append('crop_hint', cropHint);
    if (farmId) formData.append('farm_id', farmId.toString());

    const res = await api.post<CropDiagnosis>('/ai/analyze-crop-leaf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  analyzeSoilPhoto: async (file: File, farmId?: number): Promise<SoilObservation> => {
    const formData = new FormData();
    formData.append('file', file);
    if (farmId) formData.append('farm_id', farmId.toString());

    const res = await api.post<SoilObservation>('/ai/analyze-soil-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};
