import { apiClient, ApiResponse } from './apiClient';

/**
 * Migration Types
 */
export interface MigrationModuleDto {
  module: string;
  migrations: string[];
}

export interface TenantMigrationStatusDto {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  pendingMigrations: MigrationModuleDto[];
  appliedMigrations: MigrationModuleDto[];
  hasPendingMigrations: boolean;
  error?: string;
}

export interface ApplyMigrationResultDto {
  tenantId: string;
  tenantName: string;
  success: boolean;
  message: string;
  appliedMigrations: string[];
  error?: string;
}

export interface MigrationHistoryDto {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  appliedMigrations: string[];
  totalMigrations: number;
}

export interface MigrationScriptPreviewDto {
  tenantId: string;
  tenantName: string;
  migrationName: string;
  moduleName: string;
  sqlScript: string;
  description: string;
  createdAt: string;
  affectedTables: string[];
  estimatedDuration: number;
}

export interface RollbackMigrationResultDto {
  tenantId: string;
  tenantName: string;
  migrationName: string;
  moduleName: string;
  success: boolean;
  message: string;
  error?: string;
  rolledBackAt: string;
}

export interface ScheduleMigrationResultDto {
  scheduleId: string;
  tenantId: string;
  tenantName: string;
  scheduledTime: string;
  migrationName?: string;
  moduleName?: string;
  status: string;
  message: string;
}

export interface ScheduledMigrationDto {
  scheduleId: string;
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  scheduledTime: string;
  migrationName?: string;
  moduleName?: string;
  status: string;
  createdAt: string;
  createdBy: string;
  executedAt?: string;
  error?: string;
}

export interface MigrationSettingsDto {
  autoApplyMigrations: boolean;
  backupBeforeMigration: boolean;
  migrationTimeout: number;
  enableScheduledMigrations: boolean;
  defaultScheduleTime?: string;
  notifyOnMigrationComplete: boolean;
  notifyOnMigrationFailure: boolean;
  notificationEmails: string[];
}

/**
 * Migration Service
 */
class MigrationService {
  /**
   * Get pending migrations for all active tenants
   */
  async getPendingMigrations(): Promise<TenantMigrationStatusDto[]> {
    return apiClient.get<TenantMigrationStatusDto[]>('/api/master/Migration/pending');
  }

  /**
   * Apply migration to a specific tenant
   */
  async applyMigration(tenantId: string): Promise<ApplyMigrationResultDto> {
    return apiClient.post<ApplyMigrationResultDto>(`/api/master/Migration/apply/${tenantId}`);
  }

  /**
   * Apply migrations to all tenants
   */
  async applyAllMigrations(): Promise<ApplyMigrationResultDto[]> {
    return apiClient.post<ApplyMigrationResultDto[]>('/api/master/Migration/apply-all');
  }

  /**
   * Get migration history for a specific tenant
   */
  async getMigrationHistory(tenantId: string): Promise<MigrationHistoryDto> {
    return apiClient.get<MigrationHistoryDto>(`/api/master/Migration/history/${tenantId}`);
  }

  /**
   * Get SQL script preview for a specific migration
   */
  async getMigrationScriptPreview(
    tenantId: string,
    moduleName: string,
    migrationName: string
  ): Promise<MigrationScriptPreviewDto> {
    return apiClient.get<MigrationScriptPreviewDto>(
      `/api/master/Migration/preview/${tenantId}/${moduleName}/${migrationName}`
    );
  }

  /**
   * Rollback a specific migration
   */
  async rollbackMigration(
    tenantId: string,
    moduleName: string,
    migrationName: string
  ): Promise<RollbackMigrationResultDto> {
    return apiClient.post<RollbackMigrationResultDto>(
      `/api/master/Migration/rollback/${tenantId}/${moduleName}/${migrationName}`
    );
  }

  /**
   * Schedule a migration for a specific time
   */
  async scheduleMigration(
    tenantId: string,
    scheduledTime: Date,
    migrationName?: string,
    moduleName?: string
  ): Promise<ScheduleMigrationResultDto> {
    return apiClient.post<ScheduleMigrationResultDto>('/api/master/Migration/schedule', {
      tenantId,
      scheduledTime: scheduledTime.toISOString(),
      migrationName,
      moduleName,
    });
  }

  /**
   * Get all scheduled migrations
   */
  async getScheduledMigrations(): Promise<ScheduledMigrationDto[]> {
    return apiClient.get<ScheduledMigrationDto[]>('/api/master/Migration/scheduled');
  }

  /**
   * Cancel a scheduled migration
   */
  async cancelScheduledMigration(scheduleId: string): Promise<boolean> {
    return apiClient.delete<boolean>(`/api/master/Migration/scheduled/${scheduleId}`);
  }

  /**
   * Get migration settings
   */
  async getMigrationSettings(): Promise<MigrationSettingsDto> {
    return apiClient.get<MigrationSettingsDto>('/api/master/Migration/settings');
  }

  /**
   * Update migration settings
   */
  async updateMigrationSettings(settings: MigrationSettingsDto): Promise<MigrationSettingsDto> {
    return apiClient.put<MigrationSettingsDto>('/api/master/Migration/settings', settings);
  }
}

export const migrationService = new MigrationService();
