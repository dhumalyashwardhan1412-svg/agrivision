import api from './api';
import { TransactionReview, UserRatingSummary, ReviewType } from '../types';

export interface CreateReviewInput {
  review_type: ReviewType;
  order_id?: number;
  offer_id?: number;
  shop_id?: number;
  target_user_id: number;
  rating: number;
  category_ratings?: Record<string, number>;
  comment?: string;
}

export const reviewsApi = {
  submitReview: async (data: CreateReviewInput) => {
    const response = await api.post<TransactionReview>('/reviews/transaction', data);
    return response.data;
  },

  getUserReviews: async (userId: number) => {
    const response = await api.get<TransactionReview[]>(`/reviews/user/${userId}`);
    return response.data;
  },

  getUserRatingSummary: async (userId: number) => {
    const response = await api.get<UserRatingSummary>(`/reviews/user/${userId}/summary`);
    return response.data;
  },

  getShopReviews: async (shopId: number) => {
    const response = await api.get<TransactionReview[]>(`/reviews/shop/${shopId}`);
    return response.data;
  },

  getShopRatingSummary: async (shopId: number) => {
    const response = await api.get<UserRatingSummary>(`/reviews/shop/${shopId}/summary`);
    return response.data;
  }
};
