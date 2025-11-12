import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';

import logger from '../utils/logger';
/**
 * TOTP (Time-based One-Time Password) utility functions
 * Used for Google Authenticator, Microsoft Authenticator, etc.
 */

export interface TOTPSetupData {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}

export interface BackupCode {
  code: string;
  used: boolean;
}

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(userEmail: string, issuer: string = 'Stocker ERP'): TOTPSetupData {
  // Create a new TOTP instance
  const totp = new TOTP({
    issuer,
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });

  // Generate secret
  const secret = totp.secret.base32;

  // Generate OTP Auth URL for QR code
  const otpauthUrl = totp.toString();

  // Manual entry key (formatted for easier typing)
  const manualEntryKey = secret.match(/.{1,4}/g)?.join(' ') || secret;

  return {
    secret,
    qrCodeUrl: otpauthUrl,
    manualEntryKey,
  };
}

/**
 * Generate QR code image as data URL
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    logger.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify a TOTP token
 */
export function verifyTOTPToken(secret: string, token: string): boolean {
  try {
    const totp = new TOTP({
      secret: Secret.fromBase32(secret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    // Verify with 1 period tolerance (allows ±30 seconds)
    const delta = totp.validate({ token, window: 1 });

    return delta !== null;
  } catch (error) {
    logger.error('TOTP verification failed:', error);
    return false;
  }
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 10): BackupCode[] {
  const codes: BackupCode[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Array.from({ length: 8 }, () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars (0,O,1,I)
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');

    // Format as XXXX-XXXX
    const formatted = `${code.slice(0, 4)}-${code.slice(4)}`;

    codes.push({
      code: formatted,
      used: false,
    });
  }

  return codes;
}

/**
 * Verify a backup code
 */
export function verifyBackupCode(
  backupCodes: BackupCode[],
  inputCode: string
): { valid: boolean; updatedCodes?: BackupCode[] } {
  const normalizedInput = inputCode.replace(/[-\s]/g, '').toUpperCase();

  const codeIndex = backupCodes.findIndex(
    (bc) => bc.code.replace('-', '') === normalizedInput && !bc.used
  );

  if (codeIndex === -1) {
    return { valid: false };
  }

  // Mark code as used
  const updatedCodes = [...backupCodes];
  updatedCodes[codeIndex] = { ...updatedCodes[codeIndex], used: true };

  return { valid: true, updatedCodes };
}

/**
 * Count remaining backup codes
 */
export function getRemainingBackupCodes(backupCodes: BackupCode[]): number {
  return backupCodes.filter((bc) => !bc.used).length;
}
