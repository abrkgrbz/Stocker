import axiosInstance from '../lib/axios';
import type {
  Tenant,
  TenantListResponse,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantFilters,
  BulkTenantAction,
  TenantStats,
  TenantActivity,
  TenantApiKey,
} from '../types/tenant';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class TenantService {
  async getTenants(
    page: number = 1,
    pageSize: number = 25,
    filters?: TenantFilters
  ): Promise<TenantListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.status && filters.status.length > 0) {
        params.append('status', filters.status.join(','));
      }
      if (filters?.plan && filters.plan.length > 0) {
        params.append('plan', filters.plan.join(','));
      }
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }

      const response = await axiosInstance.get(`/api/master/tenants?${params}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  }

  async getTenant(id: string): Promise<Tenant> {
    try {
      const response = await axiosInstance.get(`/api/master/tenants/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tenant:', error);
      throw error;
    }
  }

  async createTenant(tenantData: CreateTenantRequest): Promise<Tenant> {
    try {
      const response = await axiosInstance.post(`/api/master/tenants`, tenantData);
      return response.data;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  async updateTenant(id: string, updates: UpdateTenantRequest): Promise<Tenant> {
    try {
      const response = await axiosInstance.put(`/api/master/tenants/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  async deleteTenant(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/master/tenants/${id}`);
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }

  async bulkAction(action: BulkTenantAction): Promise<void> {
    try {
      await axiosInstance.post(`/api/master/tenants/bulk`, action);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      throw error;
    }
  }

  async getTenantStats(): Promise<TenantStats> {
    try {
      const response = await axiosInstance.get(`/api/master/tenants/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tenant stats:', error);
      throw error;
    }
  }

  async getTenantActivities(tenantId: string, page: number = 1, pageSize: number = 20): Promise<{
    data: TenantActivity[];
    totalCount: number;
  }> {
    try {
      const response = await axiosInstance.get(
        `/api/master/tenants/${tenantId}/activities?page=${page}&pageSize=${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching tenant activities:', error);
      throw error;
    }
  }

  async createApiKey(tenantId: string, keyData: {
    name: string;
    permissions: string[];
  }): Promise<TenantApiKey> {
    try {
      const response = await axiosInstance.post(
        `/api/master/tenants/${tenantId}/api-keys`,
        keyData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }

  async deleteApiKey(tenantId: string, keyId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/master/tenants/${tenantId}/api-keys/${keyId}`);
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  async toggleApiKeyStatus(tenantId: string, keyId: string): Promise<TenantApiKey> {
    try {
      const response = await axiosInstance.patch(
        `/api/master/tenants/${tenantId}/api-keys/${keyId}/toggle`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling API key status:', error);
      throw error;
    }
  }

  async exportTenants(filters?: TenantFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.status && filters.status.length > 0) {
        params.append('status', filters.status.join(','));
      }
      if (filters?.plan && filters.plan.length > 0) {
        params.append('plan', filters.plan.join(','));
      }

      const response = await axiosInstance.get(`/api/master/tenants/export?${params}`, {
        responseType: 'blob',
      });

      return new Blob([response.data], { type: 'text/csv' });
    } catch (error) {
      console.error('Error exporting tenants:', error);
      throw error;
    }
  }
}

export default new TenantService();