namespace Stocker.Application.Common.Interfaces;

public interface ITenantProvisioningJob
{
    Task ProvisionNewTenantAsync(Guid tenantId);
    Task MigrateTenantDatabaseAsync(Guid tenantId);
    Task SeedTenantDataAsync(Guid tenantId);
    Task MigrateAllTenantsAsync();
}