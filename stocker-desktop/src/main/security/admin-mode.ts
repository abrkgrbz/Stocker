/**
 * Admin/Technician Mode
 *
 * Provides secure administrative access for technicians and support staff.
 * Features:
 * - Hidden activation via key combination
 * - TOTP or master password authentication
 * - Session timeout and activity logging
 * - Protected administrative functions
 */

import { BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron';
import { createHash, createHmac, randomBytes } from 'crypto';
import { getAuditLogger, AuditAction } from './audit-logger';
import { getDatabaseManager } from '../database/prisma-client';
import { getLicenseManager } from './license-manager';
import { getMachineIdForDisplay } from './machine-id';

// ============================================
// Types
// ============================================

export interface AdminSession {
  isActive: boolean;
  startedAt: Date | null;
  lastActivity: Date | null;
  userId: string;
  permissions: AdminPermission[];
}

export type AdminPermission =
  | 'VIEW_LOGS'
  | 'EXPORT_LOGS'
  | 'VIEW_LICENSE'
  | 'RESET_DATABASE'
  | 'FORCE_UNLOCK'
  | 'RUN_DIAGNOSTICS'
  | 'VIEW_DEBUG';

export interface AdminAction {
  action: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresConfirmation: boolean;
  requiresReason: boolean;
}

export interface DiagnosticsReport {
  timestamp: Date;
  machineId: string;
  licenseStatus: {
    isValid: boolean;
    type: string;
    daysRemaining: number;
    modules: Record<string, boolean>;
  };
  databaseStatus: {
    isOpen: boolean;
    isEncrypted: boolean;
    integrityOk: boolean;
    size?: number;
  };
  auditChainStatus: {
    isValid: boolean;
    entryCount: number;
    lastEntry?: Date;
  };
  systemInfo: {
    platform: string;
    arch: string;
    nodeVersion: string;
    electronVersion: string;
    memory: {
      total: number;
      free: number;
      used: number;
    };
  };
}

// ============================================
// Constants
// ============================================

// Session timeout in milliseconds (5 minutes)
const SESSION_TIMEOUT_MS = 5 * 60 * 1000;

// Key hold duration for activation (3 seconds)
const KEY_HOLD_DURATION_MS = 3000;

// Master password hash (SHA-256)
// IMPORTANT: Replace with actual hash in production
// This is just a placeholder - generate with: sha256('your-secure-password')
const MASTER_PASSWORD_HASH = 'placeholder-replace-with-actual-hash';

// TOTP settings
const TOTP_SECRET = 'JBSWY3DPEHPK3PXP'; // Base32 encoded secret - replace in production
const TOTP_WINDOW = 1; // Accept codes from +/- 1 time step

// Admin actions registry
const ADMIN_ACTIONS: Record<string, AdminAction> = {
  VIEW_DEBUG_LOGS: {
    action: 'VIEW_DEBUG_LOGS',
    description: 'View application debug logs',
    riskLevel: 'low',
    requiresConfirmation: false,
    requiresReason: false,
  },
  EXPORT_LOGS: {
    action: 'EXPORT_LOGS',
    description: 'Export audit logs to file',
    riskLevel: 'low',
    requiresConfirmation: false,
    requiresReason: false,
  },
  VIEW_LICENSE_DETAILS: {
    action: 'VIEW_LICENSE_DETAILS',
    description: 'View full license information',
    riskLevel: 'medium',
    requiresConfirmation: false,
    requiresReason: false,
  },
  RUN_DIAGNOSTICS: {
    action: 'RUN_DIAGNOSTICS',
    description: 'Run system diagnostics',
    riskLevel: 'low',
    requiresConfirmation: false,
    requiresReason: false,
  },
  FORCE_UNLOCK_LICENSE: {
    action: 'FORCE_UNLOCK_LICENSE',
    description: 'Temporarily bypass license check',
    riskLevel: 'high',
    requiresConfirmation: true,
    requiresReason: true,
  },
  RESET_DATABASE: {
    action: 'RESET_DATABASE',
    description: 'Delete all data and reset database',
    riskLevel: 'high',
    requiresConfirmation: true,
    requiresReason: true,
  },
  VERIFY_AUDIT_CHAIN: {
    action: 'VERIFY_AUDIT_CHAIN',
    description: 'Verify audit log integrity',
    riskLevel: 'low',
    requiresConfirmation: false,
    requiresReason: false,
  },
};

// ============================================
// Admin Mode Manager
// ============================================

export class AdminModeManager {
  private session: AdminSession;
  private mainWindow: BrowserWindow | null = null;
  private keyHoldTimer: NodeJS.Timeout | null = null;
  private keyHoldStartTime: number = 0;
  private sessionTimeoutTimer: NodeJS.Timeout | null = null;
  private debugLogs: string[] = [];
  private maxDebugLogs: number = 1000;

  constructor() {
    this.session = {
      isActive: false,
      startedAt: null,
      lastActivity: null,
      userId: '',
      permissions: [],
    };
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize admin mode with main window reference
   */
  initialize(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow;
    this.setupKeyboardListener();
    this.setupIpcHandlers();
    console.log('[AdminMode] Initialized');
  }

  /**
   * Setup keyboard listener for activation sequence
   * Ctrl+Shift+Alt+F12 held for 3 seconds
   */
  private setupKeyboardListener(): void {
    if (!this.mainWindow) return;

    this.mainWindow.webContents.on('before-input-event', (event, input) => {
      // Check for activation sequence: Ctrl+Shift+Alt+F12
      const isActivationSequence =
        input.key === 'F12' &&
        input.control &&
        input.shift &&
        input.alt &&
        input.type === 'keyDown';

      if (isActivationSequence) {
        if (!this.keyHoldTimer) {
          this.keyHoldStartTime = Date.now();
          this.keyHoldTimer = setTimeout(() => {
            this.showActivationDialog();
          }, KEY_HOLD_DURATION_MS);
        }
      }

      // Reset timer on key release
      if (input.key === 'F12' && input.type === 'keyUp') {
        if (this.keyHoldTimer) {
          clearTimeout(this.keyHoldTimer);
          this.keyHoldTimer = null;
        }
      }
    });
  }

  /**
   * Setup IPC handlers for admin functions
   */
  private setupIpcHandlers(): void {
    // Activation
    ipcMain.handle('admin:activate', async (_, password: string) => {
      return this.activate(password);
    });

    ipcMain.handle('admin:activateTotp', async (_, code: string) => {
      return this.activateWithTotp(code);
    });

    ipcMain.handle('admin:deactivate', async () => {
      return this.deactivate();
    });

    ipcMain.handle('admin:getSession', async () => {
      return this.getSessionInfo();
    });

    // Admin functions
    ipcMain.handle('admin:getDiagnostics', async () => {
      return this.runDiagnostics();
    });

    ipcMain.handle('admin:getDebugLogs', async () => {
      return this.getDebugLogs();
    });

    ipcMain.handle('admin:exportLogs', async (_, startDate?: string, endDate?: string) => {
      return this.exportAuditLogs(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
    });

    ipcMain.handle('admin:getLicenseDetails', async () => {
      return this.getLicenseDetails();
    });

    ipcMain.handle('admin:verifyAuditChain', async () => {
      return this.verifyAuditChain();
    });

    ipcMain.handle('admin:resetDatabase', async (_, reason: string) => {
      return this.resetDatabase(reason);
    });

    ipcMain.handle('admin:forceUnlockLicense', async (_, reason: string, durationMinutes: number) => {
      return this.forceUnlockLicense(reason, durationMinutes);
    });
  }

  // ============================================
  // Activation
  // ============================================

  /**
   * Show activation dialog
   */
  private showActivationDialog(): void {
    if (!this.mainWindow) return;

    // Send event to renderer to show admin login dialog
    this.mainWindow.webContents.send('admin:showLogin');

    this.addDebugLog('Admin mode activation dialog shown');
  }

  /**
   * Activate admin mode with master password
   */
  async activate(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify password
      const passwordHash = createHash('sha256').update(password).digest('hex');

      if (passwordHash !== MASTER_PASSWORD_HASH) {
        this.addDebugLog('Admin mode activation failed: invalid password');
        await this.logAdminAction('ADMIN_ACCESS', 'Admin activation failed - invalid password', false);
        return { success: false, error: 'Invalid password' };
      }

      return this.startSession('master-password');
    } catch (error) {
      return { success: false, error: 'Activation failed' };
    }
  }

  /**
   * Activate admin mode with TOTP code
   */
  async activateWithTotp(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify TOTP
      const isValid = this.verifyTotp(code);

      if (!isValid) {
        this.addDebugLog('Admin mode activation failed: invalid TOTP');
        await this.logAdminAction('ADMIN_ACCESS', 'Admin activation failed - invalid TOTP', false);
        return { success: false, error: 'Invalid code' };
      }

      return this.startSession('totp');
    } catch (error) {
      return { success: false, error: 'Activation failed' };
    }
  }

  /**
   * Start admin session
   */
  private async startSession(authMethod: string): Promise<{ success: boolean; error?: string }> {
    this.session = {
      isActive: true,
      startedAt: new Date(),
      lastActivity: new Date(),
      userId: `admin-${authMethod}`,
      permissions: Object.keys(ADMIN_ACTIONS) as AdminPermission[],
    };

    // Start session timeout timer
    this.resetSessionTimeout();

    // Log activation
    await this.logAdminAction('ADMIN_ACCESS', `Admin mode activated via ${authMethod}`, true);
    this.addDebugLog(`Admin mode activated via ${authMethod}`);

    return { success: true };
  }

  /**
   * Deactivate admin mode
   */
  async deactivate(): Promise<void> {
    if (this.session.isActive) {
      await this.logAdminAction('ADMIN_ACCESS', 'Admin mode deactivated', true);
      this.addDebugLog('Admin mode deactivated');
    }

    this.session = {
      isActive: false,
      startedAt: null,
      lastActivity: null,
      userId: '',
      permissions: [],
    };

    if (this.sessionTimeoutTimer) {
      clearTimeout(this.sessionTimeoutTimer);
      this.sessionTimeoutTimer = null;
    }

    // Notify renderer
    this.mainWindow?.webContents.send('admin:sessionEnded');
  }

  /**
   * Get session info
   */
  getSessionInfo(): AdminSession {
    return { ...this.session };
  }

  /**
   * Check if session is active
   */
  isSessionActive(): boolean {
    return this.session.isActive;
  }

  /**
   * Reset session timeout
   */
  private resetSessionTimeout(): void {
    if (this.sessionTimeoutTimer) {
      clearTimeout(this.sessionTimeoutTimer);
    }

    this.sessionTimeoutTimer = setTimeout(async () => {
      await this.deactivate();
      dialog.showMessageBox({
        type: 'info',
        title: 'Session Expired',
        message: 'Admin session has expired due to inactivity.',
      });
    }, SESSION_TIMEOUT_MS);

    this.session.lastActivity = new Date();
  }

  /**
   * Verify TOTP code
   */
  private verifyTotp(code: string): boolean {
    // Simple TOTP implementation
    // In production, use a proper TOTP library like 'otplib'

    const timeStep = 30; // 30 second windows
    const now = Math.floor(Date.now() / 1000);

    for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
      const counter = Math.floor((now + i * timeStep) / timeStep);
      const expectedCode = this.generateTotp(counter);

      if (code === expectedCode) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate TOTP for a counter value
   */
  private generateTotp(counter: number): string {
    // Convert counter to 8-byte buffer
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter));

    // HMAC-SHA1
    const hmac = createHmac('sha1', Buffer.from(this.base32Decode(TOTP_SECRET)));
    hmac.update(buffer);
    const hash = hmac.digest();

    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0f;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    // 6-digit code
    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  /**
   * Base32 decode
   */
  private base32Decode(input: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';

    for (const char of input.toUpperCase()) {
      if (char === '=') break;
      const val = alphabet.indexOf(char);
      if (val === -1) continue;
      bits += val.toString(2).padStart(5, '0');
    }

    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }

    return Buffer.from(bytes);
  }

  // ============================================
  // Admin Functions
  // ============================================

  /**
   * Run system diagnostics
   */
  async runDiagnostics(): Promise<DiagnosticsReport | null> {
    if (!this.requireActiveSession()) return null;
    this.resetSessionTimeout();

    await this.logAdminAction('ADMIN_ACTION', 'Ran system diagnostics');

    const licenseManager = getLicenseManager();
    const dbManager = getDatabaseManager();
    const auditLogger = getAuditLogger(dbManager.getClient());

    // License status
    const licenseStatus = await licenseManager.loadLicense();

    // Database status
    let dbIntegrity = { ok: true, errors: [] as string[] };
    try {
      dbIntegrity = await dbManager.verifyIntegrity();
    } catch {
      dbIntegrity = { ok: false, errors: ['Failed to verify'] };
    }

    // Audit chain status
    const auditChainResult = await auditLogger.validateChain();
    const recentEntries = await auditLogger.getRecentEntries(1);

    // System info
    const os = require('os');

    const report: DiagnosticsReport = {
      timestamp: new Date(),
      machineId: getMachineIdForDisplay(),
      licenseStatus: {
        isValid: licenseStatus.isValid,
        type: licenseManager.getLicenseType(),
        daysRemaining: licenseStatus.daysRemaining,
        modules: { ...licenseManager.getEnabledModules() },
      },
      databaseStatus: {
        isOpen: dbManager.isReady(),
        isEncrypted: true,
        integrityOk: dbIntegrity.ok,
      },
      auditChainStatus: {
        isValid: auditChainResult.isValid,
        entryCount: recentEntries.length > 0 ? (recentEntries[0].id || 0) : 0,
        lastEntry: recentEntries.length > 0 ? recentEntries[0].timestamp : undefined,
      },
      systemInfo: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        electronVersion: process.versions.electron || 'unknown',
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
        },
      },
    };

    this.addDebugLog('Diagnostics report generated');
    return report;
  }

  /**
   * Get debug logs
   */
  getDebugLogs(): string[] {
    if (!this.requireActiveSession()) return [];
    this.resetSessionTimeout();

    return [...this.debugLogs];
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(startDate?: Date, endDate?: Date): Promise<string | null> {
    if (!this.requireActiveSession()) return null;
    this.resetSessionTimeout();

    await this.logAdminAction('ADMIN_ACTION', 'Exported audit logs');

    const dbManager = getDatabaseManager();
    const auditLogger = getAuditLogger(dbManager.getClient());

    return auditLogger.exportLog(startDate, endDate);
  }

  /**
   * Get license details
   */
  getLicenseDetails(): Record<string, unknown> | null {
    if (!this.requireActiveSession()) return null;
    this.resetSessionTimeout();

    const licenseManager = getLicenseManager();

    return {
      machineId: licenseManager.getMachineId(),
      isLoaded: licenseManager.isLicenseLoaded(),
      type: licenseManager.getLicenseType(),
      customer: licenseManager.getCustomerInfo(),
      expirationDate: licenseManager.getExpirationDate(),
      daysRemaining: licenseManager.getDaysRemaining(),
      modules: licenseManager.getEnabledModules(),
      limits: licenseManager.getLimits(),
    };
  }

  /**
   * Verify audit chain integrity
   */
  async verifyAuditChain(): Promise<{ isValid: boolean; error?: string }> {
    if (!this.requireActiveSession()) return { isValid: false, error: 'No active session' };
    this.resetSessionTimeout();

    await this.logAdminAction('ADMIN_ACTION', 'Verified audit chain integrity');

    const dbManager = getDatabaseManager();
    const auditLogger = getAuditLogger(dbManager.getClient());

    const result = await auditLogger.validateChain();
    this.addDebugLog(`Audit chain verification: ${result.isValid ? 'PASSED' : 'FAILED'}`);

    return result;
  }

  /**
   * Reset database (high risk)
   */
  async resetDatabase(reason: string): Promise<{ success: boolean; error?: string }> {
    if (!this.requireActiveSession()) return { success: false, error: 'No active session' };
    this.resetSessionTimeout();

    if (!reason || reason.length < 10) {
      return { success: false, error: 'Reason must be at least 10 characters' };
    }

    // Confirm with dialog
    const { response } = await dialog.showMessageBox(this.mainWindow!, {
      type: 'warning',
      title: 'Confirm Database Reset',
      message: 'Are you absolutely sure you want to reset the database?',
      detail: 'This action will DELETE ALL DATA and cannot be undone. A backup will be created.',
      buttons: ['Cancel', 'Reset Database'],
      defaultId: 0,
      cancelId: 0,
    });

    if (response !== 1) {
      return { success: false, error: 'Operation cancelled' };
    }

    try {
      await this.logAdminAction('ADMIN_ACTION', `Database reset initiated. Reason: ${reason}`);

      const dbManager = getDatabaseManager();
      await dbManager.reset();

      this.addDebugLog(`Database reset completed. Reason: ${reason}`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Reset failed' };
    }
  }

  /**
   * Force unlock license (high risk, temporary)
   */
  async forceUnlockLicense(
    reason: string,
    durationMinutes: number = 60
  ): Promise<{ success: boolean; error?: string; expiresAt?: Date }> {
    if (!this.requireActiveSession()) return { success: false, error: 'No active session' };
    this.resetSessionTimeout();

    if (!reason || reason.length < 10) {
      return { success: false, error: 'Reason must be at least 10 characters' };
    }

    if (durationMinutes < 1 || durationMinutes > 1440) {
      return { success: false, error: 'Duration must be between 1 and 1440 minutes' };
    }

    // Confirm with dialog
    const { response } = await dialog.showMessageBox(this.mainWindow!, {
      type: 'warning',
      title: 'Confirm License Override',
      message: 'Are you sure you want to temporarily bypass license verification?',
      detail: `This will allow the application to run for ${durationMinutes} minutes without a valid license. This action is logged.`,
      buttons: ['Cancel', 'Force Unlock'],
      defaultId: 0,
      cancelId: 0,
    });

    if (response !== 1) {
      return { success: false, error: 'Operation cancelled' };
    }

    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    await this.logAdminAction(
      'ADMIN_ACTION',
      `License force unlock. Duration: ${durationMinutes}min. Reason: ${reason}`
    );

    // Store override in memory (will be cleared on restart)
    (global as any).__LICENSE_OVERRIDE__ = {
      active: true,
      expiresAt,
      reason,
    };

    this.addDebugLog(`License force unlocked until ${expiresAt.toISOString()}`);

    // Set timer to clear override
    setTimeout(() => {
      (global as any).__LICENSE_OVERRIDE__ = null;
      this.addDebugLog('License force unlock expired');
    }, durationMinutes * 60 * 1000);

    return { success: true, expiresAt };
  }

  // ============================================
  // Helpers
  // ============================================

  /**
   * Check if session is active and show error if not
   */
  private requireActiveSession(): boolean {
    if (!this.session.isActive) {
      dialog.showErrorBox('Access Denied', 'Admin session is not active.');
      return false;
    }
    return true;
  }

  /**
   * Log admin action to audit log
   */
  private async logAdminAction(
    action: AuditAction,
    description: string,
    success: boolean = true
  ): Promise<void> {
    try {
      const dbManager = getDatabaseManager();
      if (!dbManager.isReady()) return;

      const auditLogger = getAuditLogger(dbManager.getClient());

      await auditLogger.log({
        userId: this.session.userId || 'admin',
        userName: 'Administrator',
        action,
        entityType: 'ADMIN',
        entityId: 'system',
        description,
        oldValues: null,
        newValues: { success },
      });
    } catch (error) {
      console.error('[AdminMode] Failed to log action:', error);
    }
  }

  /**
   * Add entry to debug log buffer
   */
  addDebugLog(message: string): void {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}`;

    this.debugLogs.push(entry);

    // Trim if exceeds max
    if (this.debugLogs.length > this.maxDebugLogs) {
      this.debugLogs = this.debugLogs.slice(-this.maxDebugLogs);
    }

    console.log(`[AdminMode] ${message}`);
  }

  /**
   * Cleanup on application exit
   */
  async cleanup(): Promise<void> {
    if (this.session.isActive) {
      await this.deactivate();
    }

    if (this.keyHoldTimer) {
      clearTimeout(this.keyHoldTimer);
    }

    if (this.sessionTimeoutTimer) {
      clearTimeout(this.sessionTimeoutTimer);
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let instance: AdminModeManager | null = null;

export function getAdminModeManager(): AdminModeManager {
  if (!instance) {
    instance = new AdminModeManager();
  }
  return instance;
}

/**
 * Check if license is force unlocked
 */
export function isLicenseForceUnlocked(): boolean {
  const override = (global as any).__LICENSE_OVERRIDE__;
  if (!override || !override.active) return false;

  if (new Date() > override.expiresAt) {
    (global as any).__LICENSE_OVERRIDE__ = null;
    return false;
  }

  return true;
}

export default AdminModeManager;
