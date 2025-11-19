import api from './api';
import { tokenStorage } from '../utils/tokenStorage';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  domain: string;
  isActive: boolean;
  contactEmail: string;
  packageName: string;
  createdDate: string;
  subscriptionEndDate: string;
  userCount: number;
  // Extended fields for UI
  subdomain?: string;
  customDomain?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  package?: 'starter' | 'professional' | 'enterprise' | 'custom';
  users?: number;
  maxUsers?: number;
  storage?: number;
  maxStorage?: number;
  lastActive?: string;
  owner?: {
    name: string;
    email: string;
    phone: string;
  };
  billing?: {
    plan: string;
    amount: number;
    cycle: 'monthly' | 'yearly';
    nextBilling: string;
  };
  database?: {
    name: string;
    status: 'active' | 'migrating' | 'error';
    size: number;
  };
  features?: string[];
}

export interface TenantListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  package?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
  timestamp: string;
}

export interface TenantListResponse {
  data: Tenant[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

// Helper function to map API tenant to extended tenant
const mapApiTenantToExtended = (apiTenant: Tenant): Tenant => {
  return {
    ...apiTenant,
    subdomain: apiTenant.code?.toLowerCase() || apiTenant.domain?.split('.')[0] || '',
    customDomain: apiTenant.domain,
    status: apiTenant.isActive ? 'active' : 'inactive',
    package: determinePackageType(apiTenant.packageName),
    users: apiTenant.userCount || 0,
    maxUsers: getMaxUsersByPackage(apiTenant.packageName),
    storage: 0, // Default to 0 instead of random
    maxStorage: getMaxStorageByPackage(apiTenant.packageName),
    lastActive: '-', // Default to placeholder
    owner: {
      name: apiTenant.contactEmail?.split('@')[0] || 'Admin',
      email: apiTenant.contactEmail || '',
      phone: '', // Default empty
    },
    billing: {
      plan: apiTenant.packageName || 'Starter',
      amount: getPackagePrice(apiTenant.packageName),
      cycle: 'monthly',
      nextBilling: apiTenant.subscriptionEndDate || '',
    },
    database: {
      name: `${apiTenant.code}_db`,
      status: 'active',
      size: 0, // Default to 0
    },
    features: getFeaturesByPackage(apiTenant.packageName),
  };
};

// Helper functions for package mapping
const determinePackageType = (packageName?: string): 'starter' | 'professional' | 'enterprise' | 'custom' => {
  if (!packageName) return 'starter';
  const name = packageName.toLowerCase();
  if (name.includes('enterprise')) return 'enterprise';
  if (name.includes('professional') || name.includes('pro')) return 'professional';
  if (name.includes('custom')) return 'custom';
  return 'starter';
};

const getMaxUsersByPackage = (packageName?: string): number => {
  const type = determinePackageType(packageName);
  switch (type) {
    case 'enterprise': return 500;
    case 'professional': return 100;
    case 'custom': return 1000;
    default: return 25;
  }
};

const getMaxStorageByPackage = (packageName?: string): number => {
  const type = determinePackageType(packageName);
  switch (type) {
    case 'enterprise': return 100;
    case 'professional': return 50;
    case 'custom': return 500;
    default: return 10;
  }
};

const getPackagePrice = (packageName?: string): number => {
  const type = determinePackageType(packageName);
  switch (type) {
    case 'enterprise': return 9999;
    case 'professional': return 299;
    case 'custom': return 19999;
    default: return 99;
  }
};

const getFeaturesByPackage = (packageName?: string): string[] => {
  const type = determinePackageType(packageName);
  switch (type) {
    case 'enterprise':
      return ['advanced-analytics', 'api-access', 'custom-branding', 'priority-support', 'white-label', 'sla-guarantee'];
    case 'professional':
      return ['analytics', 'api-access', 'email-support'];
    case 'custom':
      return ['all-features', 'dedicated-support', 'custom-development'];
    default:
      return ['basic-features', 'email-support'];
  }
};

export const tenantService = {
  // Get list of tenants with pagination and filters
  async getTenants(params: TenantListParams = {}): Promise<TenantListResponse> {
    try {
      const response = await api.get<ApiResponse<Tenant[]>>('/api/master/tenants', { params });

      if (response.data.success) {
        // Map API response to extended tenant format
        const mappedTenants = response.data.data.map(mapApiTenantToExtended);

        // If API doesn't return pagination metadata, calculate it manually or use defaults
        // Assuming API might return pagination info in the future or we wrap it
        return {
          data: mappedTenants,
          total: mappedTenants.length, // This should ideally come from API
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          totalPages: Math.ceil(mappedTenants.length / (params.pageSize || 10)),
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch tenants');
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },

  // Get tenant statistics
  async getTenantStats(): Promise<TenantStats> {
    const response = await api.get<ApiResponse<TenantStats>>('/api/master/dashboard/stats'); // Adjusted endpoint based on api.ts
    return response.data.data;
  },

  // Get single tenant by ID
  async getTenantById(id: string): Promise<Tenant> {
    try {
      const response = await api.get<ApiResponse<Tenant>>(`/api/master/tenants/${id}`);

      if (response.data.success) {
        return mapApiTenantToExtended(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch tenant');
      }
    } catch (error) {
      console.error('Error fetching tenant by ID:', error);
      throw error;
    }
  },

  // Create new tenant
  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    try {
      const response = await api.post<ApiResponse<Tenant>>('/api/master/tenants', data);

      if (response.data.success) {
        return mapApiTenantToExtended(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to create tenant');
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  },

  // Update tenant
  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
    try {
      const response = await api.put<ApiResponse<Tenant>>(`/api/master/tenants/${id}`, data);

      if (response.data.success) {
        return mapApiTenantToExtended(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to update tenant');
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  },

  // Delete tenant
  async deleteTenant(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/api/master/tenants/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete tenant');
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  },

  // Suspend tenant
  async suspendTenant(id: string): Promise<Tenant> {
    try {
      const response = await api.post<ApiResponse<Tenant>>(`/api/master/tenants/${id}/toggle-active`); // Adjusted based on API_ENDPOINTS.md

      if (response.data.success) {
        return mapApiTenantToExtended(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to suspend tenant');
      }
    } catch (error) {
      console.error('Error suspending tenant:', error);
      throw error;
    }
  },

  // Activate tenant
  async activateTenant(id: string): Promise<Tenant> {
    try {
      const response = await api.post<ApiResponse<Tenant>>(`/api/master/tenants/${id}/toggle-active`); // Adjusted based on API_ENDPOINTS.md

      if (response.data.success) {
        return mapApiTenantToExtended(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to activate tenant');
      }
    } catch (error) {
      console.error('Error activating tenant:', error);
      throw error;
    }
  },

  // Login to tenant
  async loginToTenant(id: string): Promise<{ url: string; token: string }> {
    // This endpoint might need adjustment based on real API, keeping as is but using api instance
    const response = await api.post<{ url: string; token: string }>(`/api/tenants/${id}/login`);
    return response.data;
  },

  // Start migration for tenant
  async startMigration(id: string): Promise<{ jobId: string; status: string }> {
    const response = await api.post<{ jobId: string; status: string }>(`/api/tenants/${id}/migrate`);
    return response.data;
  },

  // Migrate single tenant database
  async migrateTenantDatabase(tenantId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        `/api/admin/tenant-migration/${tenantId}/migrate`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Migration başarısız oldu');
    }
  },

  // Migrate all tenants
  async migrateAllTenants(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        '/api/admin/tenant-migration/migrate-all'
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Toplu migration başarısız oldu');
    }
  },

  // Create backup for tenant
  async createBackup(id: string): Promise<{ backupId: string; url: string }> {
    const response = await api.post<{ backupId: string; url: string }>(`/api/tenants/${id}/backup`);
    return response.data;
  },

  // Validate tenant code availability
  async validateTenantCode(code: string): Promise<{ isAvailable: boolean; message?: string }> {
    try {
      const response = await api.get<ApiResponse<{ isAvailable: boolean; message?: string }>>(
        `/api/public/check-company-code/${code}` // Adjusted based on API_ENDPOINTS.md
      );

      if (response.data.success) {
        return response.data.data;
      }

      return { isAvailable: false, message: 'Validation failed' };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { isAvailable: true };
      }
      return { isAvailable: true };
    }
  },

  // Export tenants data
  async exportTenants(format: 'csv' | 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    const response = await api.get(`/api/tenants/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Import tenants from file
  async importTenants(file: File): Promise<{ imported: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ imported: number; failed: number; errors: string[] }>(
      '/api/tenants/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export default tenantService;