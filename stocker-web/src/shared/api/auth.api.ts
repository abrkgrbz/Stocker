import { apiClient } from './client';
import { LoginRequest, LoginResponse, User } from '@/shared/types';

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
};