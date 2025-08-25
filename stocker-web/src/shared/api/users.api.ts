import { api } from './client';

export interface MasterUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  lastLoginDate?: string;
  createdDate: string;
  tenantAccess?: string[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
}

export const usersApi = {
  getAll: (params?: { 
    page?: number; 
    pageSize?: number; 
    search?: string; 
    role?: string;
    isActive?: boolean;
  }) => 
    api.get<any>('/api/master/MasterUsers', { params }),
    
  getById: (id: string) => 
    api.get<any>(`/api/master/MasterUsers/${id}`),
    
  create: (data: CreateUserRequest) => 
    api.post<any>('/api/master/MasterUsers', data),
    
  update: (id: string, data: UpdateUserRequest) => 
    api.put<any>(`/api/master/MasterUsers/${id}`, data),
    
  delete: (id: string) => 
    api.delete(`/api/master/MasterUsers/${id}`),
    
  toggleStatus: (id: string) => 
    api.post(`/api/master/MasterUsers/${id}/toggle-status`),
    
  resetPassword: (id: string, newPassword: string) => 
    api.post(`/api/master/MasterUsers/${id}/reset-password`, { newPassword }),
    
  assignToTenant: (userId: string, tenantId: string) => 
    api.post(`/api/master/MasterUsers/${userId}/assign-tenant`, { tenantId }),
    
  removeFromTenant: (userId: string, tenantId: string) => 
    api.post(`/api/master/MasterUsers/${userId}/remove-tenant`, { tenantId }),
};