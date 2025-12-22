/**
 * Security Module Index
 *
 * Central export for all security-related functionality.
 */

// Machine ID
export {
  generateMachineId,
  verifyMachineId,
  getMachineIdForDisplay,
  type MachineIdResult,
  type HardwareInfo,
} from './machine-id';

// Cryptography
export {
  deriveKey,
  encrypt,
  decrypt,
  sha256,
  hmacSha256,
  generateKeyPair,
  signData,
  verifySignature,
  deriveDatabaseKey,
  constantTimeCompare,
  generateSecureId,
} from './crypto';

// License Management
export {
  LicenseManager,
  getLicenseManager,
  type License,
  type LicensePayload,
  type LicenseStatus,
  type LicenseModules,
  type LicenseLimits,
  type ActivationRequest,
} from './license-manager';

// Audit Logging
export {
  AuditLogger,
  getAuditLogger,
  auditLog,
  type AuditAction,
  type AuditEntry,
  type AuditLogResult,
  type ChainValidationResult,
} from './audit-logger';

// Application Hardening
export {
  blockDevTools,
  blockKeyboardShortcuts,
  verifyFileIntegrity,
  generateIntegrityHashes,
  enableAntiDebugging,
  clearSensitiveData,
  generateSecureToken,
  enforceProductionMode,
  initializeHardening,
  reportTamper,
  wasTamperDetected,
} from './hardening';

// Admin Mode
export {
  AdminModeManager,
  getAdminModeManager,
  isLicenseForceUnlocked,
  type AdminSession,
  type AdminPermission,
  type AdminAction,
  type DiagnosticsReport,
} from './admin-mode';

// Re-export database manager for convenience
export { getDatabaseManager } from '../database/prisma-client';
