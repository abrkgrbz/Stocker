import { apiClient } from './client';
import { 
  Tenant, 
  Package, 
  Subscription, 
  CreateTenantRequest,
  PaginatedResponse,
  ApiResponse 
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
    
    return apiClient.get<PaginatedResponse<Tenant>>(`/api/master/Tenants?${queryParams.toString()}`);
  },
    
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Tenant>>(`/api/master/Tenants/${id}`);
    return response.data.data!;
  },
    
  create: (data: CreateTenantRequest) => 
    apiClient.post<Tenant>('/api/master/Tenants', data),
    
  update: (id: string, data: Partial<Tenant>) => 
    apiClient.put<Tenant>(`/api/master/Tenants/${id}`, data),
    
  delete: (id: string) => 
    apiClient.delete(`/api/master/Tenants/${id}`),
    
  // Toggle tenant status (activate/deactivate)
  toggleStatus: (id: string) => {
    console.log('API call: Toggling tenant status', id);
    return apiClient.post(`/api/master/Tenants/${id}/toggle-status`)
      .then(response => {
        console.log('Toggle status API response:', response);
        return response;
      })
      .catch(error => {
        console.error('Toggle status API error:', error);
        throw error;
      });
  },
  
  // Legacy methods for backward compatibility
  suspend: (id: string, reason?: string) => {
    console.log('API call: Suspending tenant (using toggle)', id);
    return apiClient.post(`/api/master/Tenants/${id}/toggle-status`)
      .then(response => {
        console.log('Toggle status API response:', response);
        return response;
      })
      .catch(error => {
        console.error('Toggle status API error:', error);
        throw error;
      });
  },
    
  activate: (id: string) => {
    console.log('API call: Activating tenant (using toggle)', id);
    return apiClient.post(`/api/master/Tenants/${id}/toggle-status`)
      .then(response => {
        console.log('Toggle status API response:', response);
        return response;
      })
      .catch(error => {
        console.error('Toggle status API error:', error);
        throw error;
      });
  },
    
  resetPassword: (id: string) => 
    apiClient.post(`/api/master/Tenants/${id}/reset-password`),
    
  getStatistics: async (id: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/api/master/Tenants/${id}/statistics`);
    return response.data.data;
  },
    
  getUsers: async (id: string) => {
    // TODO: Implement when backend endpoint is ready
    return Promise.resolve([]);
  },
    
  getModules: async (id: string) => {
    // TODO: Implement when backend endpoint is ready  
    return Promise.resolve([]);
  },
    
  getActivityLog: (id: string) => 
    // Activity log endpoint not implemented yet, return empty data
    Promise.resolve({ data: { data: [] } }),
    
  loginAsTenant: (id: string) => {
    console.log('API call: Login as tenant (Impersonate not implemented)', id);
    // Impersonate endpoint not implemented in backend yet
    // For now, just redirect to tenant dashboard with tenant ID
    return Promise.resolve({
      data: {
        success: true,
        data: {
          tenantId: id,
          message: 'Impersonate feature is not implemented yet. Redirecting to tenant dashboard...'
        }
      }
    });
  },
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

// System Settings API - NOT IMPLEMENTED IN BACKEND YET
export const masterSettingsApi = {
  getGeneral: () => 
    // Mock data until backend implementation
    Promise.resolve({
      data: {
        success: true,
        data: {
          appName: 'Stocker',
          appTitle: 'Stok Yönetim Sistemi',
          appDescription: 'Modern ve güçlü stok yönetim çözümü',
          appVersion: '1.0.0',
          appUrl: 'https://stoocker.app',
          apiUrl: 'https://api.stoocker.app',
          supportEmail: 'info@stoocker.app',
          supportPhone: '+90 555 123 4567',
          defaultLanguage: 'tr',
          defaultTimezone: 'Europe/Istanbul',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: 'HH:mm',
          currency: 'TRY',
          currencyPosition: 'before',
        }
      }
    }),
    
  updateGeneral: (data: any) => 
    // Mock success response
    Promise.resolve({
      data: {
        success: true,
        message: 'Settings updated successfully'
      }
    }),
    
  getEmail: () => 
    // Mock data until backend implementation
    Promise.resolve({
      data: {
        success: true,
        data: {
          emailProvider: 'smtp',
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUsername: 'info@stoocker.app',
          smtpEncryption: 'tls',
          fromEmail: 'info@stoocker.app',
          fromName: 'Stocker',
        }
      }
    }),
    
  updateEmail: (data: any) => 
    // Mock success response
    Promise.resolve({
      data: {
        success: true,
        message: 'Email settings updated successfully'
      }
    }),
    
  testEmail: (email: string) => 
    // Mock success response
    Promise.resolve({
      data: {
        success: true,
        message: `Test email sent to ${email}`
      }
    }),
    
  getIntegrations: () => 
    // Mock data until backend implementation
    Promise.resolve({
      data: {
        success: true,
        data: []
      }
    }),
    
  updateIntegration: (key: string, data: any) => 
    // Mock success response
    Promise.resolve({
      data: {
        success: true,
        message: 'Integration updated successfully'
      }
    }),
    
  getBackup: () => 
    // Mock data until backend implementation
    Promise.resolve({
      data: {
        success: true,
        data: {
          lastBackup: new Date().toISOString(),
          backups: []
        }
      }
    }),
    
  createBackup: () => 
    // Mock success response
    Promise.resolve({
      data: {
        success: true,
        message: 'Backup created successfully'
      }
    }),
    
  restoreBackup: (backupId: string) => 
    // Mock success response
    Promise.resolve({
      data: {
        success: true,
        message: `Backup ${backupId} restored successfully`
      }
    }),
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

// Export master API
export const masterApi = {
  dashboard: masterDashboardApi,
  tenants: masterTenantApi,
  packages: masterPackageApi,
  subscriptions: masterSubscriptionApi,
  settings: masterSettingsApi,
  monitoring: masterMonitoringApi,
};