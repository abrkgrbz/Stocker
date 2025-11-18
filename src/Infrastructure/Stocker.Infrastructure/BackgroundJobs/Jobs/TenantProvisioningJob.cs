using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
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
        var backgroundJobService = scope.ServiceProvider.GetRequiredService<IBackgroundJobService>();

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
            _logger.LogError(ex, "CRITICAL: Failed to provision tenant: {TenantId}. Attempt will be retried by Hangfire.", tenantId);
            
            // Tenant'ı deaktif et
            try
            {
                var tenant = await masterUnitOfWork.Repository<Tenant>().GetByIdAsync(tenantId);
                if (tenant != null)
                {
                    tenant.Deactivate();
                    await masterUnitOfWork.SaveChangesAsync();
                    
                    _logger.LogWarning("Tenant {TenantId} marked as inactive. Will retry provisioning.", tenantId);
                }
            }
            catch (Exception deactivateEx)
            {
                _logger.LogError(deactivateEx, "Failed to deactivate tenant after provisioning failure: {TenantId}", tenantId);
            }
            
            // Check if this is the last retry attempt
            var performContext = Hangfire.PerformContext.GetCurrent();
            if (performContext != null)
            {
                var retryAttempt = performContext.GetJobParameter<int>("RetryCount");
                if (retryAttempt >= 2) // 0-indexed, so 2 means 3rd attempt (final)
                {
                    _logger.LogError("Final retry attempt failed for tenant {TenantId}. Scheduling rollback.", tenantId);
                    
                    // Queue rollback job
                    backgroundJobService.Enqueue<ITenantProvisioningJob>(job =>
                        job.RollbackFailedProvisioningAsync(tenantId));
                }
            }
            
            // Re-throw to trigger Hangfire retry
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

    [Queue("critical")]
    [AutomaticRetry(Attempts = 1)] // Only try once for rollback
    public async Task RollbackFailedProvisioningAsync(Guid tenantId)
    {
        using var scope = _serviceProvider.CreateScope();
        var masterUnitOfWork = scope.ServiceProvider.GetRequiredService<IMasterUnitOfWork>();

        try
        {
            _logger.LogWarning("Starting rollback for failed tenant provisioning: {TenantId}", tenantId);

            // Get tenant
            var tenant = await masterUnitOfWork.Repository<Tenant>().GetByIdAsync(tenantId);
            if (tenant == null)
            {
                _logger.LogWarning("Tenant {TenantId} not found for rollback - may have been already deleted", tenantId);
                return;
            }

            // Get associated master user by tenant's contact email
            var masterUser = await masterUnitOfWork.Repository<MasterUser>()
                .SingleOrDefaultAsync(u => u.Email.Value == tenant.ContactEmail.Value);

            // Delete tenant
            masterUnitOfWork.Repository<Tenant>().Remove(tenant);
            
            // Delete master user if found
            if (masterUser != null)
            {
                masterUnitOfWork.Repository<MasterUser>().Remove(masterUser);
                _logger.LogInformation("Deleted MasterUser {UserId} during tenant provisioning rollback", masterUser.Id);
            }

            await masterUnitOfWork.SaveChangesAsync();

            _logger.LogInformation("Rollback completed for failed tenant provisioning: {TenantId}", tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to rollback tenant provisioning for: {TenantId}", tenantId);
            throw;
        }
    }
}