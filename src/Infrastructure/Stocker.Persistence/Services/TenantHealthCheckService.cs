using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.TenantHealthCheck;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Persistence.Services;

public class TenantHealthCheckService : ITenantHealthCheckService
{
    private readonly IMasterDbContext _masterContext;
    private readonly ILogger<TenantHealthCheckService> _logger;

    public TenantHealthCheckService(
        IMasterDbContext masterContext,
        ILogger<TenantHealthCheckService> logger)
    {
        _masterContext = masterContext;
        _logger = logger;
    }

    public async Task<Result<TenantHealthCheckDto>> PerformHealthCheckAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var tenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<TenantHealthCheckDto>.Failure(Error.NotFound("TenantHealthCheck.TenantNotFound", "Tenant not found"));
            }

            // Create new health check entity
            var healthCheck = TenantHealthCheck.Create(tenantId);

            // Perform basic health checks (placeholder implementations)
            healthCheck.UpdateDatabaseHealth(true, 50, 500, 5);
            healthCheck.UpdateApiHealth(true, 150, 2, 100);
            healthCheck.UpdateStorageHealth(true, 2048, 8192);
            healthCheck.UpdateServiceHealth(true, true, true, true);
            healthCheck.UpdatePerformanceMetrics(45.5, 62.3, 25, 8);
            healthCheck.UpdateSecurityHealth(0, 0, DateTime.UtcNow.AddHours(-12), false);
            healthCheck.UpdateBackupHealth(DateTime.UtcNow.AddHours(-6), true, 1200);

            // Calculate overall health score
            healthCheck.CalculateOverallHealth();

            // Save to database
            _masterContext.TenantHealthChecks.Add(healthCheck);
            await _masterContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Health check completed for tenant {TenantId}. Status: {Status}, Score: {Score}",
                tenantId, healthCheck.OverallStatus, healthCheck.HealthScore);

            return Result<TenantHealthCheckDto>.Success(MapToDto(healthCheck));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing health check for tenant {TenantId}", tenantId);
            return Result<TenantHealthCheckDto>.Failure(Error.Failure("TenantHealthCheck.ExecutionFailed", $"Health check failed: {ex.Message}"));
        }
    }

    public async Task<Result<TenantHealthCheckDto>> GetLatestHealthCheckAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var healthCheck = await _masterContext.TenantHealthChecks
                .Where(h => h.TenantId == tenantId)
                .OrderByDescending(h => h.CheckedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (healthCheck == null)
            {
                return Result<TenantHealthCheckDto>.Failure(Error.NotFound("TenantHealthCheck.NotFound", "No health check found for this tenant"));
            }

            return Result<TenantHealthCheckDto>.Success(MapToDto(healthCheck));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting latest health check for tenant {TenantId}", tenantId);
            return Result<TenantHealthCheckDto>.Failure(Error.Failure("TenantHealthCheck.RetrievalFailed", $"Failed to retrieve health check: {ex.Message}"));
        }
    }

    public async Task<Result<TenantHealthCheckSummaryDto>> GetHealthSummaryAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var tenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);

            if (tenant == null)
            {
                return Result<TenantHealthCheckSummaryDto>.Failure(Error.NotFound("TenantHealthCheck.TenantNotFound", "Tenant not found"));
            }

            var now = DateTime.UtcNow;
            var checks = await _masterContext.TenantHealthChecks
                .Where(h => h.TenantId == tenantId)
                .OrderByDescending(h => h.CheckedAt)
                .Take(100)
                .ToListAsync(cancellationToken);

            var latestCheck = checks.FirstOrDefault();
            if (latestCheck == null)
            {
                return Result<TenantHealthCheckSummaryDto>.Failure(Error.NotFound("TenantHealthCheck.NoChecksFound", "No health checks found"));
            }

            var summary = new TenantHealthCheckSummaryDto
            {
                TenantId = tenantId,
                TenantName = tenant.Name,
                TenantCode = tenant.Code,
                CurrentStatus = latestCheck.OverallStatus,
                CurrentScore = latestCheck.HealthScore,
                LastCheckDate = latestCheck.CheckedAt,
                ChecksLast24Hours = checks.Count(c => c.CheckedAt >= now.AddDays(-1)),
                ChecksLast7Days = checks.Count(c => c.CheckedAt >= now.AddDays(-7)),
                AverageScore7Days = checks
                    .Where(c => c.CheckedAt >= now.AddDays(-7))
                    .Select(c => (decimal)c.HealthScore)
                    .DefaultIfEmpty(0)
                    .Average(),
                CriticalIssues = IdentifyCriticalIssues(latestCheck)
            };

            return Result<TenantHealthCheckSummaryDto>.Success(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting health summary for tenant {TenantId}", tenantId);
            return Result<TenantHealthCheckSummaryDto>.Failure(Error.Failure("TenantHealthCheck.SummaryFailed", $"Failed to retrieve health summary: {ex.Message}"));
        }
    }

    public async Task<Result<List<TenantHealthCheckDto>>> GetHealthHistoryAsync(
        Guid tenantId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var checks = await _masterContext.TenantHealthChecks
                .Where(h => h.TenantId == tenantId && h.CheckedAt >= startDate && h.CheckedAt <= endDate)
                .OrderBy(h => h.CheckedAt)
                .ToListAsync(cancellationToken);

            var dtos = checks.Select(MapToDto).ToList();
            return Result<List<TenantHealthCheckDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting health history for tenant {TenantId}", tenantId);
            return Result<List<TenantHealthCheckDto>>.Failure(Error.Failure("TenantHealthCheck.HistoryFailed", $"Failed to retrieve health history: {ex.Message}"));
        }
    }

    public async Task<Result<List<TenantHealthTrendDto>>> GetHealthTrendAsync(
        Guid tenantId,
        int days = 30,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var startDate = DateTime.UtcNow.AddDays(-days);
            var checks = await _masterContext.TenantHealthChecks
                .Where(h => h.TenantId == tenantId && h.CheckedAt >= startDate)
                .OrderBy(h => h.CheckedAt)
                .ToListAsync(cancellationToken);

            var trends = checks.Select(c => new TenantHealthTrendDto
            {
                TenantId = c.TenantId,
                Date = c.CheckedAt,
                HealthScore = c.HealthScore,
                IsDatabaseHealthy = c.IsDatabaseHealthy,
                IsApiHealthy = c.IsApiHealthy,
                IsStorageHealthy = c.IsStorageHealthy
            }).ToList();

            return Result<List<TenantHealthTrendDto>>.Success(trends);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting health trend for tenant {TenantId}", tenantId);
            return Result<List<TenantHealthTrendDto>>.Failure(Error.Failure("TenantHealthCheck.TrendFailed", $"Failed to retrieve health trend: {ex.Message}"));
        }
    }

    public async Task<Result<List<TenantHealthCheckSummaryDto>>> GetUnhealthyTenantsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var recentChecks = await _masterContext.TenantHealthChecks
                .Where(h => h.OverallStatus == "Unhealthy" || h.OverallStatus == "Degraded")
                .GroupBy(h => h.TenantId)
                .Select(g => g.OrderByDescending(h => h.CheckedAt).First())
                .ToListAsync(cancellationToken);

            var tenantIds = recentChecks.Select(c => c.TenantId).ToList();
            var tenants = await _masterContext.Tenants
                .Where(t => tenantIds.Contains(t.Id))
                .ToListAsync(cancellationToken);

            var summaries = new List<TenantHealthCheckSummaryDto>();
            foreach (var check in recentChecks)
            {
                var tenant = tenants.FirstOrDefault(t => t.Id == check.TenantId);
                if (tenant != null)
                {
                    summaries.Add(new TenantHealthCheckSummaryDto
                    {
                        TenantId = check.TenantId,
                        TenantName = tenant.Name,
                        TenantCode = tenant.Code,
                        CurrentStatus = check.OverallStatus,
                        CurrentScore = check.HealthScore,
                        LastCheckDate = check.CheckedAt,
                        CriticalIssues = IdentifyCriticalIssues(check)
                    });
                }
            }

            return Result<List<TenantHealthCheckSummaryDto>>.Success(summaries.OrderBy(s => s.CurrentScore).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unhealthy tenants");
            return Result<List<TenantHealthCheckSummaryDto>>.Failure(Error.Failure("TenantHealthCheck.UnhealthyTenantsFailed", $"Failed to retrieve unhealthy tenants: {ex.Message}"));
        }
    }

    public async Task<Result<int>> PerformAllTenantsHealthCheckAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var activeTenants = await _masterContext.Tenants
                .Where(t => t.IsActive)
                .Select(t => t.Id)
                .ToListAsync(cancellationToken);

            int successCount = 0;
            foreach (var tenantId in activeTenants)
            {
                var result = await PerformHealthCheckAsync(tenantId, cancellationToken);
                if (result.IsSuccess)
                {
                    successCount++;
                }
            }

            _logger.LogInformation(
                "Completed health checks for all tenants. Success: {SuccessCount}/{TotalCount}",
                successCount, activeTenants.Count);

            return Result<int>.Success(successCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing health checks for all tenants");
            return Result<int>.Failure(Error.Failure("TenantHealthCheck.AllChecksFailed", $"Failed to perform health checks: {ex.Message}"));
        }
    }

    #region Private Helper Methods

    private List<HealthIssueDto> IdentifyCriticalIssues(TenantHealthCheck check)
    {
        var issues = new List<HealthIssueDto>();

        if (!check.IsDatabaseHealthy)
        {
            issues.Add(new HealthIssueDto
            {
                Category = "Database",
                Issue = $"Database is unhealthy. Response time: {check.DatabaseResponseTimeMs}ms",
                Severity = "Critical",
                Recommendation = "Check database performance and optimize slow queries"
            });
        }

        if (!check.IsApiHealthy)
        {
            issues.Add(new HealthIssueDto
            {
                Category = "API",
                Issue = $"API is unhealthy. Error rate: {check.ApiErrorRate}%",
                Severity = "Critical",
                Recommendation = "Investigate API errors and fix failing endpoints"
            });
        }

        if (check.StorageUsagePercent > 80)
        {
            issues.Add(new HealthIssueDto
            {
                Category = "Storage",
                Issue = $"Storage usage: {check.StorageUsagePercent}%",
                Severity = check.StorageUsagePercent > 90 ? "Critical" : "Warning",
                Recommendation = "Clean up old data or increase storage capacity"
            });
        }

        if (!check.IsEmailServiceHealthy || !check.IsBackgroundJobsHealthy)
        {
            issues.Add(new HealthIssueDto
            {
                Category = "Services",
                Issue = "One or more services are unhealthy",
                Severity = "Warning",
                Recommendation = "Check service status and restart if necessary"
            });
        }

        if (check.FailedLoginAttempts > 50)
        {
            issues.Add(new HealthIssueDto
            {
                Category = "Security",
                Issue = $"High failed login attempts: {check.FailedLoginAttempts}",
                Severity = "Warning",
                Recommendation = "Review security logs for potential attacks"
            });
        }

        if (!check.IsBackupHealthy || (check.LastBackupDate.HasValue && check.LastBackupDate.Value < DateTime.UtcNow.AddDays(-2)))
        {
            issues.Add(new HealthIssueDto
            {
                Category = "Backup",
                Issue = "Backup is outdated or failed",
                Severity = "Critical",
                Recommendation = "Verify backup system and ensure regular backups"
            });
        }

        return issues;
    }

    private TenantHealthCheckDto MapToDto(TenantHealthCheck entity)
    {
        return new TenantHealthCheckDto
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            CheckedAt = entity.CheckedAt,
            OverallStatus = entity.OverallStatus,
            HealthScore = entity.HealthScore,
            IsDatabaseHealthy = entity.IsDatabaseHealthy,
            DatabaseResponseTimeMs = entity.DatabaseResponseTimeMs,
            DatabaseSizeMb = entity.DatabaseSizeMb,
            ActiveConnections = entity.ActiveConnections,
            IsApiHealthy = entity.IsApiHealthy,
            ApiResponseTimeMs = entity.ApiResponseTimeMs,
            ApiErrorRate = entity.ApiErrorRate,
            ApiRequestsPerMinute = entity.ApiRequestsPerMinute,
            IsStorageHealthy = entity.IsStorageHealthy,
            StorageUsedMb = entity.StorageUsedMb,
            StorageAvailableMb = entity.StorageAvailableMb,
            StorageUsagePercent = entity.StorageUsagePercent,
            IsEmailServiceHealthy = entity.IsEmailServiceHealthy,
            IsNotificationServiceHealthy = entity.IsNotificationServiceHealthy,
            IsBackgroundJobsHealthy = entity.IsBackgroundJobsHealthy,
            IsCacheHealthy = entity.IsCacheHealthy,
            CpuUsagePercent = entity.CpuUsagePercent,
            MemoryUsagePercent = entity.MemoryUsagePercent,
            ActiveUsers = entity.ActiveUsers,
            ConcurrentSessions = entity.ConcurrentSessions,
            FailedLoginAttempts = entity.FailedLoginAttempts,
            SecurityIncidents = entity.SecurityIncidents,
            LastSecurityScan = entity.LastSecurityScan,
            HasSecurityUpdates = entity.HasSecurityUpdates,
            LastBackupDate = entity.LastBackupDate,
            IsBackupHealthy = entity.IsBackupHealthy,
            LastBackupSizeMb = entity.LastBackupSizeMb,
            Errors = entity.Errors,
            Warnings = entity.Warnings,
            ErrorCount = entity.ErrorCount,
            WarningCount = entity.WarningCount
        };
    }

    #endregion
}
