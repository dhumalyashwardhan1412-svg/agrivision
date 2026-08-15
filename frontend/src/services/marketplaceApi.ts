import api from './api';
import { CropListing, Review, Order, OrderStatus, Notification } from '../types';

export const marketplaceApi = {
  getListings: async (params?: { category?: string; is_organic?: boolean; search?: string; state?: string }): Promise<CropListing[]> => {
    const res = await api.get<CropListing[]>('/marketplace/listings', { params });
    return res.data;
  },

  getMyListings: async (): Promise<CropListing[]> => {
    const res = await api.get<CropListing[]>('/marketplace/listings');
    return res.data;
  },

  getListingById: async (listingId: number): Promise<CropListing> => {
    const res = await api.get<CropListing>(`/marketplace/listings/${listingId}`);
    return res.data;
  },

  createListing: async (data: Partial<CropListing>): Promise<CropListing> => {
    const res = await api.post<CropListing>('/marketplace/listings', data);
    return res.data;
  },

  updateListing: async (listingId: number, data: Partial<CropListing>): Promise<CropListing> => {
    const res = await api.put<CropListing>(`/marketplace/listings/${listingId}`, data);
    return res.data;
  },

  deleteListing: async (listingId: number): Promise<void> => {
    await api.delete(`/marketplace/listings/${listingId}`);
  },

  addReview: async (listingId: number, rating: number, comment?: string): Promise<Review> => {
    const res = await api.post<Review>(`/marketplace/listings/${listingId}/reviews`, { listing_id: listingId, rating, comment });
    return res.data;
  },

  // Orders
  createOrder: async (data: {
    items: { listing_id: number; quantity: number }[];
    delivery_name?: string;
    delivery_phone?: string;
    delivery_address: string;
    delivery_city: string;
    delivery_pincode: string;
    delivery_contact_name?: string;
    delivery_contact_phone?: string;
    payment_method?: string;
  }): Promise<Order> => {
    const payload = {
      items: data.items,
      delivery_name: data.delivery_name || data.delivery_contact_name || 'Customer',
      delivery_phone: data.delivery_phone || data.delivery_contact_phone || '+91 9876543210',
      delivery_address: data.delivery_address,
      delivery_city: data.delivery_city,
      delivery_pincode: data.delivery_pincode,
      payment_method: data.payment_method || 'UPI',
    };
    const res = await api.post<Order>('/orders', payload);
    return res.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const res = await api.get<Order[]>('/orders/my-orders');
    return res.data;
  },

  getFarmerOrders: async (): Promise<Order[]> => {
    const res = await api.get<Order[]>('/orders/my-orders');
    return res.data;
  },

  getOrderById: async (orderId: number): Promise<Order> => {
    const res = await api.get<Order>(`/orders/${orderId}`);
    return res.data;
  },

  updateOrderStatus: async (orderId: number, status: OrderStatus, tracking_notes?: string): Promise<Order> => {
    const res = await api.patch<Order>(`/orders/${orderId}/status`, { status, tracking_notes });
    return res.data;
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    const res = await api.get<Notification[]>('/notifications');
    return res.data;
  },

  markNotificationRead: async (notifId: number): Promise<void> => {
    await api.patch(`/notifications/${notifId}/read`);
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await api.post('/notifications/mark-all-read');
  }
};
