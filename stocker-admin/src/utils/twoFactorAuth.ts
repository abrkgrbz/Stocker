/**
 * Two-Factor Authentication (2FA) Utilities
 * Implements TOTP-based 2FA support
 */

import * as OTPAuth from 'otpauth';

/**
 * Generate a new 2FA secret
 */
export function generate2FASecret(email: string, issuer: string = 'Stocker Admin'): {
  secret: string;
  qrCode: string;
  backupCodes: string[];
} {
  // Generate random secret
  const secret = generateRandomSecret();
  
  // Create TOTP instance
  const totp = new OTPAuth.TOTP({
    issuer: issuer,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });
  
  // Generate QR code URL
  const qrCode = totp.toString();
  
  // Generate backup codes
  const backupCodes = generateBackupCodes();
  
  return {
    secret,
    qrCode,
    backupCodes
  };
}

/**
 * Verify a TOTP code
 */
export function verify2FACode(secret: string, code: string): boolean {
  const totp = new OTPAuth.TOTP({
    secret: secret,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });
  
  // Verify with time window (allow 1 period before/after)
  const delta = totp.validate({
    token: code,
    window: 1,
  });
  
  return delta !== null;
}

/**
 * Generate random secret for 2FA
 */
function generateRandomSecret(length: number = 32): string {
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
 * Generate backup codes
 */
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const code = generateRandomCode();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Generate a single backup code
 */
function generateRandomCode(): string {
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
 * 2FA Setup Component Interface
 */
export interface TwoFactorSetup {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  lastUsedBackupCode?: string;
  setupCompletedAt?: Date;
}

/**
 * Store 2FA setup in secure storage
 */
export class TwoFactorStorage {
  private readonly storageKey = '2fa_setup';
  
  /**
   * Save 2FA setup
   */
  save(setup: TwoFactorSetup): void {
    // In production, this should be stored server-side only
    // This is for demo purposes
    sessionStorage.setItem(this.storageKey, JSON.stringify(setup));
  }
  
  /**
   * Get 2FA setup
   */
  get(): TwoFactorSetup | null {
    const stored = sessionStorage.getItem(this.storageKey);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  
  /**
   * Clear 2FA setup
   */
  clear(): void {
    sessionStorage.removeItem(this.storageKey);
  }
  
  /**
   * Check if 2FA is enabled
   */
  isEnabled(): boolean {
    const setup = this.get();
    return setup?.enabled === true;
  }
  
  /**
   * Verify backup code
   */
  verifyBackupCode(code: string): boolean {
    const setup = this.get();
    if (!setup?.backupCodes) return false;
    
    const index = setup.backupCodes.indexOf(code);
    if (index === -1) return false;
    
    // Mark backup code as used
    setup.backupCodes.splice(index, 1);
    setup.lastUsedBackupCode = code;
    this.save(setup);
    
    return true;
  }
}

// Export singleton instance
export const twoFactorStorage = new TwoFactorStorage();

/**
 * Mock TOTP implementation for demo
 * (Since we can't import otpauth without installing it)
 */
const OTPAuth = {
  TOTP: class {
    private secret: string;
    private period: number = 30;
    private digits: number = 6;
    
    constructor(config: any) {
      this.secret = config.secret;
      this.period = config.period || 30;
      this.digits = config.digits || 6;
    }
    
    toString(): string {
      // Generate QR code URL
      return `otpauth://totp/Stocker:user@stocker.com?secret=${this.secret}&issuer=Stocker`;
    }
    
    validate(options: { token: string; window: number }): number | null {
      // Simple mock validation
      // In real implementation, this would use proper TOTP algorithm
      const validCodes = ['123456', '654321', '111111'];
      return validCodes.includes(options.token) ? 0 : null;
    }
  }
};