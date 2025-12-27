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
   */
  async getSettings(): Promise<TenantSettingsDto> {
    const response = await apiClient.get<ApiResponseWrapper<TenantSettingsDto>>(
      '/tenant/settings'
    );
    return (response as any).data || response;
  },

  /**
   * Update tenant settings
   */
  async updateSettings(data: UpdateTenantSettingsRequest): Promise<TenantSettingsDto> {
    const response = await apiClient.put<ApiResponseWrapper<TenantSettingsDto>>(
      '/tenant/settings',
      data
    );
    return (response as any).data || response;
  },

  /**
   * Get tenant statistics
   */
  async getStats(): Promise<TenantStatsDto> {
    const response = await apiClient.get<ApiResponseWrapper<TenantStatsDto>>(
      '/tenant/stats'
    );
    return (response as any).data || response;
  },

  /**
   * Upload tenant logo
   */
  async uploadLogo(file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponseWrapper<{ logoUrl: string }>>(
      '/tenant/logo',
      formData
    );
    return (response as any).data || response;
  },

  /**
   * Delete tenant logo
   */
  async deleteLogo(): Promise<void> {
    await apiClient.delete('/tenant/logo');
  },
};

export default TenantSettingsService;
