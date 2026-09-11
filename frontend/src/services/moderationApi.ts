import api from './api';
import {
  UserModerationSummary,
  ModerationActionResponse,
  UserReportResponse,
  ModerationStatsResponse,
  ReportStatus
} from '../types';

export const moderationApi = {
  getStats: async (): Promise<ModerationStatsResponse> => {
    const res = await api.get<ModerationStatsResponse>('/moderation/stats');
    return res.data;
  },

  getUsers: async (params?: { search?: string; role_filter?: string; status_filter?: string }): Promise<UserModerationSummary[]> => {
    const res = await api.get<UserModerationSummary[]>('/moderation/users', { params });
    return res.data;
  },

  warnUser: async (data: { user_id: number; reason: string; description?: string }): Promise<ModerationActionResponse> => {
    const res = await api.post<ModerationActionResponse>('/moderation/warn', data);
    return res.data;
  },

  suspendUser: async (data: { user_id: number; duration_days: number; reason: string; description?: string }): Promise<ModerationActionResponse> => {
    const res = await api.post<ModerationActionResponse>('/moderation/suspend', data);
    return res.data;
  },

  blockUser: async (data: { user_id: number; reason: string; description?: string }): Promise<ModerationActionResponse> => {
    const res = await api.post<ModerationActionResponse>('/moderation/block', data);
    return res.data;
  },

  unblockUser: async (data: { user_id: number; reason?: string }): Promise<ModerationActionResponse> => {
    const res = await api.post<ModerationActionResponse>('/moderation/unblock', data);
    return res.data;
  },

  getHistory: async (limit: number = 100): Promise<ModerationActionResponse[]> => {
    const res = await api.get<ModerationActionResponse[]>('/moderation/history', { params: { limit } });
    return res.data;
  },

  // User Reporting
  createReport: async (data: { reported_user_id: number; reason: string; description?: string }): Promise<UserReportResponse> => {
    const res = await api.post<UserReportResponse>('/moderation/reports', data);
    return res.data;
  },

  getReports: async (status_filter?: string): Promise<UserReportResponse[]> => {
    const res = await api.get<UserReportResponse[]>('/moderation/reports', { params: { status_filter } });
    return res.data;
  },

  updateReportStatus: async (reportId: number, data: { status: ReportStatus; admin_notes?: string }): Promise<UserReportResponse> => {
    const res = await api.patch<UserReportResponse>(`/moderation/reports/${reportId}/status`, data);
    return res.data;
  }
};
