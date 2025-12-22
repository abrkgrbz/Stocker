/**
 * Tamper-Proof Audit Logger
 *
 * Provides immutable audit logging with cryptographic hash chaining.
 * Each log entry includes the hash of the previous entry, creating
 * a blockchain-like structure that detects tampering.
 */

import { PrismaClient } from '@prisma/client';
import { createHash, createHmac } from 'crypto';
import { getMachineIdForDisplay } from './machine-id';
import { getLicenseManager } from './license-manager';

// ============================================
// Types
// ============================================

export type AuditAction =
  // Stock
  | 'STOCK_ADJUSTMENT'
  | 'STOCK_TRANSFER'
  | 'STOCK_COUNT_VARIANCE'
  | 'STOCK_MOVEMENT'
  // Pricing
  | 'PRICE_CHANGE'
  | 'COST_CHANGE'
  | 'DISCOUNT_APPLIED'
  // Orders
  | 'ORDER_CREATE'
  | 'ORDER_APPROVE'
  | 'ORDER_CANCEL'
  | 'ORDER_MODIFY'
  | 'ORDER_DELETE'
  // Invoices
  | 'INVOICE_CREATE'
  | 'INVOICE_VOID'
  | 'INVOICE_MODIFY'
  // Payments
  | 'PAYMENT_RECORD'
  | 'PAYMENT_REFUND'
  | 'PAYMENT_VOID'
  // Users
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATE'
  | 'USER_DELETE'
  | 'USER_PERMISSION_CHANGE'
  // System
  | 'LICENSE_ACTIVATE'
  | 'LICENSE_EXPIRE'
  | 'DATABASE_BACKUP'
  | 'DATABASE_RESTORE'
  | 'DATABASE_RESET'
  | 'ADMIN_ACCESS'
  | 'ADMIN_ACTION'
  | 'INTEGRITY_VIOLATION'
  // Data
  | 'DATA_EXPORT'
  | 'DATA_IMPORT'
  | 'DATA_DELETE';

export interface AuditEntry {
  id?: number;
  timestamp: Date;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  description: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  machineId: string;
  previousHash: string;
  entryHash: string;
}

export interface AuditLogResult {
  success: boolean;
  entryId?: number;
  error?: string;
}

export interface ChainValidationResult {
  isValid: boolean;
  brokenAtEntry?: number;
  error?: string;
}

// ============================================
// Constants
// ============================================

// Secret for HMAC (should be derived from license)
const getHmacSecret = (): string => {
  const license = getLicenseManager();
  const customerId = license.getCustomerInfo()?.id || 'unknown';
  return `audit-chain-v1-${customerId}`;
};

// Genesis hash for first entry
const GENESIS_HASH = 'GENESIS_0000000000000000000000000000000000000000000000000000000000000000';

// ============================================
// Audit Logger Class
// ============================================

