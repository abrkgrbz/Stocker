/**
 * Tenant Repository Implementation
 * Concrete implementation of ITenantRepository using API
 */

import { 
  ITenantRepository, 
  ITenantFilters, 
  IPaginationParams, 
  IPaginatedResult 
} from '../../../core/domain/repositories/ITenantRepository';
import { Tenant } from '../../../core/domain/entities/Tenant';
import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../../../constants';

/**
 * API implementation of Tenant Repository
 */
export class TenantRepository implements ITenantRepository {
  /**
   * Get tenant by ID
   */
  async getById(id: string): Promise<Tenant | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TENANT_BY_ID(id));
      
      if (response.success && response.data) {
        return Tenant.fromJSON(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('TenantRepository.getById error:', error);
      return null;
    }
  }

  /**
   * Get all tenants with filters and pagination
   */
  async getAll(
    filters?: ITenantFilters,
    pagination?: IPaginationParams
  ): Promise<IPaginatedResult<Tenant>> {
    try {
      const params = {
        ...filters,
        page: pagination?.page || 1,
        pageSize: pagination?.pageSize || 10,
        sortBy: pagination?.sortBy || 'createdAt',
        sortOrder: pagination?.sortOrder || 'desc',
      };

      const response = await apiClient.get(API_ENDPOINTS.TENANTS, { params });

      if (response.success && response.data) {
        return {
          data: response.data.items.map((item: any) => Tenant.fromJSON(item)),
          total: response.data.total || 0,
          page: response.data.page || 1,
          pageSize: response.data.pageSize || 10,
          totalPages: response.data.totalPages || 1,
        };
      }

      return {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };
    } catch (error) {
      console.error('TenantRepository.getAll error:', error);
      throw error;
    }
  }

  /**
   * Get tenant by subdomain
   */
  async getBySubdomain(subdomain: string): Promise<Tenant | null> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TENANTS}/subdomain/${subdomain}`);
      
      if (response.success && response.data) {
        return Tenant.fromJSON(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('TenantRepository.getBySubdomain error:', error);
      return null;
    }
  }

  /**
   * Create a new tenant
   */
  async create(tenant: Tenant): Promise<Tenant> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TENANTS, tenant.toJSON());
      
      if (response.success && response.data) {
        return Tenant.fromJSON(response.data);
      }
      
      throw new Error('Failed to create tenant');
    } catch (error) {
      console.error('TenantRepository.create error:', error);
      throw error;
    }
  }

  /**
   * Update an existing tenant
   */
  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    try {
      // Convert updates to plain object if needed
      const data = updates instanceof Tenant ? updates.toJSON() : updates;
      
      const response = await apiClient.put(API_ENDPOINTS.TENANT_BY_ID(id), data);
      
      if (response.success && response.data) {
        return Tenant.fromJSON(response.data);
      }
      
      throw new Error('Failed to update tenant');
    } catch (error) {
      console.error('TenantRepository.update error:', error);
      throw error;
    }
  }

  /**
   * Delete a tenant (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.TENANT_BY_ID(id));
      return response.success;
    } catch (error) {
      console.error('TenantRepository.delete error:', error);
      return false;
    }
  }

  /**
   * Check if subdomain is available
   */
  async isSubdomainAvailable(subdomain: string): Promise<boolean> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.TENANTS}/check-subdomain/${subdomain}`
      );
      return response.data?.available || false;
    } catch (error) {
      console.error('TenantRepository.isSubdomainAvailable error:', error);
      return false;
    }
  }

  /**
   * Get tenant statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    trial: number;
    suspended: number;
    byPlan: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TENANTS}/statistics`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        total: 0,
        active: 0,
        trial: 0,
        suspended: 0,
        byPlan: {},
      };
    } catch (error) {
      console.error('TenantRepository.getStatistics error:', error);
      throw error;
    }
  }

  /**
   * Get tenants expiring soon
   */
  async getExpiringTenants(days: number): Promise<Tenant[]> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TENANTS}/expiring`, {
        params: { days },
      });
      
      if (response.success && response.data) {
        return response.data.map((item: any) => Tenant.fromJSON(item));
      }
      
      return [];
    } catch (error) {
      console.error('TenantRepository.getExpiringTenants error:', error);
      return [];
    }
  }

  /**
   * Get top tenants by revenue
   */
  async getTopTenantsByRevenue(limit: number): Promise<Tenant[]> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TENANTS}/top-revenue`, {
        params: { limit },
      });
      
      if (response.success && response.data) {
        return response.data.map((item: any) => Tenant.fromJSON(item));
      }
      
      return [];
    } catch (error) {
      console.error('TenantRepository.getTopTenantsByRevenue error:', error);
      return [];
    }
  }

  /**
   * Search tenants
   */
  async search(query: string): Promise<Tenant[]> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TENANTS}/search`, {
        params: { q: query },
      });
      
      if (response.success && response.data) {
        return response.data.map((item: any) => Tenant.fromJSON(item));
      }
      
      return [];
    } catch (error) {
      console.error('TenantRepository.search error:', error);
      return [];
    }
  }

  /**
   * Batch update tenants
   */
  async batchUpdate(ids: string[], updates: Partial<Tenant>): Promise<number> {
    try {
      const data = updates instanceof Tenant ? updates.toJSON() : updates;
      
      const response = await apiClient.put(`${API_ENDPOINTS.TENANTS}/batch`, {
        ids,
        updates: data,
      });
      
      return response.data?.affected || 0;
    } catch (error) {
      console.error('TenantRepository.batchUpdate error:', error);
      return 0;
    }
  }

  /**
   * Batch delete tenants
   */
  async batchDelete(ids: string[]): Promise<number> {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.TENANTS}/batch`, {
        data: { ids },
      });
      
      return response.data?.affected || 0;
    } catch (error) {
      console.error('TenantRepository.batchDelete error:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const tenantRepository = new TenantRepository();