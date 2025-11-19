import { apiClient } from './apiClient';

// DTOs matching backend
export interface TenantDto {
  id: string;
  name: string;
  code: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  subscription?: TenantSubscriptionDto;
}

export interface TenantSubscriptionDto {
  id: string;
  packageId: string;
  packageName: string;
  status: string;
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  price: number;
}

export interface TenantListDto {
  id: string;
  name: string;
  code: string;
  domain: string;
  isActive: boolean;
  contactEmail?: string;
  packageName: string;
  createdDate: string;
  subscriptionEndDate?: string;
  userCount: number;
}

export interface TenantStatisticsDto {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  storageUsed: number;
  storageLimit: number;
  apiCallsToday: number;
  apiCallsThisMonth: number;
  lastLoginDate?: string;
  lastActivityDate?: string;
}

export interface GetTenantsListQuery {
  searchTerm?: string;
  status?: 'all' | 'active' | 'inactive' | 'suspended';
  packageId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateTenantCommand {
  name: string;
  code: string;
  domain: string;
  contactEmail: string;
  contactPhone?: string;
  adminEmail: string;
  adminName: string;
  packageId: string;
  trialDays?: number;
}

export interface UpdateTenantCommand {
  id?: string;
  name: string;
  domain: string;
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  modifiedBy?: string;
}

export interface SuspendTenantRequest {
  reason: string;
  suspendedUntil?: string;
}

class TenantService {
  private readonly basePath = '/api/master/tenants';

  /**
   * Get all tenants with pagination and filtering
   */
  async getAll(query?: GetTenantsListQuery): Promise<TenantListDto[]> {
    return apiClient.get<TenantListDto[]>(this.basePath, query);
  }

  /**
   * Get tenant by ID with detailed information
   */
  async getById(id: string): Promise<TenantDto> {
    return apiClient.get<TenantDto>(`${this.basePath}/${id}`);
  }

  /**
   * Get tenant statistics
   */
  async getStatistics(id: string): Promise<TenantStatisticsDto> {
    return apiClient.get<TenantStatisticsDto>(`${this.basePath}/${id}/statistics`);
  }

  /**
   * Create a new tenant
   */
  async create(command: CreateTenantCommand): Promise<TenantDto> {
    return apiClient.post<TenantDto>(this.basePath, command);
  }

  /**
   * Update tenant information
   */
  async update(id: string, command: UpdateTenantCommand): Promise<boolean> {
    return apiClient.put<boolean>(`${this.basePath}/${id}`, command);
  }

  /**
   * Activate or deactivate a tenant (toggle status)
   */
  async toggleStatus(id: string): Promise<boolean> {
    return apiClient.post<boolean>(`${this.basePath}/${id}/toggle-status`);
  }

  /**
   * Delete a tenant (soft delete by default)
   */
  async delete(id: string, reason?: string, hardDelete: boolean = false): Promise<boolean> {
    const params = new URLSearchParams();
    if (reason) params.append('reason', reason);
    params.append('hardDelete', hardDelete.toString());

    return apiClient.delete<boolean>(`${this.basePath}/${id}?${params.toString()}`);
  }

  /**
   * Suspend a tenant (uses toggle-status)
   */
  async suspend(id: string, request: SuspendTenantRequest): Promise<boolean> {
    // Backend only has toggle-status, not separate suspend endpoint
    return this.toggleStatus(id);
  }

  /**
   * Activate a tenant (uses toggle-status)
   */
  async activate(id: string): Promise<boolean> {
    // Backend only has toggle-status, not separate activate endpoint
    return this.toggleStatus(id);
  }

  /**
   * Get all statistics for dashboard
   */
  async getAllStatistics(): Promise<any> {
    return apiClient.get<any>(`${this.basePath}/statistics`);
  }

  /**
   * Get tenant modules
   */
  async getModules(tenantId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/api/admin/tenant-modules/${tenantId}`);
  }

  /**
   * Toggle tenant module
   */
  async toggleModule(tenantId: string, moduleId: string): Promise<boolean> {
    return apiClient.post<boolean>(`/api/admin/tenant-modules/${tenantId}/toggle/${moduleId}`);
  }

  /**
   * Get tenant users
   */
  async getUsers(tenantId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/api/tenant/users`, { tenantId });
  }

  /**
   * Get tenant billing history
   */
  async getBillingHistory(tenantId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/api/master/invoices`, { tenantId });
  }

  /**
   * Get tenant activity logs
   */
  async getActivityLogs(tenantId: string, days: number = 30): Promise<any[]> {
    return apiClient.get<any[]>(`/api/admin/logs`, { 
      tenantId, 
      days,
      type: 'activity' 
    });
  }
}

// Export singleton instance
export const tenantService = new TenantService();