import { apiClient } from '../client';
import type { ApiResponse } from '../types';

/**
 * Authentication Request/Response Types
 */
export interface CheckEmailRequest {
  email: string;
}

export interface CheckEmailResponse {
  exists: boolean;
  tenant: {
    code: string;
    name: string;
    signature: string;
    timestamp: number;
  } | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantCode: string;
  tenantSignature: string;
  tenantTimestamp: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  requires2FA: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  tenant: {
    id: string;
    code: string;
    name: string;
  };
}

export interface Verify2FARequest {
  email: string;
  code: string;
  backupCode?: boolean;
}

export interface Verify2FAResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Setup2FAResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ValidateResetTokenRequest {
  token: string;
}

export interface ValidateResetTokenResponse {
  valid: boolean;
  expiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * Authentication Service
 */
export class AuthService {
  /**
   * Check if email exists and get tenant info
   */
  async checkEmail(email: string): Promise<ApiResponse<CheckEmailResponse>> {
    return apiClient.post<CheckEmailResponse>('/auth/check-email', { email });
  }

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/login', data);
  }

  /**
   * Verify 2FA code
   */
  async verify2FA(data: Verify2FARequest): Promise<ApiResponse<Verify2FAResponse>> {
    return apiClient.post<Verify2FAResponse>('/auth/verify-2fa', data);
  }

  /**
   * Setup 2FA for user
   */
  async setup2FA(): Promise<ApiResponse<Setup2FAResponse>> {
    return apiClient.post<Setup2FAResponse>('/auth/setup-2fa');
  }

  /**
   * Enable 2FA after verification
   */
  async enable2FA(code: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/auth/enable-2fa', { code });
  }

  /**
   * Disable 2FA
   */
  async disable2FA(code: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/auth/disable-2fa', { code });
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/auth/forgot-password', { email });
  }

  /**
   * Validate password reset token
   */
  async validateResetToken(token: string): Promise<ApiResponse<ValidateResetTokenResponse>> {
    return apiClient.get<ValidateResetTokenResponse>('/auth/validate-reset-token', { token });
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/auth/reset-password', data);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh-token', { refreshToken });
  }

  /**
   * Logout
   */
  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/auth/logout');
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<LoginResponse['user']>> {
    return apiClient.get('/auth/profile');
  }
}

/**
 * Export singleton instance
 */
export const authService = new AuthService();
