import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://localhost:7014') + '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Get the auth storage from zustand persist
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        const token = authData?.state?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing auth storage:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - clear zustand auth storage
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  // Extended fields for UI (we'll populate these from other endpoints or defaults)
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
    storage: Math.random() * 100, // Mock storage data
    maxStorage: getMaxStorageByPackage(apiTenant.packageName),
    lastActive: '5 dakika önce',
    owner: {
      name: apiTenant.contactEmail?.split('@')[0] || 'Admin',
      email: apiTenant.contactEmail || '',
      phone: '+90 555 123 4567',
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
      size: Math.random() * 10,
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
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.package) queryParams.append('package', params.package);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiClient.get<ApiResponse<Tenant[]>>(`/master/tenants?${queryParams.toString()}`);
      
      if (response.data.success) {
        // Map API response to extended tenant format
        const mappedTenants = response.data.data.map(mapApiTenantToExtended);
        
        return {
          data: mappedTenants,
          total: mappedTenants.length,
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
    const response = await apiClient.get<TenantStats>('/tenants/stats');
    return response.data;
  },

  // Get single tenant by ID
  async getTenantById(id: string): Promise<Tenant> {
    const response = await apiClient.get<Tenant>(`/tenants/${id}`);
    return response.data;
  },

  // Create new tenant
  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    const response = await apiClient.post<Tenant>('/tenants', data);
    return response.data;
  },

  // Update tenant
  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const response = await apiClient.put<Tenant>(`/tenants/${id}`, data);
    return response.data;
  },

  // Delete tenant
  async deleteTenant(id: string): Promise<void> {
    await apiClient.delete(`/tenants/${id}`);
  },

  // Suspend tenant
  async suspendTenant(id: string): Promise<Tenant> {
    const response = await apiClient.post<Tenant>(`/tenants/${id}/suspend`);
    return response.data;
  },

  // Activate tenant
  async activateTenant(id: string): Promise<Tenant> {
    const response = await apiClient.post<Tenant>(`/tenants/${id}/activate`);
    return response.data;
  },

  // Login to tenant
  async loginToTenant(id: string): Promise<{ url: string; token: string }> {
    const response = await apiClient.post<{ url: string; token: string }>(`/tenants/${id}/login`);
    return response.data;
  },

  // Start migration for tenant
  async startMigration(id: string): Promise<{ jobId: string; status: string }> {
    const response = await apiClient.post<{ jobId: string; status: string }>(`/tenants/${id}/migrate`);
    return response.data;
  },

  // Create backup for tenant
  async createBackup(id: string): Promise<{ backupId: string; url: string }> {
    const response = await apiClient.post<{ backupId: string; url: string }>(`/tenants/${id}/backup`);
    return response.data;
  },

  // Export tenants data
  async exportTenants(format: 'csv' | 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    const response = await apiClient.get(`/tenants/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Import tenants from file
  async importTenants(file: File): Promise<{ imported: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ imported: number; failed: number; errors: string[] }>(
      '/tenants/import',
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