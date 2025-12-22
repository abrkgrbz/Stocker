/**
 * License Manager
 *
 * Handles license verification, activation, and feature gating.
 * Implements offline activation with hardware locking.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';
import { generateMachineId, verifyMachineId, getMachineIdForDisplay } from './machine-id';
import { verifySignature, sha256, deriveDatabaseKey, constantTimeCompare } from './crypto';

// ============================================
// Types
// ============================================

export interface LicenseModules {
  inventory: boolean;
  sales: boolean;
  crm: boolean;
  hr: boolean;
  finance: boolean;
  purchase: boolean;
}

export interface LicenseLimits {
  maxUsers: number;
  maxProducts: number;
  maxWarehouses: number;
}

export interface LicensePayload {
  // Identification
  lid: string;              // License ID
  mid: string;              // Machine ID
  cid: string;              // Customer ID
  cname: string;            // Customer Name

  // Validity
  iat: number;              // Issued At (Unix timestamp)
  exp: number;              // Expiration (Unix timestamp)

  // Features
  modules: LicenseModules;

  // Limits
  limits: LicenseLimits;

  // Type
  type: 'trial' | 'standard' | 'professional' | 'enterprise';
}

export interface License {
  payload: LicensePayload;
  signature: string;
  raw: string;
}

export interface LicenseStatus {
  isValid: boolean;
  isExpired: boolean;
  isMachineMatch: boolean;
  daysRemaining: number;
  error?: string;
  license?: LicensePayload;
}

export interface ActivationRequest {
  machineId: string;
  customerName: string;
  customerEmail: string;
  requestCode: string;
}

// ============================================
// Constants
// ============================================

// Ed25519 Public Key (REPLACE WITH YOUR ACTUAL PUBLIC KEY)
// Generate with: generateKeyPair() from crypto.ts
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAExamplePublicKeyHereYouNeedToReplaceThisWithReal=
-----END PUBLIC KEY-----`;

// License file path
const LICENSE_FILE = 'license.lic';

// Grace period after expiration (days)
const GRACE_PERIOD_DAYS = 7;

// ============================================
// License Manager Class
// ============================================

export class LicenseManager {
  private license: License | null = null;
  private licensePath: string;
  private databaseKey: Buffer | null = null;

  constructor() {
    this.licensePath = join(app.getPath('userData'), LICENSE_FILE);
  }

  // ============================================
  // License Loading & Verification
  // ============================================

  /**
   * Load and verify license from disk
   */
  async loadLicense(): Promise<LicenseStatus> {
    try {
      // Check if license file exists
      if (!existsSync(this.licensePath)) {
        return {
          isValid: false,
          isExpired: false,
          isMachineMatch: false,
          daysRemaining: 0,
          error: 'License file not found. Please activate your license.',
        };
      }

      // Read license file
      const licenseData = readFileSync(this.licensePath, 'utf8');

      // Parse license
      const parseResult = this.parseLicense(licenseData);
      if (!parseResult.success) {
        return {
          isValid: false,
          isExpired: false,
          isMachineMatch: false,
          daysRemaining: 0,
          error: parseResult.error,
        };
      }

      this.license = parseResult.license!;

      // Verify signature
      const signatureValid = this.verifyLicenseSignature();
      if (!signatureValid) {
        return {
          isValid: false,
          isExpired: false,
          isMachineMatch: false,
          daysRemaining: 0,
          error: 'Invalid license signature. License may have been tampered with.',
        };
      }

      // Verify machine ID
      const machineMatch = verifyMachineId(this.license.payload.mid);
      if (!machineMatch) {
        return {
          isValid: false,
          isExpired: false,
          isMachineMatch: false,
          daysRemaining: 0,
          error: 'License is bound to a different machine. Please contact support.',
        };
      }

      // Check expiration
      const now = Date.now() / 1000;
      const expiration = this.license.payload.exp;
      const daysRemaining = Math.ceil((expiration - now) / (24 * 60 * 60));

      if (now > expiration) {
        // Check grace period
        const gracePeriodEnd = expiration + (GRACE_PERIOD_DAYS * 24 * 60 * 60);

        if (now > gracePeriodEnd) {
          return {
            isValid: false,
            isExpired: true,
            isMachineMatch: true,
            daysRemaining: daysRemaining,
            error: 'License has expired. Please renew your license.',
            license: this.license.payload,
          };
        }

        // Within grace period
        return {
          isValid: true, // Still valid during grace period
          isExpired: true,
          isMachineMatch: true,
          daysRemaining: daysRemaining,
          error: `License expired ${Math.abs(daysRemaining)} days ago. Grace period ends in ${GRACE_PERIOD_DAYS + daysRemaining} days.`,
          license: this.license.payload,
        };
      }

      // Derive database key
      this.databaseKey = deriveDatabaseKey(
        this.license.signature,
        this.license.payload.mid,
        this.license.payload.cid
      );

      return {
        isValid: true,
        isExpired: false,
        isMachineMatch: true,
        daysRemaining,
        license: this.license.payload,
      };

    } catch (error) {
      return {
        isValid: false,
        isExpired: false,
        isMachineMatch: false,
        daysRemaining: 0,
        error: `Failed to load license: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Parse license from string
   */
  private parseLicense(licenseData: string): { success: boolean; license?: License; error?: string } {
    try {
      // License format: BASE64(JSON { payload: {...}, signature: "..." })
      const decoded = Buffer.from(licenseData.trim(), 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);

      if (!parsed.payload || !parsed.signature) {
        return { success: false, error: 'Invalid license format' };
      }

      // Validate payload structure
      const payload = parsed.payload as LicensePayload;
      if (!payload.lid || !payload.mid || !payload.cid || !payload.exp) {
        return { success: false, error: 'Missing required license fields' };
      }

      return {
        success: true,
        license: {
          payload,
          signature: parsed.signature,
          raw: licenseData.trim(),
        },
      };
    } catch {
      return { success: false, error: 'Failed to parse license data' };
    }
  }

  /**
   * Verify license signature
   */
  private verifyLicenseSignature(): boolean {
    if (!this.license) return false;

    try {
      // The signature is over the stringified payload
      const payloadJson = JSON.stringify(this.license.payload);
      const signatureBuffer = Buffer.from(this.license.signature, 'base64');

      return verifySignature(payloadJson, signatureBuffer, PUBLIC_KEY);
    } catch {
      return false;
    }
  }

  // ============================================
  // Activation
  // ============================================

  /**
   * Generate activation request for offline activation
   */
  generateActivationRequest(customerName: string, customerEmail: string): ActivationRequest {
    const machineId = getMachineIdForDisplay();

    // Create a request code that includes all info
    const requestData = {
      mid: machineId,
      name: customerName,
      email: customerEmail,
      ts: Date.now(),
    };

    const requestCode = Buffer.from(JSON.stringify(requestData))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return {
      machineId,
      customerName,
      customerEmail,
      requestCode,
    };
  }

  /**
   * Activate with license key
   */
  async activateLicense(licenseKey: string): Promise<LicenseStatus> {
    try {
      // Normalize license key (remove whitespace)
      const normalizedKey = licenseKey.replace(/\s/g, '');

      // Parse the license
      const parseResult = this.parseLicense(normalizedKey);
      if (!parseResult.success) {
        return {
          isValid: false,
          isExpired: false,
          isMachineMatch: false,
          daysRemaining: 0,
          error: parseResult.error,
        };
      }

      // Verify signature before saving
      this.license = parseResult.license!;
      if (!this.verifyLicenseSignature()) {
        this.license = null;
        return {
          isValid: false,
          isExpired: false,
          isMachineMatch: false,
          daysRemaining: 0,
          error: 'Invalid license signature',
        };
      }

      // Verify machine ID
      if (!verifyMachineId(this.license.payload.mid)) {
        this.license = null;
        return {
          isValid: false,
          isExpired: false,
          isMachineMatch: false,
          daysRemaining: 0,
          error: 'License is for a different machine',
        };
      }

      // Save license file
      const dir = app.getPath('userData');
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(this.licensePath, normalizedKey, { mode: 0o600 });

      // Load and return status
      return this.loadLicense();

    } catch (error) {
      return {
        isValid: false,
        isExpired: false,
        isMachineMatch: false,
        daysRemaining: 0,
        error: `Activation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // ============================================
  // Feature Checking
  // ============================================

  /**
   * Check if a specific module is enabled
   */
  isModuleEnabled(module: keyof LicenseModules): boolean {
    if (!this.license) return false;
    return this.license.payload.modules[module] === true;
  }

  /**
   * Get all enabled modules
   */
  getEnabledModules(): LicenseModules {
    if (!this.license) {
      return {
        inventory: false,
        sales: false,
        crm: false,
        hr: false,
        finance: false,
        purchase: false,
      };
    }
    return { ...this.license.payload.modules };
  }

  /**
   * Get license limits
   */
  getLimits(): LicenseLimits {
    if (!this.license) {
      return {
        maxUsers: 0,
        maxProducts: 0,
        maxWarehouses: 0,
      };
    }
    return { ...this.license.payload.limits };
  }

  /**
   * Get maximum concurrent seats (users) allowed
   * Used by network seat enforcement
   */
  getMaxSeats(): number {
    if (!this.license) {
      return 1; // Default to 1 for standalone
    }
    return this.license.payload.limits.maxUsers;
  }

  /**
   * Get license type
   */
  getLicenseType(): string {
    return this.license?.payload.type || 'none';
  }

  /**
   * Get customer info
   */
  getCustomerInfo(): { id: string; name: string } | null {
    if (!this.license) return null;
    return {
      id: this.license.payload.cid,
      name: this.license.payload.cname,
    };
  }

  // ============================================
  // Database Key
  // ============================================

  /**
   * Get derived database encryption key
   */
  getDatabaseKey(): Buffer | null {
    return this.databaseKey;
  }

  /**
   * Get database key as hex string (for SQLCipher)
   */
  getDatabaseKeyHex(): string | null {
    if (!this.databaseKey) return null;
    return this.databaseKey.toString('hex');
  }

  // ============================================
  // Utilities
  // ============================================

  /**
   * Get machine ID for display
   */
  getMachineId(): string {
    return getMachineIdForDisplay();
  }

  /**
   * Check if license is loaded
   */
  isLicenseLoaded(): boolean {
    return this.license !== null;
  }

  /**
   * Get license expiration date
   */
  getExpirationDate(): Date | null {
    if (!this.license) return null;
    return new Date(this.license.payload.exp * 1000);
  }

  /**
   * Get days remaining
   */
  getDaysRemaining(): number {
    if (!this.license) return 0;
    const now = Date.now() / 1000;
    return Math.ceil((this.license.payload.exp - now) / (24 * 60 * 60));
  }

  /**
   * Revoke/clear license (for admin)
   */
  revokeLicense(): void {
    this.license = null;
    this.databaseKey = null;

    try {
      if (existsSync(this.licensePath)) {
        writeFileSync(this.licensePath, '', { mode: 0o600 });
      }
    } catch {
      // Ignore errors
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let instance: LicenseManager | null = null;

export function getLicenseManager(): LicenseManager {
  if (!instance) {
    instance = new LicenseManager();
  }
  return instance;
}

export default LicenseManager;
