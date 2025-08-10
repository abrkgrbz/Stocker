import { apiClient } from './client';
import { 
  Tenant, 
  Package, 
  Subscription, 
  CreateTenantRequest,
  PaginatedResponse 
} from '@/shared/types';

// Dashboard API
export const masterDashboardApi = {
  getStats: () => 
    apiClient.get('/api/master/dashboard/stats'),
    
  getSystemHealth: () => 
    apiClient.get('/api/master/dashboard/system-health'),
    
  getRevenueChart: (period: string = 'monthly') => 
    apiClient.get(`/api/master/dashboard/revenue?period=${period}`),
    
  getRecentEvents: () => 
    apiClient.get('/api/master/dashboard/events'),
};

// Tenant Management API
export const masterTenantApi = {
  getAll: (params?: { 
    page?: number; 
    pageSize?: number; 
    status?: string; 
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    return apiClient.get<PaginatedResponse<Tenant>>(`/api/master/tenants?${queryParams.toString()}`);
  },
    
  getById: (id: string) => 
    apiClient.get<Tenant>(`/api/master/tenants/${id}`),
    
  create: (data: CreateTenantRequest) => 
    apiClient.post<Tenant>('/api/master/tenants', data),
    
  update: (id: string, data: Partial<Tenant>) => 
    apiClient.put<Tenant>(`/api/master/tenants/${id}`, data),
    
  delete: (id: string) => 
    apiClient.delete(`/api/master/tenants/${id}`),
    
  suspend: (id: string, reason?: string) => 
    apiClient.post(`/api/master/tenants/${id}/suspend`, { reason }),
    
  activate: (id: string) => 
    apiClient.post(`/api/master/tenants/${id}/activate`),
    
  resetPassword: (id: string) => 
    apiClient.post(`/api/master/tenants/${id}/reset-password`),
    
  getUsageStats: (id: string) => 
    apiClient.get(`/api/master/tenants/${id}/usage`),
    
  getActivityLog: (id: string) => 
    apiClient.get(`/api/master/tenants/${id}/activity`),
    
  loginAsTenant: (id: string) => 
    apiClient.post(`/api/master/tenants/${id}/impersonate`),
};

// Package Management API
export const masterPackageApi = {
  getAll: () => 
    apiClient.get<Package[]>('/api/master/packages'),
    
  getById: (id: string) => 
    apiClient.get<Package>(`/api/master/packages/${id}`),
    
  create: (data: Partial<Package>) => 
    apiClient.post<Package>('/api/master/packages', data),
    
  update: (id: string, data: Partial<Package>) => 
    apiClient.put<Package>(`/api/master/packages/${id}`, data),
    
  delete: (id: string) => 
    apiClient.delete(`/api/master/packages/${id}`),
    
  duplicate: (id: string) => 
    apiClient.post<Package>(`/api/master/packages/${id}/duplicate`),
    
  toggleStatus: (id: string, isActive: boolean) => 
    apiClient.patch(`/api/master/packages/${id}/status`, { isActive }),
    
  getSubscribers: (id: string) => 
    apiClient.get(`/api/master/packages/${id}/subscribers`),
};

// Subscription Management API
export const masterSubscriptionApi = {
  getAll: (params?: { 
    page?: number; 
    pageSize?: number; 
    status?: string; 
    tenantId?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.tenantId) queryParams.append('tenantId', params.tenantId);
    
    return apiClient.get<PaginatedResponse<Subscription>>(`/api/master/subscriptions?${queryParams.toString()}`);
  },
    
  getById: (id: string) => 
    apiClient.get<Subscription>(`/api/master/subscriptions/${id}`),
    
  create: (data: any) => 
    apiClient.post<Subscription>('/api/master/subscriptions', data),
    
  update: (id: string, data: Partial<Subscription>) => 
    apiClient.put<Subscription>(`/api/master/subscriptions/${id}`, data),
    
  cancel: (id: string, reason: string) => 
    apiClient.post(`/api/master/subscriptions/${id}/cancel`, { reason }),
    
  renew: (id: string) => 
    apiClient.post(`/api/master/subscriptions/${id}/renew`),
    
  getInvoices: (id: string) => 
    apiClient.get(`/api/master/subscriptions/${id}/invoices`),
};

// Module Management API
export const masterModuleApi = {
  getAll: () => 
    apiClient.get('/api/master/modules'),
    
  getById: (id: string) => 
    apiClient.get(`/api/master/modules/${id}`),
    
  update: (id: string, data: any) => 
    apiClient.put(`/api/master/modules/${id}`, data),
    
  toggleStatus: (id: string, isActive: boolean) => 
    apiClient.patch(`/api/master/modules/${id}/status`, { isActive }),
};

// System Settings API
export const masterSettingsApi = {
  getGeneral: () => 
    apiClient.get('/api/master/settings/general'),
    
  updateGeneral: (data: any) => 
    apiClient.put('/api/master/settings/general', data),
    
  getEmail: () => 
    apiClient.get('/api/master/settings/email'),
    
  updateEmail: (data: any) => 
    apiClient.put('/api/master/settings/email', data),
    
  testEmail: (email: string) => 
    apiClient.post('/api/master/settings/email/test', { email }),
    
  getIntegrations: () => 
    apiClient.get('/api/master/settings/integrations'),
    
  updateIntegration: (key: string, data: any) => 
    apiClient.put(`/api/master/settings/integrations/${key}`, data),
    
  getBackup: () => 
    apiClient.get('/api/master/settings/backup'),
    
  createBackup: () => 
    apiClient.post('/api/master/settings/backup/create'),
    
  restoreBackup: (backupId: string) => 
    apiClient.post(`/api/master/settings/backup/restore/${backupId}`),
};

// System Monitoring API
export const masterMonitoringApi = {
  getSystemStatus: () => 
    apiClient.get('/api/master/monitoring/status'),
    
  getPerformanceMetrics: () => 
    apiClient.get('/api/master/monitoring/performance'),
    
  getLogs: (params?: { 
    level?: string; 
    startDate?: string; 
    endDate?: string;
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.level) queryParams.append('level', params.level);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    return apiClient.get(`/api/master/monitoring/logs?${queryParams.toString()}`);
  },
    
  getErrors: () => 
    apiClient.get('/api/master/monitoring/errors'),
    
  clearCache: () => 
    apiClient.post('/api/master/monitoring/cache/clear'),
    
  restartService: (service: string) => 
    apiClient.post(`/api/master/monitoring/services/${service}/restart`),
};