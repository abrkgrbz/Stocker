import { apiClient } from './client';
import { LoginRequest, LoginResponse, User } from '@/shared/types';

// Tenant kullanıcıları için auth API
export const authApi = {
  login: (data: LoginRequest) => 
    apiClient.post<LoginResponse>('/api/auth/login', data),
    
  logout: () => 
    apiClient.post('/api/auth/logout'),
    
  refreshToken: (refreshToken: string) => 
    apiClient.post<{ token: string; refreshToken: string }>('/api/auth/refresh-token', { refreshToken }),
    
  getCurrentUser: () => 
    apiClient.get<User>('/api/auth/me'),
    
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    apiClient.post('/api/auth/change-password', data),
    
  verifyEmail: (data: { email: string; token: string }) =>
    apiClient.post<{ success: boolean; message: string; redirectUrl?: string }>('/api/auth/verify-email', data),
    
  resendVerificationEmail: (data: { email: string }) =>
    apiClient.post<{ success: boolean; message: string }>('/api/auth/resend-verification-email', data),
};

// Master/System Admin için auth API  
export const masterAuthApi = {
  login: (data: LoginRequest) => 
    apiClient.post<LoginResponse>('/api/master/auth/login', data),
    
  logout: () => 
    apiClient.post('/api/master/auth/logout'),
    
  refreshToken: (refreshToken: string) => 
    apiClient.post<{ token: string; refreshToken: string }>('/api/master/auth/refresh-token', { refreshToken }),
};

export const authAPI = authApi;