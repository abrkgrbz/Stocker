using Microsoft.Extensions.Diagnostics.HealthChecks;
using Stocker.Modules.Inventory.Infrastructure.BackgroundServices;
using Stocker.Modules.Inventory.Infrastructure.Services;

namespace Stocker.Modules.Inventory.Infrastructure.Health;

/// <summary>
/// Health check for Inventory module background services.
/// Monitors audit fallback queue size and overdue transfer count.
/// </summary>
public class InventoryHealthCheck : IHealthCheck
{
    private const int FallbackQueueWarningThreshold = 100;
    private const int FallbackQueueCriticalThreshold = 500;
    private const int OverdueTransferWarningThreshold = 5;
    private const int OverdueTransferCriticalThreshold = 20;

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var fallbackQueueSize = InventoryAuditService.FallbackQueue.Count;
        var overdueTransferCount = TransferTimeoutMonitorService.LastOverdueTransferCount;
        var lastTransferCheckTime = TransferTimeoutMonitorService.LastCheckTime;

        var data = new Dictionary<string, object>
        {
            { "audit_fallback_queue_size", fallbackQueueSize },
            { "overdue_transfer_count", overdueTransferCount },
            { "transfer_monitor_last_check", lastTransferCheckTime?.ToString("O") ?? "never" }
        };

        // Critical: fallback queue is very large (potential memory pressure)
        if (fallbackQueueSize >= FallbackQueueCriticalThreshold)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy(
                $"Audit fallback queue critically high: {fallbackQueueSize} entries pending. Database connectivity issue suspected.",
                data: data));
        }

        // Critical: too many overdue transfers
        if (overdueTransferCount >= OverdueTransferCriticalThreshold)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy(
                $"Critical number of overdue transfers: {overdueTransferCount}. Supply chain disruption suspected.",
                data: data));
        }

        // Warning: fallback queue growing
        if (fallbackQueueSize >= FallbackQueueWarningThreshold)
        {
            return Task.FromResult(HealthCheckResult.Degraded(
                $"Audit fallback queue elevated: {fallbackQueueSize} entries pending.",
                data: data));
        }

        // Warning: several overdue transfers
        if (overdueTransferCount >= OverdueTransferWarningThreshold)
        {
            return Task.FromResult(HealthCheckResult.Degraded(
                $"Elevated overdue transfers: {overdueTransferCount}.",
                data: data));
        }

        return Task.FromResult(HealthCheckResult.Healthy(
            "Inventory services operating normally.",
            data: data));
    }
}
