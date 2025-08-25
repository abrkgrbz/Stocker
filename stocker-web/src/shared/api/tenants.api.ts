import { api } from './client';
import { Tenant, CreateTenantRequest, PaginatedResponse } from '@/shared/types';

export const tenantsApi = {
  getAll: (params?: { page?: number; pageSize?: number; search?: string; isActive?: boolean }) => 
    api.get<any>('/api/masters/Tenants', { params }),
    
  getById: (id: string) => 
    api.get<Tenant>(`/api/masters/Tenants/${id}`),
    
  create: (data: CreateTenantRequest) => 
    api.post<Tenant>('/api/masters/Tenants', data),
    
  update: (id: string, data: Partial<CreateTenantRequest>) => 
    api.put<Tenant>(`/api/masters/Tenants/${id}`, data),
    
  delete: (id: string) => 
    api.delete(`/api/masters/Tenants/${id}`),
    
  activate: (id: string) => 
    api.post(`/api/masters/Tenants/${id}/activate`),
    
  deactivate: (id: string) => 
    api.post(`/api/masters/Tenants/${id}/deactivate`),
};