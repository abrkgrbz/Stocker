/**
 * Tenant Repository Interface
 * Defines contract for data access layer
 */

import { Tenant } from '../entities/Tenant';

export interface ITenantFilters {
  status?: string;
  plan?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IPaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Repository interface for Tenant data access
 * Implementation will be in infrastructure layer
 */
export interface ITenantRepository {
  /**
   * Get tenant by ID
   */
  getById(id: string): Promise<Tenant | null>;

  /**
   * Get all tenants with optional filters and pagination
   */
  getAll(
    filters?: ITenantFilters,
    pagination?: IPaginationParams
  ): Promise<IPaginatedResult<Tenant>>;

  /**
   * Get tenant by subdomain
   */
  getBySubdomain(subdomain: string): Promise<Tenant | null>;

  /**
   * Create a new tenant
   */
  create(tenant: Tenant): Promise<Tenant>;

  /**
   * Update an existing tenant
   */
  update(id: string, tenant: Partial<Tenant>): Promise<Tenant>;

  /**
   * Delete a tenant (soft delete)
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if subdomain is available
   */
  isSubdomainAvailable(subdomain: string): Promise<boolean>;

  /**
   * Get tenant statistics
   */
  getStatistics(): Promise<{
    total: number;
    active: number;
    trial: number;
    suspended: number;
    byPlan: Record<string, number>;
  }>;

  /**
   * Get tenants expiring soon
   */
  getExpiringTenants(days: number): Promise<Tenant[]>;

  /**
   * Get top tenants by revenue
   */
  getTopTenantsByRevenue(limit: number): Promise<Tenant[]>;

  /**
   * Search tenants
   */
  search(query: string): Promise<Tenant[]>;

  /**
   * Batch operations
   */
  batchUpdate(ids: string[], updates: Partial<Tenant>): Promise<number>;
  batchDelete(ids: string[]): Promise<number>;
}