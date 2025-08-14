import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/types';

export interface SystemSettings {
  id: string;
  category: string;
  key: string;
  value: any;
  displayName: string;
  description?: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  isPublic: boolean;
  isEditable: boolean;
  validationRules?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  id: string;
  tenantId: string;
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  taxNumber?: string;
  taxOffice?: string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  invoicePrefix?: string;
  invoiceStartNumber?: number;
  emailSettings?: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpSecure?: boolean;
    fromEmail?: string;
    fromName?: string;
  };
  notificationSettings?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
}

export interface UpdateSettingsDto {
  value: any;
  description?: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays?: number;
  preventReuse?: number;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordPolicy: PasswordPolicy;
  ipWhitelist?: string[];
  ipBlacklist?: string[];
}

class SettingsService {
  private basePath = '/api/settings';

  // System Settings
  async getSystemSettings(category?: string): Promise<ApiResponse<SystemSettings[]>> {
    const params = category ? { category } : undefined;
    const response = await apiClient.get(`${this.basePath}/system`, { params });
    return response.data;
  }

  async getSettingByKey(key: string): Promise<ApiResponse<SystemSettings>> {
    const response = await apiClient.get(`${this.basePath}/system/${key}`);
    return response.data;
  }

  async updateSystemSetting(
    key: string,
    data: UpdateSettingsDto
  ): Promise<ApiResponse<SystemSettings>> {
    const response = await apiClient.put(`${this.basePath}/system/${key}`, data);
    return response.data;
  }

  async bulkUpdateSettings(
    settings: Array<{ key: string; value: any }>
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.put(`${this.basePath}/system/bulk`, { settings });
    return response.data;
  }

  // Tenant Settings
  async getTenantSettings(tenantId?: string): Promise<ApiResponse<TenantSettings>> {
    const path = tenantId 
      ? `/api/tenants/${tenantId}/settings`
      : `${this.basePath}/tenant`;
    const response = await apiClient.get(path);
    return response.data;
  }

  async updateTenantSettings(
    data: Partial<TenantSettings>,
    tenantId?: string
  ): Promise<ApiResponse<TenantSettings>> {
    const path = tenantId
      ? `/api/tenants/${tenantId}/settings`
      : `${this.basePath}/tenant`;
    const response = await apiClient.put(path, data);
    return response.data;
  }

  // Security Settings
  async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    const response = await apiClient.get(`${this.basePath}/security`);
    return response.data;
  }

  async updateSecuritySettings(
    data: Partial<SecuritySettings>
  ): Promise<ApiResponse<SecuritySettings>> {
    const response = await apiClient.put(`${this.basePath}/security`, data);
    return response.data;
  }

  // Email Settings
  async testEmailSettings(settings: any): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const response = await apiClient.post(`${this.basePath}/email/test`, settings);
    return response.data;
  }

  // Backup & Restore
  async createBackup(): Promise<ApiResponse<{ backupId: string; path: string }>> {
    const response = await apiClient.post(`${this.basePath}/backup`);
    return response.data;
  }

  async restoreBackup(backupId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`${this.basePath}/restore/${backupId}`);
    return response.data;
  }

  async getBackups(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get(`${this.basePath}/backups`);
    return response.data;
  }

  // Maintenance Mode
  async getMaintenanceMode(): Promise<ApiResponse<{ enabled: boolean; message?: string }>> {
    const response = await apiClient.get(`${this.basePath}/maintenance`);
    return response.data;
  }

  async setMaintenanceMode(
    enabled: boolean,
    message?: string
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`${this.basePath}/maintenance`, { enabled, message });
    return response.data;
  }

  // Reset Settings
  async resetToDefaults(category?: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`${this.basePath}/reset`, { category });
    return response.data;
  }
}

export const settingsService = new SettingsService();