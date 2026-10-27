import api from './api';
import { User, UserRole } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  phone_verification_token?: string;
  role: UserRole;
  state?: string;
  district?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  total_land_area?: number;
  irrigation_source?: string;
  primary_crops?: string;
}

export interface SendOTPResponse {
  request_id: string;
  message: string;
  cooldown_seconds: number;
  expires_in_seconds: number;
  success: boolean;
}

export interface VerifyOTPResponse {
  message: string;
  verification_token: string;
  success: boolean;
}


export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id: number;
  full_name: string;
  email: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', payload);
    return res.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', payload);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  updateProfile: async (payload: Partial<User>): Promise<User> => {
    const res = await api.put<User>('/auth/profile', payload);
    return res.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string; success: boolean }> => {
    const res = await api.post<{ message: string; success: boolean }>('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (payload: { token: string; new_password: string; confirm_password?: string }): Promise<{ message: string; success: boolean }> => {
    const res = await api.post<{ message: string; success: boolean }>('/auth/reset-password', payload);
    return res.data;
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/google', { credential });
    return res.data;
  },

  sendOTP: async (phoneNumber: string): Promise<SendOTPResponse> => {
    const res = await api.post<SendOTPResponse>('/auth/otp/send', { phone_number: phoneNumber });
    return res.data;
  },

  verifyOTP: async (phoneNumber: string, requestId: string, otp: string): Promise<VerifyOTPResponse> => {
    const res = await api.post<VerifyOTPResponse>('/auth/otp/verify', {
      phone_number: phoneNumber,
      request_id: requestId,
      otp,
    });
    return res.data;
  }
};
