import { LoginRequest, LoginResponse, User } from '@/shared/types';

import { apiClient } from './client';

export const authApi = {
  login: (data: LoginRequest) => {
        // If tenant code is provided, set it as header for subdomain login
    const headers: any = {};
    if (data.tenantCode) {
      headers['X-Tenant-Code'] = data.tenantCode;
      headers['X-Tenant-Id'] = data.tenantCode; // Some endpoints may use this
    }
    
    return apiClient.post<LoginResponse>('/api/secure-auth/login', data, { headers }).catch((error) => {
      // Error handling removed for production
      throw error;
    });
  },
    
  logout: () => 
    apiClient.post('/api/secure-auth/logout'),
    
  refreshToken: (refreshToken: string) => 
    apiClient.post<{ token: string; refreshToken: string }>('/api/secure-auth/refresh', { refreshToken }),
    
  getCurrentUser: () => 
    apiClient.get<User>('/api/secure-auth/me'),
    
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