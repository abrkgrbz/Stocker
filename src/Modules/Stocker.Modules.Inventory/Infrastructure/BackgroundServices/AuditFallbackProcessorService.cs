using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Tenant.Entities;
using Stocker.Modules.Inventory.Infrastructure.Persistence;
using Stocker.Modules.Inventory.Infrastructure.Services;

namespace Stocker.Modules.Inventory.Infrastructure.BackgroundServices;

/// <summary>
/// Background service that processes audit log entries from the fallback queue.
/// When the primary DB write fails, entries are queued in-memory and this service
/// retries persisting them. Entries exceeding max retry count are logged as critical
/// and discarded to prevent unbounded memory growth.
/// Runs every 60 seconds.
/// </summary>
public class AuditFallbackProcessorService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AuditFallbackProcessorService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(60);
    private const int MaxRetryCount = 5;
    private const int MaxBatchSize = 50;

    public AuditFallbackProcessorService(
        IServiceScopeFactory scopeFactory,
        ILogger<AuditFallbackProcessorService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AuditFallbackProcessorService started. Interval: {Interval}, MaxRetryCount: {MaxRetryCount}",
            Interval, MaxRetryCount);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(Interval, stoppingToken);
                await ProcessFallbackQueueAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing audit fallback queue. Will retry next interval.");
            }
        }

        _logger.LogInformation("AuditFallbackProcessorService stopped. Remaining queue size: {QueueSize}",
            InventoryAuditService.FallbackQueue.Count);
    }

    private async Task ProcessFallbackQueueAsync(CancellationToken cancellationToken)
    {
        if (InventoryAuditService.FallbackQueue.IsEmpty)
            return;

        _logger.LogInformation("Processing audit fallback queue. Current size: {QueueSize}",
            InventoryAuditService.FallbackQueue.Count);

        var processed = 0;
        var failed = 0;
        var discarded = 0;

        using var scope = _scopeFactory.CreateScope();

        for (var i = 0; i < MaxBatchSize && InventoryAuditService.FallbackQueue.TryDequeue(out var entry); i++)
        {
            if (entry.RetryCount >= MaxRetryCount)
            {
                _logger.LogCritical(
                    "AUDIT LOG PERMANENTLY LOST: {EntityType} {EntityId} action={Action} at {Timestamp}. " +
                    "Exceeded max retry count ({MaxRetryCount}). Original failure: {FailureReason}",
                    entry.EntityType, entry.EntityId, entry.Action, entry.Timestamp,
                    MaxRetryCount, entry.FailureReason);
                discarded++;
                continue;
            }

            try
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();

                var tenantId = !string.IsNullOrEmpty(entry.TenantId) && Guid.TryParse(entry.TenantId, out var tid)
                    ? tid
                    : Guid.Empty;

                var auditLog = AuditLog.Create(
                    tenantId,
                    entry.EntityType,
                    entry.EntityId,
                    entry.Action,
                    entry.UserId ?? "system",
                    entry.UserName ?? "System",
                    null, null, null);

                if (!string.IsNullOrEmpty(entry.OldValue))
                    auditLog.SetOldValues(entry.OldValue);

                if (!string.IsNullOrEmpty(entry.NewValue))
                    auditLog.SetNewValues(entry.NewValue);

                if (!string.IsNullOrEmpty(entry.AdditionalData))
                    auditLog.SetAdditionalData(entry.AdditionalData);

                dbContext.AuditLogs.Add(auditLog);
                await dbContext.SaveChangesAsync(cancellationToken);
                processed++;
            }
            catch (Exception ex)
            {
                entry.RetryCount++;
                entry.FailureReason = ex.Message;
                InventoryAuditService.FallbackQueue.Enqueue(entry);
                failed++;

                _logger.LogWarning(ex,
                    "Retry {RetryCount}/{MaxRetryCount} failed for audit entry {EntityType} {EntityId}. Re-queued.",
                    entry.RetryCount, MaxRetryCount, entry.EntityType, entry.EntityId);
            }
        }

        if (processed > 0 || failed > 0 || discarded > 0)
        {
            _logger.LogInformation(
                "Audit fallback processing complete. Processed: {Processed}, Failed (re-queued): {Failed}, Discarded: {Discarded}, Remaining: {Remaining}",
                processed, failed, discarded, InventoryAuditService.FallbackQueue.Count);
        }
    }
}
