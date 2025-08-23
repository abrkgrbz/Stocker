using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Persistence.Migrations;
using Stocker.SharedKernel.Repositories;
using Stocker.Domain.Master.Entities;

namespace Stocker.Infrastructure.BackgroundJobs.Jobs;

public class TenantProvisioningJob : ITenantProvisioningJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TenantProvisioningJob> _logger;

    public TenantProvisioningJob(
        IServiceProvider serviceProvider,
        ILogger<TenantProvisioningJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    [Queue("critical")]
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    [DisableConcurrentExecution(timeoutInSeconds: 30 * 60)] // 30 dakika timeout
    public async Task ProvisionNewTenantAsync(Guid tenantId)
    {
        using var scope = _serviceProvider.CreateScope();
        var migrationService = scope.ServiceProvider.GetRequiredService<IMigrationService>();
        var masterUnitOfWork = scope.ServiceProvider.GetRequiredService<IMasterUnitOfWork>();

        try
        {
            _logger.LogInformation("Starting tenant provisioning for TenantId: {TenantId}", tenantId);

            // Tenant'ı kontrol et
            var tenant = await masterUnitOfWork.Repository<Tenant>().GetByIdAsync(tenantId);
            if (tenant == null)
            {
                _logger.LogError("Tenant not found: {TenantId}", tenantId);
                throw new InvalidOperationException($"Tenant {tenantId} not found");
            }

            // Database migration
            _logger.LogInformation("Creating database for tenant: {TenantName}", tenant.Name);
            await migrationService.MigrateTenantDatabaseAsync(tenantId);

            // Seed data
            _logger.LogInformation("Seeding data for tenant: {TenantName}", tenant.Name);
            await migrationService.SeedTenantDataAsync(tenantId);

            // Tenant'ı aktif olarak işaretle
            tenant.Activate();
            await masterUnitOfWork.SaveChangesAsync();

            _logger.LogInformation("Tenant provisioning completed successfully for: {TenantName}", tenant.Name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to provision tenant: {TenantId}", tenantId);
            
            // Tenant'ı deaktif et
            try
            {
                var tenant = await masterUnitOfWork.Repository<Tenant>().GetByIdAsync(tenantId);
                if (tenant != null)
                {
                    tenant.Deactivate();
                    await masterUnitOfWork.SaveChangesAsync();
                }
            }
            catch (Exception deactivateEx)
            {
                _logger.LogError(deactivateEx, "Failed to deactivate tenant after provisioning failure: {TenantId}", tenantId);
            }
            
            throw;
        }
    }

    [Queue("low")]
    [AutomaticRetry(Attempts = 2, DelaysInSeconds = new[] { 60, 300 })]
    [DisableConcurrentExecution(timeoutInSeconds: 15 * 60)]
    public async Task MigrateTenantDatabaseAsync(Guid tenantId)
    {
        using var scope = _serviceProvider.CreateScope();
        var migrationService = scope.ServiceProvider.GetRequiredService<IMigrationService>();

        try
        {
            _logger.LogInformation("Migrating database for TenantId: {TenantId}", tenantId);
            await migrationService.MigrateTenantDatabaseAsync(tenantId);
            _logger.LogInformation("Database migration completed for TenantId: {TenantId}", tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to migrate database for TenantId: {TenantId}", tenantId);
            throw;
        }
    }

    [Queue("low")]
    [AutomaticRetry(Attempts = 2, DelaysInSeconds = new[] { 60, 300 })]
    [DisableConcurrentExecution(timeoutInSeconds: 10 * 60)]
    public async Task SeedTenantDataAsync(Guid tenantId)
    {
        using var scope = _serviceProvider.CreateScope();
        var migrationService = scope.ServiceProvider.GetRequiredService<IMigrationService>();

        try
        {
            _logger.LogInformation("Seeding data for TenantId: {TenantId}", tenantId);
            await migrationService.SeedTenantDataAsync(tenantId);
            _logger.LogInformation("Data seeding completed for TenantId: {TenantId}", tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to seed data for TenantId: {TenantId}", tenantId);
            throw;
        }
    }

    [Queue("low")]
    [DisableConcurrentExecution(timeoutInSeconds: 60 * 60)] // 1 saat timeout
    public async Task MigrateAllTenantsAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var migrationService = scope.ServiceProvider.GetRequiredService<IMigrationService>();

        try
        {
            _logger.LogInformation("Starting migration for all tenants");
            await migrationService.MigrateAllTenantDatabasesAsync();
            _logger.LogInformation("All tenants migration completed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to migrate all tenants");
            throw;
        }
    }
}