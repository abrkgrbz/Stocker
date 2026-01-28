using Stocker.SharedKernel.DTOs.Migration;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for managing database migrations
/// </summary>
public interface IMigrationService
{
    /// <summary>
    /// Applies migrations to the master database
    /// </summary>
    Task MigrateMasterDatabaseAsync();

    /// <summary>
    /// Creates the Hangfire database if it doesn't exist
    /// </summary>
    Task CreateHangfireDatabaseAsync();

    /// <summary>
    /// Applies migrations to a specific tenant's database
    /// </summary>
    Task MigrateTenantDatabaseAsync(Guid tenantId);

    /// <summary>
    /// Applies migrations to all active tenants' databases
    /// </summary>
    Task MigrateAllTenantDatabasesAsync();

    /// <summary>
    /// Seeds initial data to the master database
    /// </summary>
    Task SeedMasterDataAsync();

    /// <summary>
    /// Seeds initial data to a tenant's database
    /// </summary>
    Task SeedTenantDataAsync(Guid tenantId);

    /// <summary>
    /// Gets pending migrations for all active tenants
    /// </summary>
    Task<List<TenantMigrationStatusDto>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending migrations for master database
    /// </summary>
    Task<MasterMigrationStatusDto> GetMasterPendingMigrationsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Applies pending migrations to master database
    /// </summary>
    Task<ApplyMigrationResultDto> ApplyMasterMigrationAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Applies pending migrations to a specific tenant
    /// </summary>
    Task<ApplyMigrationResultDto> ApplyMigrationToTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Applies migrations to all tenants
    /// </summary>
    Task<List<ApplyMigrationResultDto>> ApplyMigrationsToAllTenantsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets migration history for a specific tenant
    /// </summary>
    Task<MigrationHistoryDto> GetMigrationHistoryAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets SQL script preview for a specific migration
    /// </summary>
    Task<MigrationScriptPreviewDto> GetMigrationScriptPreviewAsync(
        Guid tenantId,
        string migrationName,
        string moduleName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Rolls back a specific migration
    /// </summary>
    Task<RollbackMigrationResultDto> RollbackMigrationAsync(
        Guid tenantId,
        string migrationName,
        string moduleName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Schedules a migration for a specific time
    /// </summary>
    Task<ScheduleMigrationResultDto> ScheduleMigrationAsync(
        Guid tenantId,
        DateTime scheduledTime,
        string? migrationName = null,
        string? moduleName = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all scheduled migrations
    /// </summary>
    Task<List<ScheduledMigrationDto>> GetScheduledMigrationsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels a scheduled migration
    /// </summary>
    Task<bool> CancelScheduledMigrationAsync(Guid scheduleId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets migration settings
    /// </summary>
    Task<MigrationSettingsDto> GetMigrationSettingsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates migration settings
    /// </summary>
    Task<MigrationSettingsDto> UpdateMigrationSettingsAsync(
        MigrationSettingsDto settings,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Executes a scheduled migration. This method is called by Hangfire.
    /// </summary>
    Task ExecuteScheduledMigrationAsync(Guid scheduleId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Applies only module-specific migrations for a tenant based on their subscription.
    /// This is used when tenant database already exists but modules need to be provisioned.
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="progressNotifier">Optional progress notifier for real-time updates</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of applied module migrations</returns>
    Task<List<string>> ApplyModuleMigrationsAsync(
        Guid tenantId,
        ISetupProgressNotifier? progressNotifier = null,
        CancellationToken cancellationToken = default);

    #region Central Migration Management

    /// <summary>
    /// Gets migration status for all DbContexts in the system (Master, Alerts, Tenants)
    /// </summary>
    Task<CentralMigrationStatusDto> GetCentralMigrationStatusAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending migrations for Alert database
    /// </summary>
    Task<DbContextMigrationStatusDto> GetAlertsPendingMigrationsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Applies pending migrations to Alert database
    /// </summary>
    Task<ApplyMigrationResultDto> ApplyAlertsMigrationAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Applies all pending migrations across all DbContexts (Master, Alerts, Tenants)
    /// </summary>
    Task<CentralMigrationResultDto> ApplyAllMigrationsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Migrates Alert database (for startup)
    /// </summary>
    Task MigrateAlertsDatabaseAsync();

    #endregion
}