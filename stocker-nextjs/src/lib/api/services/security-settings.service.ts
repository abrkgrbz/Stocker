import { apiClient } from '../client';
import type { ApiResponse } from '../types';

/**
 * Security Settings Types
 */

export interface PasswordPolicyDto {
  minPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  preventPasswordReuse: number;
}

export interface TwoFactorSettingsDto {
  require2FA: boolean;
  allow2FA: boolean;
  trustedDevices: boolean;
  trustedDeviceDays: number;
}

export interface SessionSettingsDto {
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
  requireReauthForCriticalOps: boolean;
}

export interface ApiSecuritySettingsDto {
  allowApiAccess: boolean;
  requireApiKey: boolean;
  apiKeyExpiryDays: number;
  rateLimitEnabled: boolean;
  rateLimitRequestsPerHour: number;
}

export interface SecuritySettingsDto {
  id: string;
  tenantId: string;
  passwordPolicy: PasswordPolicyDto;
  twoFactorSettings: TwoFactorSettingsDto;
  sessionSettings: SessionSettingsDto;
  apiSecurity: ApiSecuritySettingsDto;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface UpdatePasswordPolicyRequest {
  minPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  preventPasswordReuse: number;
}

export interface UpdateTwoFactorSettingsRequest {
  require2FA: boolean;
  allow2FA: boolean;
  trustedDevices: boolean;
  trustedDeviceDays: number;
}

export interface UpdateSessionSettingsRequest {
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
  requireReauthForCriticalOps: boolean;
}

export interface UpdateApiSecurityRequest {
  allowApiAccess: boolean;
  requireApiKey: boolean;
  apiKeyExpiryDays: number;
  rateLimitEnabled: boolean;
  rateLimitRequestsPerHour: number;
}

/**
 * Security Settings Service
 * Manages tenant security configurations including password policies, 2FA, sessions, and API security
 */
export class SecuritySettingsService {
  /**
   * Get all security settings for the current tenant
   */
  async getSecuritySettings(): Promise<ApiResponse<SecuritySettingsDto>> {
    return apiClient.get<SecuritySettingsDto>('/api/tenant/securitysettings');
  }

  /**
   * Update password policy settings
   * Requires Admin role
   */
  async updatePasswordPolicy(data: UpdatePasswordPolicyRequest): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>('/api/tenant/securitysettings/password-policy', data);
  }

  /**
   * Update two-factor authentication settings
   * Requires Admin role
   */
  async updateTwoFactorSettings(data: UpdateTwoFactorSettingsRequest): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>('/api/tenant/securitysettings/two-factor', data);
  }

  /**
   * Update session management settings
   * Requires Admin role
   */
  async updateSessionSettings(data: UpdateSessionSettingsRequest): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>('/api/tenant/securitysettings/session', data);
  }

  /**
   * Update API security settings
   * Requires Admin role
   */
  async updateApiSecurity(data: UpdateApiSecurityRequest): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>('/api/tenant/securitysettings/api-security', data);
  }
}

/**
 * Export singleton instance
 */
export const securitySettingsService = new SecuritySettingsService();
