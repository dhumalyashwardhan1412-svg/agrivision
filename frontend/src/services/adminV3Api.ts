import api from './api';
import {
  AdminUserItem,
  GovernmentScheme,
  AuditLog,
  OfflineSyncStats,
  UserRole,
  UserAccountStatus,
  UserVerificationStatus
} from '../types';

export const adminV3Api = {
  getUsers: async (params?: {
    role?: UserRole;
    status_filter?: UserAccountStatus;
    verification_filter?: UserVerificationStatus;
    q?: string;
  }) => {
    const response = await api.get<AdminUserItem[]>('/admin/users', { params });
    return response.data;
  },

  verifyUser: async (userId: number, notes?: string) => {
    const response = await api.post<AdminUserItem>(`/admin/users/${userId}/verify`, { notes });
    return response.data;
  },

  rejectVerification: async (userId: number, rejection_reason?: string) => {
    const response = await api.post<AdminUserItem>(`/admin/users/${userId}/reject-verification`, { rejection_reason });
    return response.data;
  },

  suspendUser: async (userId: number, reason: string, duration_days: number = 7) => {
    const response = await api.post<AdminUserItem>(`/admin/users/${userId}/suspend`, { reason, duration_days });
    return response.data;
  },

  activateUser: async (userId: number) => {
    const response = await api.post<AdminUserItem>(`/admin/users/${userId}/activate`);
    return response.data;
  },

  getSchemes: async (category?: string) => {
    const response = await api.get<GovernmentScheme[]>('/admin/schemes', { params: { category } });
    return response.data;
  },

  createScheme: async (scheme: Partial<GovernmentScheme>) => {
    const response = await api.post<GovernmentScheme>('/admin/schemes', scheme);
    return response.data;
  },

  updateScheme: async (schemeId: number, scheme: Partial<GovernmentScheme>) => {
    const response = await api.put<GovernmentScheme>(`/admin/schemes/${schemeId}`, scheme);
    return response.data;
  },

  verifyScheme: async (schemeId: number) => {
    const response = await api.post<GovernmentScheme>(`/admin/schemes/${schemeId}/verify`);
    return response.data;
  },

  deleteScheme: async (schemeId: number) => {
    const response = await api.delete(`/admin/schemes/${schemeId}`);
    return response.data;
  },

  getAuditLogs: async (params?: { action?: string; entity_type?: string; limit?: number; offset?: number }) => {
    const response = await api.get<AuditLog[]>('/admin/audit-logs', { params });
    return response.data;
  },

  getOfflineSyncStats: async (status_filter?: string) => {
    const response = await api.get<OfflineSyncStats>('/admin/offline-sync', { params: { status_filter } });
    return response.data;
  },

  retryOfflineSync: async (recordId: number) => {
    const response = await api.post(`/admin/offline-sync/${recordId}/retry`);
    return response.data;
  }
};
