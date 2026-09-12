import api from './api';
import { NotificationItem, UnreadCountResponse } from '../types';

export interface GetNotificationsParams {
  limit?: number;
  offset?: number;
  is_read?: boolean;
  notification_type?: string;
  category?: string;
}

export const notificationsApi = {
  getNotifications: async (params?: GetNotificationsParams): Promise<NotificationItem[]> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (typeof params.limit === 'number') cleanParams.limit = params.limit;
      if (typeof params.offset === 'number') cleanParams.offset = params.offset;
      if (typeof params.is_read === 'boolean') cleanParams.is_read = params.is_read;
      if (params.notification_type) cleanParams.notification_type = params.notification_type;
      if (params.category) cleanParams.category = params.category;
    }
    const response = await api.get<NotificationItem[]>('/notifications', { params: cleanParams });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data.unread_count;
  },

  markAsRead: async (id: number): Promise<NotificationItem> => {
    const response = await api.patch<NotificationItem>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/notifications/${id}`);
    return response.data;
  }
};
