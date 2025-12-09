namespace Stocker.Application.Common.Interfaces;

public interface ITenantProvisioningJob
{
    Task ProvisionNewTenantAsync(Guid tenantId);
    Task MigrateTenantDatabaseAsync(Guid tenantId);
    Task SeedTenantDataAsync(Guid tenantId);
    Task MigrateAllTenantsAsync();
    Task RollbackFailedProvisioningAsync(Guid tenantId);

    /// <summary>
    /// Provisions only the module migrations for an already active tenant.
    /// This is used when tenant database already exists but user selected new modules in setup wizard.
    /// Shows progress via SignalR.
    /// </summary>
    Task ProvisionModulesAsync(Guid tenantId);
}