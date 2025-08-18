import { api } from './client';
import { Tenant, CreateTenantRequest, PaginatedResponse } from '@/shared/types';

export const tenantsApi = {
  getAll: (params?: { page?: number; pageSize?: number; search?: string; isActive?: boolean }) => 
    api.get<PaginatedResponse<Tenant>>('/api/master/tenants', { params }),
    
  getById: (id: string) => 
    api.get<Tenant>(`/api/master/tenants/${id}`),
    
  create: (data: CreateTenantRequest) => 
    api.post<Tenant>('/api/master/tenants', data),
    
  update: (id: string, data: Partial<CreateTenantRequest>) => 
    api.put<Tenant>(`/api/master/tenants/${id}`, data),
    
  delete: (id: string) => 
    api.delete(`/api/master/tenants/${id}`),
    
  activate: (id: string) => 
    api.post(`/api/master/tenants/${id}/activate`),
    
  deactivate: (id: string) => 
    api.post(`/api/master/tenants/${id}/deactivate`),
};