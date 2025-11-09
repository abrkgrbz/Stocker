using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire background job for periodic tenant health checks
/// </summary>
public class TenantHealthCheckJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TenantHealthCheckJob> _logger;

    public TenantHealthCheckJob(
        IServiceProvider serviceProvider,
        ILogger<TenantHealthCheckJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Performs health checks for all active tenants
    /// Scheduled to run every 15 minutes
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    public async Task ExecuteAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var healthCheckService = scope.ServiceProvider.GetRequiredService<ITenantHealthCheckService>();

        _logger.LogInformation("Starting tenant health check job");

        try
        {
            var result = await healthCheckService.PerformAllTenantsHealthCheckAsync();

            if (result.IsSuccess)
            {
                _logger.LogInformation(
                    "Tenant health check job completed successfully. Tenants checked: {Count}",
                    result.Value);
            }
            else
            {
                _logger.LogError(
                    "Tenant health check job failed: {Error}",
                    result.Error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in tenant health check job");
            throw; // Re-throw to trigger Hangfire retry
        }
    }

    /// <summary>
    /// Performs health check for a specific tenant
    /// Can be triggered manually or on-demand
    /// </summary>
    [AutomaticRetry(Attempts = 2, DelaysInSeconds = new[] { 30, 120 })]
    public async Task ExecuteForTenantAsync(Guid tenantId)
    {
        using var scope = _serviceProvider.CreateScope();
        var healthCheckService = scope.ServiceProvider.GetRequiredService<ITenantHealthCheckService>();

        _logger.LogInformation("Starting health check for tenant {TenantId}", tenantId);

        try
        {
            var result = await healthCheckService.PerformHealthCheckAsync(tenantId);

            if (result.IsSuccess)
            {
                _logger.LogInformation(
                    "Health check completed for tenant {TenantId}. Status: {Status}, Score: {Score}",
                    tenantId, result.Value.OverallStatus, result.Value.HealthScore);
            }
            else
            {
                _logger.LogError(
                    "Health check failed for tenant {TenantId}: {Error}",
                    tenantId, result.Error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in health check for tenant {TenantId}", tenantId);
            throw;
        }
    }

    /// <summary>
    /// Schedules the recurring health check job
    /// Call this during application startup
    /// </summary>
    public static void Schedule()
    {
        // Run every 15 minutes
        RecurringJob.AddOrUpdate<TenantHealthCheckJob>(
            "tenant-health-check",
            job => job.ExecuteAsync(),
            "*/15 * * * *", // Every 15 minutes
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });
    }

    /// <summary>
    /// Triggers an immediate health check for a specific tenant
    /// </summary>
    public static string TriggerForTenant(Guid tenantId)
    {
        return BackgroundJob.Enqueue<TenantHealthCheckJob>(
            job => job.ExecuteForTenantAsync(tenantId));
    }
}
