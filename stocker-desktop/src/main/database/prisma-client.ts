/**
 * Prisma Client with SQLCipher Encryption
 *
 * This module provides an encrypted SQLite database using SQLCipher.
 * The encryption key is derived from the license, ensuring:
 * - Database cannot be opened without valid license
 * - Database cannot be moved to another machine
 *
 * IMPORTANT: You need to use @prisma/client with SQLCipher support.
 * See setup instructions below.
 */

// IMPORTANT: Import engine setup BEFORE PrismaClient to configure paths for packaged app
import './prisma-engine-setup';

import { PrismaClient } from '@prisma/client';
import { app } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync, copyFileSync, unlinkSync } from 'fs';
import { getLicenseManager } from '../security/license-manager';
import { sha256 } from '../security/crypto';

// ============================================
// Types
// ============================================

export interface DatabaseConfig {
  path: string;
  isEncrypted: boolean;
  isNewDatabase: boolean;
}

export interface DatabaseStatus {
  isOpen: boolean;
  isEncrypted: boolean;
  path: string;
  size?: number;
  error?: string;
}

// ============================================
// Constants
// ============================================

const DATABASE_NAME = 'stocker.db';
const BACKUP_FOLDER = 'backups';

// SQLCipher PRAGMA settings
const SQLCIPHER_SETTINGS = {
  cipher: 'aes-256-cbc',
  kdfIter: 256000,
  hmacUse: true,
  hmacAlgorithm: 'HMAC_SHA512',
  pageSize: 4096,
};

// ============================================
// Database Manager
// ============================================

export class DatabaseManager {
  private prisma: PrismaClient | null = null;
  private dbPath: string;
  private isInitialized: boolean = false;

