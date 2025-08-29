import { apiClient } from './client';
import { LoginRequest, LoginResponse, User } from '@/shared/types';

// Tenant kullanıcıları için auth API
export const authApi = {
  login: (data: LoginRequest) => {
    console.log('AUTH API - Login request:', {
      url: `${apiClient.defaults.baseURL}/api/auth/login`,
      email: data.email,
      tenantCode: data.tenantCode,
      hasPassword: !!data.password
    });
    
    return apiClient.post<LoginResponse>('/api/auth/login', data).catch((error) => {
      console.error('AUTH API - Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    });
  },
    
  logout: () => 
    apiClient.post('/api/auth/logout'),
    
  refreshToken: (refreshToken: string) => 
    apiClient.post<{ token: string; refreshToken: string }>('/api/auth/refresh-token', { refreshToken }),
    
  getCurrentUser: () => 
    apiClient.get<User>('/api/auth/me'),
    
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    apiClient.post('/api/auth/change-password', data),
    
  verifyEmail: (data: { email: string; token: string }) =>
    apiClient.post<{ success: boolean; message: string; redirectUrl?: string }>('/api/master/auth/verify-email', data),
    
  resendVerificationEmail: (data: { email: string }) =>
    apiClient.post<{ success: boolean; message: string }>('/api/master/auth/resend-verification-email', data),
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