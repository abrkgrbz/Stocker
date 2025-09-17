import { Tenant, CreateTenantRequest, PaginatedResponse } from '@/shared/types';

import { api } from './client';

export const tenantsApi = {
  getAll: (params?: { page?: number; pageSize?: number; search?: string; isActive?: boolean }) => 
    api.get<any>('/api/master/Tenants', { params }),
    
  getById: (id: string) => 
    api.get<Tenant>(`/api/master/Tenants/${id}`),
    
  create: (data: CreateTenantRequest) => 
    api.post<Tenant>('/api/master/Tenants', data),
    
  update: (id: string, data: Partial<CreateTenantRequest>) => 
    api.put<Tenant>(`/api/master/Tenants/${id}`, data),
    
  delete: (id: string) => 
    api.delete(`/api/master/Tenants/${id}`),
    
  activate: (id: string) => 
    api.post(`/api/master/Tenants/${id}/activate`),
    
  deactivate: (id: string) => 
    api.post(`/api/master/Tenants/${id}/deactivate`),
};