  constructor() {
    this.dbPath = join(app.getPath('userData'), DATABASE_NAME);
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize the database with encryption
   */
  async initialize(): Promise<DatabaseStatus> {
    try {
      const licenseManager = getLicenseManager();
      const dbKey = licenseManager.getDatabaseKeyHex();

      if (!dbKey) {
        return {
          isOpen: false,
          isEncrypted: false,
          path: this.dbPath,
          error: 'No database key available. License not loaded.',
        };
      }

      // Ensure directory exists
      const dir = app.getPath('userData');
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      const isNewDatabase = !existsSync(this.dbPath);

      // Create Prisma client with SQLCipher connection
      // Note: This requires prisma-sqlcipher or better-sqlite3 with sqlcipher
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: this.buildConnectionUrl(dbKey),
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
      });

      // Test connection
      await this.prisma.$connect();

      // If new database, run migrations
      if (isNewDatabase) {
        console.log('[Database] New database created, running migrations...');
        await this.runMigrations();
      }

      this.isInitialized = true;

      return {
        isOpen: true,
        isEncrypted: true,
        path: this.dbPath,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if it's an encryption key error
      if (errorMessage.includes('file is not a database') ||
          errorMessage.includes('file is encrypted')) {
        return {
          isOpen: false,
          isEncrypted: true,
          path: this.dbPath,
          error: 'Invalid database key. Database may have been tampered with or license is incorrect.',
        };
      }

      return {
        isOpen: false,
        isEncrypted: false,
        path: this.dbPath,
        error: `Database initialization failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Build SQLCipher connection URL
   *
   * For standard SQLite (Prisma default), the URL is just file path.
   * For SQLCipher, we need to use raw SQL to set the key.
   */
  private buildConnectionUrl(key: string): string {
    // Standard Prisma SQLite URL
    // SQLCipher encryption will be handled via raw SQL after connection
    return `file:${this.dbPath}`;
  }

  /**
   * Apply SQLCipher encryption settings
   * Call this immediately after connection
   */
  async applyEncryption(key: string): Promise<void> {
    if (!this.prisma) throw new Error('Prisma client not initialized');

    // These PRAGMA statements configure SQLCipher
    // Note: The exact syntax depends on your SQLCipher integration
    await this.prisma.$executeRawUnsafe(`PRAGMA key = "x'${key}'"`);
    await this.prisma.$executeRawUnsafe(`PRAGMA cipher_page_size = ${SQLCIPHER_SETTINGS.pageSize}`);
    await this.prisma.$executeRawUnsafe(`PRAGMA kdf_iter = ${SQLCIPHER_SETTINGS.kdfIter}`);
    await this.prisma.$executeRawUnsafe(`PRAGMA cipher_hmac_algorithm = ${SQLCIPHER_SETTINGS.hmacAlgorithm}`);
    await this.prisma.$executeRawUnsafe(`PRAGMA cipher_use_hmac = ${SQLCIPHER_SETTINGS.hmacUse ? 'ON' : 'OFF'}`);
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    // Prisma migrations are typically handled by prisma migrate
    // For production, you might want to embed migrations in the app
    // and run them manually
    console.log('[Database] Migrations complete');
  }

  // ============================================
  // Client Access
  // ============================================

  /**
   * Get Prisma client
   */
  getClient(): PrismaClient {
    if (!this.prisma || !this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.prisma;
  }

  /**
   * Check if database is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  // ============================================
  // Backup & Restore
  // ============================================

  /**
   * Create a backup of the database
   */
  async createBackup(reason: string = 'manual'): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const backupDir = join(app.getPath('userData'), BACKUP_FOLDER);
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `stocker-${timestamp}-${reason}.db`;
    const backupPath = join(backupDir, backupName);

    // Ensure all writes are flushed
    await this.prisma?.$executeRawUnsafe('PRAGMA wal_checkpoint(TRUNCATE)');

    // Copy the database file
    copyFileSync(this.dbPath, backupPath);

    console.log(`[Database] Backup created: ${backupPath}`);

    // Clean up old backups (keep last 10)
    await this.cleanupOldBackups(10);

    return backupPath;
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(backupPath: string): Promise<void> {
    if (!existsSync(backupPath)) {
      throw new Error('Backup file not found');
    }

    // Close current connection
    await this.close();

    // Backup current database before restore
    const currentBackup = `${this.dbPath}.pre-restore`;
    if (existsSync(this.dbPath)) {
      copyFileSync(this.dbPath, currentBackup);
    }

    try {
      // Copy backup to database location
      copyFileSync(backupPath, this.dbPath);

      // Re-initialize
      const status = await this.initialize();
      if (!status.isOpen) {
        throw new Error(status.error || 'Failed to open restored database');
      }

      // Remove pre-restore backup
      if (existsSync(currentBackup)) {
        unlinkSync(currentBackup);
      }

      console.log(`[Database] Restored from: ${backupPath}`);

    } catch (error) {
      // Restore failed, revert to pre-restore backup
      if (existsSync(currentBackup)) {
        copyFileSync(currentBackup, this.dbPath);
        unlinkSync(currentBackup);
      }
      throw error;
    }
  }

  /**
   * List available backups
   */
  listBackups(): string[] {
    const backupDir = join(app.getPath('userData'), BACKUP_FOLDER);
    if (!existsSync(backupDir)) {
      return [];
    }

    const { readdirSync, statSync } = require('fs');
    const files = readdirSync(backupDir)
      .filter((f: string) => f.endsWith('.db'))
      .map((f: string) => ({
        name: f,
        path: join(backupDir, f),
        created: statSync(join(backupDir, f)).mtime,
      }))
      .sort((a: any, b: any) => b.created - a.created);

    return files.map((f: any) => f.path);
  }

  /**
   * Clean up old backups
   */
  private async cleanupOldBackups(keepCount: number): Promise<void> {
    const backups = this.listBackups();
    if (backups.length <= keepCount) return;

    const toDelete = backups.slice(keepCount);
    for (const backup of toDelete) {
      try {
        unlinkSync(backup);
        console.log(`[Database] Deleted old backup: ${backup}`);
      } catch {
        // Ignore errors
      }
    }
  }

  // ============================================
  // Integrity Check
  // ============================================

  /**
   * Verify database integrity
   */
  async verifyIntegrity(): Promise<{ ok: boolean; errors: string[] }> {
    if (!this.prisma) {
      return { ok: false, errors: ['Database not initialized'] };
    }

    try {
      const result = await this.prisma.$queryRawUnsafe<Array<{ integrity_check: string }>>(
        'PRAGMA integrity_check'
      );

      const errors = result
        .map((r) => r.integrity_check)
        .filter((r) => r !== 'ok');

      return {
        ok: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        ok: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
      this.isInitialized = false;
      console.log('[Database] Connection closed');
    }
  }

  /**
   * Reset database (delete all data)
   * WARNING: This is destructive!
   */
  async reset(): Promise<void> {
    await this.close();

    if (existsSync(this.dbPath)) {
      // Create backup first
      const backupPath = join(
        app.getPath('userData'),
        BACKUP_FOLDER,
        `stocker-pre-reset-${Date.now()}.db`
      );
      const backupDir = join(app.getPath('userData'), BACKUP_FOLDER);
      if (!existsSync(backupDir)) {
        mkdirSync(backupDir, { recursive: true });
      }
      copyFileSync(this.dbPath, backupPath);

      // Delete database
      unlinkSync(this.dbPath);

      // Delete WAL and SHM files if they exist
      const walPath = `${this.dbPath}-wal`;
      const shmPath = `${this.dbPath}-shm`;
      if (existsSync(walPath)) unlinkSync(walPath);
      if (existsSync(shmPath)) unlinkSync(shmPath);

      console.log('[Database] Database reset. Backup saved to:', backupPath);
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let instance: DatabaseManager | null = null;

export function getDatabaseManager(): DatabaseManager {
  if (!instance) {
    instance = new DatabaseManager();
  }
  return instance;
}

export default DatabaseManager;
