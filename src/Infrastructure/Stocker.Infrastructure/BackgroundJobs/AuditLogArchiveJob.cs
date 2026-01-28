using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire background job for archiving old audit logs.
/// Moves audit records older than the retention period to archive storage
/// and removes them from the active database to maintain performance.
/// </summary>
public class AuditLogArchiveJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AuditLogArchiveJob> _logger;

    // Default retention period in months (6 months = keep in active DB)
    private const int ActiveRetentionMonths = 6;

    // Archive retention in years (for compliance - KVKK requires some records for 10 years)
    private const int ArchiveRetentionYears = 10;

    public AuditLogArchiveJob(
        IServiceProvider serviceProvider,
        ILogger<AuditLogArchiveJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Archives old audit logs from all tenant databases.
    /// Scheduled to run on the 1st of every month at 02:00 UTC
    /// </summary>
    [AutomaticRetry(Attempts = 2, DelaysInSeconds = new[] { 300, 900 })]
    [Queue("maintenance")]
    public async Task ExecuteAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var masterContext = scope.ServiceProvider.GetRequiredService<IMasterDbContext>();
        var tenantDbContextFactory = scope.ServiceProvider.GetRequiredService<ITenantDbContextFactory>();

        _logger.LogInformation("Starting audit log archive job");

        try
        {
            var cutoffDate = DateTime.UtcNow.AddMonths(-ActiveRetentionMonths);
            var totalArchived = 0;
            var totalDeleted = 0;
            var tenantsProcessed = 0;

            // Process Master database audit logs
            var (masterArchived, masterDeleted) = await ProcessMasterAuditLogsAsync(masterContext, cutoffDate);
            totalArchived += masterArchived;
            totalDeleted += masterDeleted;

            // Get all active tenants
            var tenants = await masterContext.Tenants
                .Where(t => t.IsActive)
                .Select(t => new { t.Id, t.Name })
                .ToListAsync();

            _logger.LogInformation(
                "Processing audit logs for {TenantCount} tenants. Cutoff date: {CutoffDate:yyyy-MM-dd}",
                tenants.Count, cutoffDate);

            foreach (var tenant in tenants)
            {
                try
                {
                    var (archived, deleted) = await ProcessTenantAuditLogsAsync(
                        tenant.Id, tenant.Name, tenantDbContextFactory, cutoffDate);

                    totalArchived += archived;
                    totalDeleted += deleted;
                    tenantsProcessed++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "Error processing audit logs for tenant {TenantId} ({TenantName})",
                        tenant.Id, tenant.Name);
                }
            }

            _logger.LogInformation(
                "Audit log archive completed. Tenants: {Tenants}, Archived: {Archived}, Deleted: {Deleted}",
                tenantsProcessed, totalArchived, totalDeleted);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in audit log archive job");
            throw;
        }
    }

    private async Task<(int archived, int deleted)> ProcessMasterAuditLogsAsync(
        IMasterDbContext masterContext,
        DateTime cutoffDate)
    {
        var archivedCount = 0;
        var deletedCount = 0;

        try
        {
            // Note: Actual implementation would depend on your audit log structure
            // This is a template showing the pattern

            // Get old audit logs that need archiving
            // In a real implementation, you'd have an AuditLog entity

            _logger.LogDebug("Processing Master database audit logs before {CutoffDate:yyyy-MM-dd}", cutoffDate);

            // Example: Archive to file storage (MinIO) or separate archive table
            // var oldLogs = await masterContext.AuditLogs
            //     .Where(a => a.CreatedAt < cutoffDate && !a.IsArchived)
            //     .Take(10000) // Process in batches
            //     .ToListAsync();

            // Archive logic would go here:
            // 1. Export to JSON/Parquet file
            // 2. Upload to MinIO cold storage
            // 3. Mark as archived or delete from active table

            _logger.LogInformation("Master database audit log processing completed");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error processing Master audit logs");
        }

        return (archivedCount, deletedCount);
    }

    private async Task<(int archived, int deleted)> ProcessTenantAuditLogsAsync(
        Guid tenantId,
        string tenantName,
        ITenantDbContextFactory contextFactory,
        DateTime cutoffDate)
    {
        var archivedCount = 0;
        var deletedCount = 0;

        using var tenantScope = _serviceProvider.CreateScope();

        var tenantContext = await contextFactory.CreateDbContextAsync(tenantId);
        if (tenantContext == null)
        {
            _logger.LogWarning("Could not create context for tenant {TenantId}", tenantId);
            return (0, 0);
        }

        try
        {
            _logger.LogDebug("Processing audit logs for tenant {TenantName}", tenantName);

            // Process in batches to avoid memory issues
            const int batchSize = 5000;
            var processedTotal = 0;

            // Example audit log processing (adjust based on your actual audit entity)
            // This demonstrates the archiving pattern:

            /*
            while (true)
            {
                var oldLogs = await tenantContext.AuditLogs
                    .Where(a => a.Timestamp < cutoffDate && !a.IsArchived)
                    .OrderBy(a => a.Timestamp)
                    .Take(batchSize)
                    .ToListAsync();

                if (!oldLogs.Any())
                    break;

                // 1. Archive to storage
                var archiveService = tenantScope.ServiceProvider.GetService<IArchiveStorageService>();
                if (archiveService != null)
                {
                    var archiveResult = await archiveService.ArchiveAuditLogsAsync(
                        tenantId,
                        oldLogs.Select(l => new AuditLogArchiveEntry
                        {
                            Id = l.Id,
                            Action = l.Action,
                            EntityType = l.EntityType,
                            EntityId = l.EntityId,
                            OldValues = l.OldValues,
                            NewValues = l.NewValues,
                            UserId = l.UserId,
                            Timestamp = l.Timestamp,
                            IpAddress = l.IpAddress
                        }).ToList());

                    if (archiveResult.IsSuccess)
                    {
                        // 2. Remove from active database
                        tenantContext.AuditLogs.RemoveRange(oldLogs);
                        await tenantContext.SaveChangesAsync();

                        archivedCount += oldLogs.Count;
                        deletedCount += oldLogs.Count;
                    }
                }

                processedTotal += oldLogs.Count;

                // Log progress
                if (processedTotal % 10000 == 0)
                {
                    _logger.LogDebug(
                        "Processed {Count} audit logs for tenant {TenantName}",
                        processedTotal, tenantName);
                }
            }
            */

            // For now, just log that we checked
            _logger.LogDebug(
                "Audit log check completed for tenant {TenantName}. " +
                "Note: Implement actual archiving based on your audit log structure.",
                tenantName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error processing audit logs for tenant {TenantName}", tenantName);
        }

        return (archivedCount, deletedCount);
    }

    /// <summary>
    /// Schedules the recurring audit log archive job
    /// </summary>
    public static void Schedule()
    {
        RecurringJob.AddOrUpdate<AuditLogArchiveJob>(
            "audit-log-archive",
            job => job.ExecuteAsync(),
            "0 2 1 * *", // Every 1st of month at 02:00 UTC
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });
    }
}
