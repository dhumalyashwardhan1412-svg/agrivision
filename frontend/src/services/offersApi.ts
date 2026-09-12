import api from './api';
import { Offer, OfferStatus } from '../types';

export interface CreateOfferInput {
  requirement_id?: number;
  listing_id?: number;
  farmer_id: number;
  produce_name: string;
  quantity: number;
  unit?: string;
  offered_price: number;
  price_unit?: string;
  delivery_preference?: string;
  location?: string;
  message?: string;
  expires_at?: string;
}

export interface CounterOfferInput {
  counter_price: number;
  quantity?: number;
  message?: string;
}

export const offersApi = {
  createOffer: async (data: CreateOfferInput) => {
    const response = await api.post<Offer>('/offers', data);
    return response.data;
  },

  getOffers: async (status_filter?: OfferStatus) => {
    const response = await api.get<Offer[]>('/offers', { params: { status_filter } });
    return response.data;
  },

  getOfferById: async (id: number) => {
    const response = await api.get<Offer>(`/offers/${id}`);
    return response.data;
  },

  counterOffer: async (id: number, data: CounterOfferInput) => {
    const response = await api.post<Offer>(`/offers/${id}/counter`, data);
    return response.data;
  },

  acceptOffer: async (id: number) => {
    const response = await api.post<Offer>(`/offers/${id}/accept`);
    return response.data;
  },

  rejectOffer: async (id: number) => {
    const response = await api.post<Offer>(`/offers/${id}/reject`);
    return response.data;
  },

  completeOffer: async (id: number) => {
    const response = await api.post<Offer>(`/offers/${id}/complete`);
    return response.data;
  }
};
