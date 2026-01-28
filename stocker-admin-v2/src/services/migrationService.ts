import { apiClient } from './apiClient';

export interface MigrationStatusDto {
    module: string;
    migrations: string[];
}

export interface TenantMigrationStatusDto {
    tenantId: string;
    tenantName: string;
    tenantCode: string;
    hasPendingMigrations: boolean;
    pendingMigrations: MigrationStatusDto[];
    appliedMigrations: MigrationStatusDto[];
    error?: string;
}

export interface MasterMigrationStatusDto {
    hasPendingMigrations: boolean;
    pendingMigrations: string[];
}

export interface ApplyMigrationResultDto {
    success: boolean;
    message: string;
    tenantId?: string;
    tenantName?: string;
    appliedMigrations: string[];
    error?: string;
}

export interface MigrationScriptPreviewDto {
    sql: string;
    migrationName: string;
}

export interface ScheduledMigrationDto {
    id: string;
    tenantId: string;
    tenantName: string;
    scheduledTime: string;
    migrationName: string;
    moduleName: string;
    status: string;
}

export interface MigrationHistoryDto {
    tenantId: string;
    tenantName: string;
    tenantCode: string;
    appliedMigrations: string[];
    totalMigrations: number;
}

export interface MigrationSettingsDto {
    autoApplyMigrations: boolean;
    notifyOnSuccess: boolean;
    notifyOnError: boolean;
    backupBeforeMigration: boolean;
}

export interface DbContextMigrationStatusDto {
    contextName: string;
    schema: string;
    pendingMigrations: string[];
    appliedMigrations: string[];
    hasPendingMigrations: boolean;
    error?: string;
    isHealthy: boolean;
}

export interface TenantPendingMigrationDto {
    tenantId: string;
    tenantName: string;
    hasPendingMigrations: boolean;
    pendingMigrations: { moduleName: string; migrations: string[] }[];
    error?: string;
}

export interface CentralMigrationStatusDto {
    master: DbContextMigrationStatusDto;
    alerts: DbContextMigrationStatusDto;
    tenants: {
        totalTenants: number;
        tenantsWithPendingMigrations: number;
        tenantsUpToDate: number;
        totalPendingMigrations: number;
        tenantsWithPending: TenantPendingMigrationDto[];
    };
    totalPendingMigrations: number;
    hasAnyPendingMigrations: boolean;
    checkedAt: string;
}

export interface MigrationActionResultDto {
    tenantId: string;
    tenantName: string;
    success: boolean;
    message: string;
    appliedMigrations: string[];
    error?: string;
}

export interface CentralMigrationResultDto {
    master: MigrationActionResultDto;
    alerts: MigrationActionResultDto;
    tenants: MigrationActionResultDto[];
    success: boolean;
    message: string;
    appliedAt: string;
}

class MigrationService {
    private readonly basePath = '/api/master/migrations';

    // Central API
    async getCentralStatus(): Promise<CentralMigrationStatusDto> {
        return apiClient.get(`${this.basePath}/central/status`);
    }

    async applyCentralAll(): Promise<CentralMigrationResultDto> {
        return apiClient.post(`${this.basePath}/central/apply-all`);
    }

    // Alerts API
    async getAlertsPending(): Promise<DbContextMigrationStatusDto> {
        return apiClient.get(`${this.basePath}/alerts/pending`);
    }

    async applyAlerts(): Promise<MigrationActionResultDto> {
        return apiClient.post(`${this.basePath}/alerts/apply`);
    }

    // Legacy / Specific APIs
    async getPendingMigrations(): Promise<TenantMigrationStatusDto[]> {
        return apiClient.get(`${this.basePath}/pending`);
    }

    async getMasterPendingMigrations(): Promise<MasterMigrationStatusDto> {
        return apiClient.get(`${this.basePath}/master/pending`);
    }

    async getMigrationHistory(tenantId: string): Promise<MigrationHistoryDto> {
        return apiClient.get(`${this.basePath}/history/${tenantId}`);
    }

    async applyMigration(tenantId: string): Promise<ApplyMigrationResultDto> {
        return apiClient.post(`${this.basePath}/apply/${tenantId}`);
    }

    async applyAllMigrations(): Promise<ApplyMigrationResultDto[]> {
        return apiClient.post(`${this.basePath}/apply-all`);
    }

    async applyMasterMigration(): Promise<ApplyMigrationResultDto> {
        return apiClient.post(`${this.basePath}/master/apply`);
    }

    async getMigrationScriptPreview(tenantId: string, moduleName: string, migrationName: string): Promise<MigrationScriptPreviewDto> {
        return apiClient.get(`${this.basePath}/preview`, {
            params: { tenantId, moduleName, migrationName }
        });
    }

    async rollbackMigration(tenantId: string, moduleName: string, migrationName: string): Promise<ApplyMigrationResultDto> {
        return apiClient.post(`${this.basePath}/rollback`, {
            tenantId, moduleName, migrationName
        });
    }

    async getScheduledMigrations(): Promise<ScheduledMigrationDto[]> {
        return apiClient.get(`${this.basePath}/scheduled`);
    }

    async scheduleMigration(tenantId: string, scheduledTime: Date, migrationName: string, moduleName: string): Promise<boolean> {
        return apiClient.post(`${this.basePath}/schedule`, {
            tenantId, scheduledTime, migrationName, moduleName
        });
    }

    async deleteScheduledMigration(scheduleId: string): Promise<boolean> {
        return apiClient.delete(`${this.basePath}/scheduled/${scheduleId}`);
    }

    async getMigrationSettings(): Promise<MigrationSettingsDto> {
        return apiClient.get(`${this.basePath}/settings`);
    }

    async updateMigrationSettings(settings: MigrationSettingsDto): Promise<boolean> {
        return apiClient.put(`${this.basePath}/settings`, settings);
    }
}

export const migrationService = new MigrationService();
