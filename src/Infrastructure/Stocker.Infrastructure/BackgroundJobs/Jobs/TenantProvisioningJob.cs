using Hangfire;
using Microsoft.Extensions.Configuration;
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

        // Get progress notifier for real-time updates
        var progressNotifier = scope.ServiceProvider.GetService<ISetupProgressNotifier>();

        try
        {
            _logger.LogInformation("Starting tenant provisioning for TenantId: {TenantId}", tenantId);

            // Step 1: Initializing
            await NotifyProgressAsync(progressNotifier, tenantId, SetupStepType.Initializing,
                "Kurulum başlatılıyor...", 5);

            // Tenant'ı kontrol et
            var tenant = await masterUnitOfWork.Repository<Tenant>().GetByIdAsync(tenantId);
            if (tenant == null)
            {
                _logger.LogError("Tenant not found: {TenantId}", tenantId);
                await NotifyErrorAsync(progressNotifier, tenantId, "Tenant bulunamadı");
                throw new InvalidOperationException($"Tenant {tenantId} not found");
            }

            // Step 2: Creating Database
            await NotifyProgressAsync(progressNotifier, tenantId, SetupStepType.CreatingDatabase,
                "Veritabanı oluşturuluyor...", 15);

            // CRITICAL: Update connection string to real SQL Server connection string
            // Get master connection string template from configuration
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
            var masterConnectionString = configuration.GetConnectionString("MasterConnection");

            if (string.IsNullOrEmpty(masterConnectionString))
            {
                _logger.LogError("MasterConnection string not found in configuration");
                await NotifyErrorAsync(progressNotifier, tenantId, "Veritabanı bağlantı ayarları bulunamadı");
                throw new InvalidOperationException("MasterConnection string not configured");
            }

            // Build tenant connection string based on master connection but with tenant database name
            var tenantDatabaseName = $"Stocker_{tenantId:N}";
            var tenantConnectionString = masterConnectionString.Replace("StockerMasterDb", tenantDatabaseName);

            // Update tenant connection string
            var connectionStringResult = Domain.Master.ValueObjects.ConnectionString.Create(tenantConnectionString);
            if (connectionStringResult.IsFailure)
            {
                _logger.LogError("Failed to create connection string for tenant {TenantId}: {Error}", tenantId, connectionStringResult.Error);
                await NotifyErrorAsync(progressNotifier, tenantId, "Veritabanı bağlantısı oluşturulamadı");
                throw new InvalidOperationException($"Invalid connection string: {connectionStringResult.Error}");
            }

            tenant.UpdateConnectionString(connectionStringResult.Value);
            await masterUnitOfWork.SaveChangesAsync(CancellationToken.None);

            _logger.LogInformation("Updated connection string for tenant {TenantId} to use database {DatabaseName}", tenantId, tenantDatabaseName);

            // Step 3: Running Migrations
            await NotifyProgressAsync(progressNotifier, tenantId, SetupStepType.RunningMigrations,
                "Veritabanı tabloları oluşturuluyor...", 35);

            // Database migration
            _logger.LogInformation("Creating database for tenant: {TenantName}", tenant.Name);
            await migrationService.MigrateTenantDatabaseAsync(tenantId);

            // Step 4: Seeding Data
            await NotifyProgressAsync(progressNotifier, tenantId, SetupStepType.SeedingData,
                "Temel veriler yükleniyor...", 55);

            // Seed data
            _logger.LogInformation("Seeding data for tenant: {TenantName}", tenant.Name);
            await migrationService.SeedTenantDataAsync(tenantId);

            // Step 5: Configuring Modules
            await NotifyProgressAsync(progressNotifier, tenantId, SetupStepType.ConfiguringModules,
                "Modüller yapılandırılıyor...", 75);

            // Note: Module configuration happens during seeding, this is for progress visibility
            await Task.Delay(500); // Small delay for UI visibility

            // Step 6: Activating Tenant
            await NotifyProgressAsync(progressNotifier, tenantId, SetupStepType.ActivatingTenant,
                "Hesap aktifleştiriliyor...", 90);

            // Tenant'ı aktif olarak işaretle
            tenant.Activate();
            await masterUnitOfWork.SaveChangesAsync();

            // Step 7: Completed
            await NotifyProgressAsync(progressNotifier, tenantId, SetupStepType.Completed,
                "Kurulum tamamlandı! Yönlendiriliyorsunuz...", 100, isCompleted: true);

            _logger.LogInformation("Tenant provisioning completed successfully for: {TenantName}", tenant.Name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to provision tenant: {TenantId}", tenantId);

            // Notify error via SignalR
            await NotifyErrorAsync(progressNotifier, tenantId, ex.Message);

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

            // Note: Hangfire will automatically retry 3 times (configured in AutomaticRetry attribute)
            // After all retries are exhausted, manual intervention or a separate cleanup job is needed
            // The rollback mechanism is handled by a separate scheduled job that checks for failed provisions
            // Re-throw to trigger Hangfire retry
            throw;
        }
    }

    /// <summary>
    /// Helper method to send progress notifications
    /// </summary>
    private async Task NotifyProgressAsync(
        ISetupProgressNotifier? notifier,
        Guid tenantId,
        SetupStepType step,
        string message,
        int progressPercentage,
        bool isCompleted = false)
    {
        if (notifier == null) return;

        try
        {
            var progress = SetupProgressUpdate.Create(tenantId, step, message, progressPercentage);
            progress.IsCompleted = isCompleted;
            await notifier.NotifyProgressAsync(progress);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send progress notification for tenant {TenantId}", tenantId);
            // Don't throw - progress notification failure shouldn't stop provisioning
        }
    }

    /// <summary>
    /// Helper method to send error notifications
    /// </summary>
    private async Task NotifyErrorAsync(ISetupProgressNotifier? notifier, Guid tenantId, string errorMessage)
    {
        if (notifier == null) return;

        try
        {
            await notifier.NotifyErrorAsync(tenantId, errorMessage);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send error notification for tenant {TenantId}", tenantId);
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