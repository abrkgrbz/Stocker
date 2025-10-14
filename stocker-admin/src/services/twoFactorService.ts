/**
 * Two-Factor Authentication Service
 * Handles TOTP generation, verification, and QR codes
 */

import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { apiClient } from '../infrastructure/api/ApiClient';
import { API_ENDPOINTS } from '../constants';

export interface ITwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface ITwoFactorStatus {
  enabled: boolean;
  method: '2fa' | 'sms' | 'email' | null;
  lastUsed?: Date;
  backupCodesRemaining?: number;
}

export interface IVerifyTOTPRequest {
  token: string;
  secret?: string;
  rememberDevice?: boolean;
}

/**
 * Two-Factor Authentication Service
 */
export class TwoFactorService {
  private readonly issuer = 'Stocker Admin';
  private readonly algorithm = 'SHA1';
  private readonly digits = 6;
  private readonly period = 30;

  /**
   * Generate a new TOTP secret and QR code
   */
  async setupTwoFactor(userEmail: string): Promise<ITwoFactorSetup> {
    // Generate a random secret
    const secret = this.generateSecret();

    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      issuer: this.issuer,
      label: userEmail,
      algorithm: this.algorithm,
      digits: this.digits,
      period: this.period,
      secret: secret
    });

    // Generate QR code
    const otpauth = totp.toString();
    const qrCodeUrl = await this.generateQRCode(otpauth);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Format manual entry key for display
    const manualEntryKey = this.formatSecretForManualEntry(secret);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
      manualEntryKey
    };
  }

  /**
   * Generate a random base32 secret
   */
  private generateSecret(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      secret += charset[randomValues[i] % charset.length];
    }
    
    return secret;
  }

  /**
   * Generate QR code as data URL
   */
  private async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = this.generateBackupCode();
      codes.push(code);
    }
    
    return codes;
  }

  /**
   * Generate a single backup code
   */
  private generateBackupCode(): string {
    const randomValues = new Uint8Array(4);
    crypto.getRandomValues(randomValues);
    
    const code = Array.from(randomValues)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    
    // Format as XXXX-XXXX
    return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
  }

  /**
   * Format secret for manual entry (with spaces)
   */
  private formatSecretForManualEntry(secret: string): string {
    return secret.match(/.{1,4}/g)?.join(' ') || secret;
  }

  /**
   * Verify TOTP token
   */
  verifyTOTP(token: string, secret: string): boolean {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: this.issuer,
        label: 'User',
        algorithm: this.algorithm,
        digits: this.digits,
        period: this.period,
        secret: secret
      });

      // Validate with window of 1 (allows previous and next token)
      const delta = totp.validate({ token, window: 1 });
      
      return delta !== null;
    } catch (error) {
      console.error('TOTP verification failed:', error);
      return false;
    }
  }

  /**
   * Generate current TOTP token (for testing/demo)
   */
  generateTOTP(secret: string): string {
    const totp = new OTPAuth.TOTP({
      issuer: this.issuer,
      label: 'User',
      algorithm: this.algorithm,
      digits: this.digits,
      period: this.period,
      secret: secret
    });

    return totp.generate();
  }

  /**
   * Get time remaining for current TOTP
   */
  getTimeRemaining(): number {
    const period = this.period;
    const now = Date.now() / 1000;
    return period - (now % period);
  }

  // API Methods

  /**
   * Enable 2FA for current user
   */
  async enable2FA(secret: string, token: string, backupCodes: string[]): Promise<boolean> {
    try {
      const response = await apiClient.post('/api/master/auth/enable-2fa', {
        code: token,
        secret
      });

      return response.success;
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      return false;
    }
  }

  /**
   * Disable 2FA for current user
   */
  async disable2FA(password: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/api/master/auth/disable-2fa', {
        code: password
      });

      return response.success;
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      return false;
    }
  }

  /**
   * Get 2FA status for current user
   */
  async get2FAStatus(): Promise<ITwoFactorStatus> {
    try {
      const response = await apiClient.get<{ enabled: boolean; backupCodesRemaining: number }>('/api/master/auth/2fa-status');

      return {
        enabled: response.data?.enabled || false,
        method: response.data?.enabled ? '2fa' : null,
        backupCodesRemaining: response.data?.backupCodesRemaining
      };
    } catch (error) {
      console.error('Failed to get 2FA status:', error);
      return {
        enabled: false,
        method: null
      };
    }
  }

  /**
   * Verify 2FA token during login
   */
  async verifyLoginToken(token: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/api/auth/2fa/verify', {
        token
      });
      
      return response.success;
    } catch (error) {
      console.error('Failed to verify 2FA token:', error);
      return false;
    }
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(password: string): Promise<string[]> {
    try {
      const response = await apiClient.post<{ backupCodes: string[] }>(
        '/api/auth/2fa/regenerate-backup-codes',
        { password }
      );
      
      return response.data?.backupCodes || [];
    } catch (error) {
      console.error('Failed to regenerate backup codes:', error);
      return [];
    }
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(code: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/api/auth/2fa/verify-backup', {
        code
      });
      
      return response.success;
    } catch (error) {
      console.error('Failed to verify backup code:', error);
      return false;
    }
  }
}

// Export singleton instance
export const twoFactorService = new TwoFactorService();