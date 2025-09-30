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
}