/**
 * Tenant Settings Service
 * Handles tenant configuration and settings management
 */

import { apiClient } from '../client';

// =====================================
// TYPES
// =====================================

export interface TenantSettingsDto {
  id: string;
  tenantId: string;
  companyName: string;
  taxNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  language: string;
  dateFormat: string;
  currency: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTenantSettingsRequest {
  companyName?: string;
  taxNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  currency?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface TenantStatsDto {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalDepartments: number;
  storageUsedGB: number;
  storageQuotaGB: number;
  activeModules: number;
  totalModules: number;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================================
// SERVICE
// =====================================

export const TenantSettingsService = {
  /**
   * Get tenant settings
   * Note: Backend uses key-value settings structure
   */
  async getSettings(): Promise<TenantSettingsDto> {
    const response = await apiClient.get<ApiResponseWrapper<TenantSettingsDto>>(
      '/api/tenant/Settings'
    );
    return (response as any).data || response;
  },

  /**
   * Update tenant settings
   */
  async updateSettings(data: UpdateTenantSettingsRequest): Promise<TenantSettingsDto> {
    const response = await apiClient.put<ApiResponseWrapper<TenantSettingsDto>>(
      '/api/tenant/Settings',
      data
    );
    return (response as any).data || response;
  },

  /**
   * Get tenant statistics (uses storage usage endpoint)
   */
  async getStats(): Promise<TenantStatsDto> {
    try {
      // Get storage usage from dedicated endpoint
      const storageResponse = await apiClient.get<ApiResponseWrapper<{
        usedGB: number;
        quotaGB: number;
        UsedGB?: number;
        QuotaGB?: number;
      }>>('/api/tenant/Storage/usage');

      const storageData = (storageResponse as any).data || storageResponse;

      // Return stats with storage info
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalRoles: 0,
        totalDepartments: 0,
        storageUsedGB: storageData?.usedGB ?? storageData?.UsedGB ?? 0,
        storageQuotaGB: storageData?.quotaGB ?? storageData?.QuotaGB ?? 10,
        activeModules: 0,
        totalModules: 0,
      };
    } catch {
      // Return default values if storage endpoint fails
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalRoles: 0,
        totalDepartments: 0,
        storageUsedGB: 0,
        storageQuotaGB: 10,
        activeModules: 0,
        totalModules: 0,
      };
    }
  },

  /**
   * Upload tenant logo
   */
  async uploadLogo(file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponseWrapper<{ logoUrl: string }>>(
      '/api/tenant/Storage/logo',
      formData
    );
    return (response as any).data || response;
  },

  /**
   * Delete tenant logo
   */
  async deleteLogo(): Promise<void> {
    await apiClient.delete('/api/tenant/Storage/logo');
  },
};

export default TenantSettingsService;