export class AuditLogger {
  private prisma: PrismaClient;
  private lastHash: string = GENESIS_HASH;
  private initialized: boolean = false;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize the audit logger
   * Loads the last hash from the database
   */
  async initialize(): Promise<void> {
    try {
      // Get the most recent audit entry
      const lastEntry = await this.prisma.auditLog.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true, signature: true },
      });

      if (lastEntry && lastEntry.signature) {
        this.lastHash = lastEntry.signature;
      } else {
        this.lastHash = GENESIS_HASH;
      }

      this.initialized = true;
      console.log('[AuditLogger] Initialized');

    } catch (error) {
      console.error('[AuditLogger] Initialization failed:', error);
      this.lastHash = GENESIS_HASH;
      this.initialized = true;
    }
  }

  // ============================================
  // Logging
  // ============================================

  /**
   * Log an audit entry
   */
  async log(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'machineId' | 'previousHash' | 'entryHash'>): Promise<AuditLogResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const timestamp = new Date();
      const machineId = getMachineIdForDisplay();
      const previousHash = this.lastHash;

      // Create the entry data for hashing
      const entryData = {
        timestamp: timestamp.toISOString(),
        userId: entry.userId,
        userName: entry.userName,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        description: entry.description,
        oldValues: entry.oldValues,
        newValues: entry.newValues,
        machineId,
        previousHash,
      };

      // Calculate entry hash
      const entryHash = this.calculateEntryHash(entryData);

      // Store in database
      const result = await this.prisma.auditLog.create({
        data: {
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          oldValues: entry.oldValues ? JSON.stringify(entry.oldValues) : null,
          newValues: entry.newValues ? JSON.stringify(entry.newValues) : null,
          userId: entry.userId,
          ipAddress: machineId, // Using machineId since we're offline
          createdAt: timestamp,
          // Store hash chain info in signature field
          signature: entryHash,
        },
      });

      // Update last hash
      this.lastHash = entryHash;

      return {
        success: true,
        entryId: result.id,
      };

    } catch (error) {
      console.error('[AuditLogger] Failed to log entry:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Calculate hash for an entry
   */
  private calculateEntryHash(entryData: Record<string, unknown>): string {
    const dataString = JSON.stringify(entryData, Object.keys(entryData).sort());
    return createHmac('sha256', getHmacSecret())
      .update(dataString)
      .digest('hex');
  }

  // ============================================
  // Validation
  // ============================================

  /**
   * Validate the entire audit chain
   */
  async validateChain(): Promise<ChainValidationResult> {
    try {
      const entries = await this.prisma.auditLog.findMany({
        orderBy: { id: 'asc' },
      });

      if (entries.length === 0) {
        return { isValid: true };
      }

      let previousHash = GENESIS_HASH;

      for (const entry of entries) {
        const storedHash = entry.signature;

        // Reconstruct entry data
        const entryData = {
          timestamp: entry.createdAt.toISOString(),
          userId: entry.userId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          oldValues: entry.oldValues ? JSON.parse(entry.oldValues) : null,
          newValues: entry.newValues ? JSON.parse(entry.newValues) : null,
          machineId: entry.ipAddress,
          previousHash,
        };

        const calculatedHash = this.calculateEntryHash(entryData);

        if (calculatedHash !== storedHash) {
          return {
            isValid: false,
            brokenAtEntry: entry.id,
            error: `Hash mismatch at entry ${entry.id}`,
          };
        }

        previousHash = storedHash;
      }

      return { isValid: true };

    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get audit entries for an entity
   */
  async getEntriesForEntity(entityType: string, entityId: string): Promise<AuditEntry[]> {
    const entries = await this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((entry) => ({
      id: entry.id,
      timestamp: entry.createdAt,
      userId: entry.userId,
      userName: '', // Not stored in current schema
      action: entry.action as AuditAction,
      entityType: entry.entityType,
      entityId: entry.entityId,
      description: '',
      oldValues: entry.oldValues ? JSON.parse(entry.oldValues) : null,
      newValues: entry.newValues ? JSON.parse(entry.newValues) : null,
      machineId: entry.ipAddress || '',
      previousHash: '',
      entryHash: entry.signature || '',
    }));
  }

  /**
   * Get recent audit entries
   */
  async getRecentEntries(limit: number = 100): Promise<AuditEntry[]> {
    const entries = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return entries.map((entry) => ({
      id: entry.id,
      timestamp: entry.createdAt,
      userId: entry.userId,
      userName: '',
      action: entry.action as AuditAction,
      entityType: entry.entityType,
      entityId: entry.entityId,
      description: '',
      oldValues: entry.oldValues ? JSON.parse(entry.oldValues) : null,
      newValues: entry.newValues ? JSON.parse(entry.newValues) : null,
      machineId: entry.ipAddress || '',
      previousHash: '',
      entryHash: entry.signature || '',
    }));
  }

  /**
   * Export audit log
   */
  async exportLog(startDate?: Date, endDate?: Date): Promise<string> {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const entries = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return JSON.stringify(entries, null, 2);
  }
}

// ============================================
// Convenience Functions
// ============================================

let instance: AuditLogger | null = null;

export function getAuditLogger(prisma: PrismaClient): AuditLogger {
  if (!instance) {
    instance = new AuditLogger(prisma);
  }
  return instance;
}

/**
 * Quick log function for common operations
 */
export async function auditLog(
  prisma: PrismaClient,
  action: AuditAction,
  entityType: string,
  entityId: string,
  userId: string,
  options: {
    userName?: string;
    description?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
  } = {}
): Promise<void> {
  const logger = getAuditLogger(prisma);

  await logger.log({
    userId,
    userName: options.userName || userId,
    action,
    entityType,
    entityId,
    description: options.description || `${action} on ${entityType}:${entityId}`,
    oldValues: options.oldValues || null,
    newValues: options.newValues || null,
  });
}
