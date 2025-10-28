# TenantHealthCheck - Implementation Guide

**Date**: 2025-10-28
**Purpose**: Complete guide for implementing and using TenantHealthCheck system for monitoring tenant health

## 🎯 Overview

`TenantHealthCheck` is a comprehensive tenant monitoring system that tracks:
- 📊 **Database Health** - Performance, size, connections
- 🌐 **API Health** - Response times, error rates, throughput
- 💾 **Storage Health** - Disk usage, available space
- ⚙️ **Service Health** - Email, notifications, background jobs, cache
- 📈 **Performance Metrics** - CPU, memory, active users
- 🔒 **Security Health** - Failed logins, incidents, updates
- 💿 **Backup Health** - Backup status and recency

## 📋 Entity Structure

**Location**: [TenantHealthCheck.cs:5-212](src/Core/Stocker.Domain/Master/Entities/TenantHealthCheck.cs#L5-L212)

**Key Properties**:
- `OverallStatus` - "Healthy", "Degraded", "Unhealthy"
- `HealthScore` - 0-100 calculated score
- Individual health flags for each component
- Errors and Warnings (JSON arrays)

**Health Score Calculation**:
```
Starting Score: 100

Critical (-20 points each):
- Database unhealthy
- API unhealthy
- Storage unhealthy

Important (-10 points each):
- Email service down
- Background jobs failing
- Backup issues

Performance (-5 points each):
- CPU > 80%
- Memory > 80%
- API error rate > 5%

Security (-5 points each):
- Security incidents
- Pending security updates

Penalties:
- -2 points per error
- -1 point per warning

Status Thresholds:
- Healthy: 90-100
- Degraded: 60-89
- Unhealthy: 0-59
```

## 🏗️ Implementation Steps

### Step 1: Create ITenantHealthCheckService Interface

**File**: `src/Core/Stocker.Application/Common/Interfaces/ITenantHealthCheckService.cs`

```csharp
namespace Stocker.Application.Common.Interfaces;

public interface ITenantHealthCheckService
{
    /// <summary>
    /// Perform health check for specific tenant
    /// </summary>
    Task<TenantHealthCheckResult> CheckTenantHealthAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Perform health check for all active tenants
    /// </summary>
    Task<IEnumerable<TenantHealthCheckResult>> CheckAllTenantsHealthAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get latest health check result for tenant
    /// </summary>
    Task<TenantHealthCheckResult?> GetLatestHealthCheckAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get health check history for tenant
    /// </summary>
    Task<IEnumerable<TenantHealthCheckResult>> GetHealthCheckHistoryAsync(
        Guid tenantId,
        DateTime fromDate,
        DateTime toDate,
        CancellationToken cancellationToken = default);
}

public class TenantHealthCheckResult
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string OverallStatus { get; set; } = string.Empty;
    public int HealthScore { get; set; }
    public DateTime CheckedAt { get; set; }

    public DatabaseHealth Database { get; set; } = new();
    public ApiHealth Api { get; set; } = new();
    public StorageHealth Storage { get; set; } = new();
    public ServiceHealth Services { get; set; } = new();
    public PerformanceMetrics Performance { get; set; } = new();
    public SecurityHealth Security { get; set; } = new();
    public BackupHealth Backup { get; set; } = new();

    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
}

public class DatabaseHealth
{
    public bool IsHealthy { get; set; }
    public long ResponseTimeMs { get; set; }
    public long SizeMb { get; set; }
    public int ActiveConnections { get; set; }
}

public class ApiHealth
{
    public bool IsHealthy { get; set; }
    public long ResponseTimeMs { get; set; }
    public int ErrorRate { get; set; }
    public int RequestsPerMinute { get; set; }
}

public class StorageHealth
{
    public bool IsHealthy { get; set; }
    public long UsedMb { get; set; }
    public long AvailableMb { get; set; }
    public int UsagePercent { get; set; }
}

public class ServiceHealth
{
    public bool IsEmailHealthy { get; set; }
    public bool IsNotificationHealthy { get; set; }
    public bool IsBackgroundJobsHealthy { get; set; }
    public bool IsCacheHealthy { get; set; }
}

public class PerformanceMetrics
{
    public double CpuUsagePercent { get; set; }
    public double MemoryUsagePercent { get; set; }
    public int ActiveUsers { get; set; }
    public int ConcurrentSessions { get; set; }
}

public class SecurityHealth
{
    public int FailedLoginAttempts { get; set; }
    public int SecurityIncidents { get; set; }
    public DateTime? LastSecurityScan { get; set; }
    public bool HasSecurityUpdates { get; set; }
}

public class BackupHealth
{
    public DateTime? LastBackupDate { get; set; }
    public bool IsHealthy { get; set; }
    public long LastBackupSizeMb { get; set; }
}
```

### Step 2: Implement TenantHealthCheckService

**File**: `src/Infrastructure/Stocker.Infrastructure/Services/TenantHealthCheckService.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using System.Diagnostics;
using System.Text.Json;

namespace Stocker.Infrastructure.Services;

public class TenantHealthCheckService : ITenantHealthCheckService
{
    private readonly IMasterDbContext _masterContext;
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly ISecurityAuditService _securityAuditService;
    private readonly ILogger<TenantHealthCheckService> _logger;

    public TenantHealthCheckService(
        IMasterDbContext masterContext,
        ITenantDbContextFactory tenantDbContextFactory,
        ISecurityAuditService securityAuditService,
        ILogger<TenantHealthCheckService> logger)
    {
        _masterContext = masterContext;
        _tenantDbContextFactory = tenantDbContextFactory;
        _securityAuditService = securityAuditService;
        _logger = logger;
    }

    public async Task<TenantHealthCheckResult> CheckTenantHealthAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting health check for tenant: {TenantId}", tenantId);

        var tenant = await _masterContext.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);

        if (tenant == null)
        {
            throw new InvalidOperationException($"Tenant {tenantId} not found");
        }

        var result = new TenantHealthCheckResult
        {
            TenantId = tenantId,
            TenantName = tenant.Name,
            CheckedAt = DateTime.UtcNow
        };

        var errors = new List<string>();
        var warnings = new List<string>();

        try
        {
            // Check Database Health
            result.Database = await CheckDatabaseHealthAsync(tenantId, errors, warnings, cancellationToken);

            // Check API Health
            result.Api = await CheckApiHealthAsync(tenantId, errors, warnings, cancellationToken);

            // Check Storage Health
            result.Storage = await CheckStorageHealthAsync(tenantId, errors, warnings, cancellationToken);

            // Check Service Health
            result.Services = await CheckServiceHealthAsync(tenantId, errors, warnings, cancellationToken);

            // Check Performance Metrics
            result.Performance = await CheckPerformanceMetricsAsync(tenantId, errors, warnings, cancellationToken);

            // Check Security Health
            result.Security = await CheckSecurityHealthAsync(tenantId, errors, warnings, cancellationToken);

            // Check Backup Health
            result.Backup = await CheckBackupHealthAsync(tenantId, errors, warnings, cancellationToken);

            result.Errors = errors;
            result.Warnings = warnings;

            // Save to database
            await SaveHealthCheckAsync(result, cancellationToken);

            _logger.LogInformation(
                "Health check completed for tenant {TenantId}: {Status} (Score: {Score})",
                tenantId, result.OverallStatus, result.HealthScore);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during health check for tenant {TenantId}", tenantId);
            errors.Add($"Health check failed: {ex.Message}");
            result.Errors = errors;
            result.OverallStatus = "Unhealthy";
            result.HealthScore = 0;
        }

        return result;
    }

    private async Task<DatabaseHealth> CheckDatabaseHealthAsync(
        Guid tenantId,
        List<string> errors,
        List<string> warnings,
        CancellationToken cancellationToken)
    {
        var health = new DatabaseHealth();
        var stopwatch = Stopwatch.StartNew();

        try
        {
            using var tenantDb = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);

            // Test connection with simple query
            await tenantDb.Database.ExecuteSqlRawAsync("SELECT 1", cancellationToken);
            stopwatch.Stop();

            health.ResponseTimeMs = stopwatch.ElapsedMilliseconds;
            health.IsHealthy = stopwatch.ElapsedMilliseconds < 1000; // Healthy if < 1 second

            if (stopwatch.ElapsedMilliseconds > 2000)
            {
                errors.Add($"Database response time too slow: {stopwatch.ElapsedMilliseconds}ms");
            }
            else if (stopwatch.ElapsedMilliseconds > 1000)
            {
                warnings.Add($"Database response time slow: {stopwatch.ElapsedMilliseconds}ms");
            }

            // Get database size
            var sizeQuery = @"
                SELECT
                    SUM(size * 8.0 / 1024) as SizeMB
                FROM sys.master_files
                WHERE database_id = DB_ID()";

            var size = await tenantDb.Database
                .SqlQueryRaw<decimal>(sizeQuery)
                .FirstOrDefaultAsync(cancellationToken);

            health.SizeMb = (long)size;

            if (health.SizeMb > 10240) // > 10 GB
            {
                warnings.Add($"Database size large: {health.SizeMb}MB");
            }

            // Get active connections
            var connectionQuery = @"
                SELECT COUNT(*)
                FROM sys.dm_exec_sessions
                WHERE database_id = DB_ID()";

            var connections = await tenantDb.Database
                .SqlQueryRaw<int>(connectionQuery)
                .FirstOrDefaultAsync(cancellationToken);

            health.ActiveConnections = connections;

            if (connections > 100)
            {
                warnings.Add($"High number of active connections: {connections}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed for tenant {TenantId}", tenantId);
            health.IsHealthy = false;
            errors.Add($"Database check failed: {ex.Message}");
        }

        return health;
    }

    private async Task<ApiHealth> CheckApiHealthAsync(
        Guid tenantId,
        List<string> errors,
        List<string> warnings,
        CancellationToken cancellationToken)
    {
        var health = new ApiHealth { IsHealthy = true };

        // TODO: Implement API health metrics from application metrics
        // For now, return basic healthy status
        health.ResponseTimeMs = 100;
        health.ErrorRate = 0;
        health.RequestsPerMinute = 0;

        return health;
    }

    private async Task<StorageHealth> CheckStorageHealthAsync(
        Guid tenantId,
        List<string> errors,
        List<string> warnings,
        CancellationToken cancellationToken)
    {
        var health = new StorageHealth();

        try
        {
            // Get drive info for database location
            var driveInfo = new System.IO.DriveInfo("C"); // Adjust based on your server

            health.UsedMb = (driveInfo.TotalSize - driveInfo.AvailableFreeSpace) / (1024 * 1024);
            health.AvailableMb = driveInfo.AvailableFreeSpace / (1024 * 1024);
            health.UsagePercent = (int)((health.UsedMb * 100) / (health.UsedMb + health.AvailableMb));
            health.IsHealthy = health.UsagePercent < 90;

            if (health.UsagePercent > 95)
            {
                errors.Add($"Critical: Storage usage at {health.UsagePercent}%");
            }
            else if (health.UsagePercent > 80)
            {
                warnings.Add($"Storage usage high: {health.UsagePercent}%");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Storage health check failed");
            health.IsHealthy = false;
            errors.Add($"Storage check failed: {ex.Message}");
        }

        return health;
    }

    private async Task<ServiceHealth> CheckServiceHealthAsync(
        Guid tenantId,
        List<string> errors,
        List<string> warnings,
        CancellationToken cancellationToken)
    {
        var health = new ServiceHealth
        {
            IsEmailHealthy = true,
            IsNotificationHealthy = true,
            IsBackgroundJobsHealthy = true,
            IsCacheHealthy = true
        };

        // TODO: Implement actual service health checks
        // - Test email service connectivity
        // - Check SignalR hub status
        // - Check Hangfire job status
        // - Test Redis cache connectivity

        return health;
    }

    private async Task<PerformanceMetrics> CheckPerformanceMetricsAsync(
        Guid tenantId,
        List<string> errors,
        List<string> warnings,
        CancellationToken cancellationToken)
    {
        var metrics = new PerformanceMetrics();

        try
        {
            // Get CPU and memory usage
            var process = Process.GetCurrentProcess();

            metrics.CpuUsagePercent = 0; // TODO: Calculate CPU usage
            metrics.MemoryUsagePercent = (process.WorkingSet64 / (double)Environment.WorkingSet) * 100;

            // Get active users from tenant database
            using var tenantDb = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);

            // TODO: Implement active user count query
            metrics.ActiveUsers = 0;
            metrics.ConcurrentSessions = 0;

            if (metrics.CpuUsagePercent > 90)
            {
                errors.Add($"Critical CPU usage: {metrics.CpuUsagePercent:F1}%");
            }
            else if (metrics.CpuUsagePercent > 80)
            {
                warnings.Add($"High CPU usage: {metrics.CpuUsagePercent:F1}%");
            }

            if (metrics.MemoryUsagePercent > 90)
            {
                errors.Add($"Critical memory usage: {metrics.MemoryUsagePercent:F1}%");
            }
            else if (metrics.MemoryUsagePercent > 80)
            {
                warnings.Add($"High memory usage: {metrics.MemoryUsagePercent:F1}%");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Performance metrics check failed");
            warnings.Add($"Performance check failed: {ex.Message}");
        }

        return metrics;
    }

    private async Task<SecurityHealth> CheckSecurityHealthAsync(
        Guid tenantId,
        List<string> errors,
        List<string> warnings,
        CancellationToken cancellationToken)
    {
        var health = new SecurityHealth();

        try
        {
            var tenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);

            // Get failed login attempts in last hour
            var failedLogins = await _securityAuditService.GetFailedLoginAttemptsAsync(
                tenant?.Code ?? string.Empty,
                TimeSpan.FromHours(1),
                cancellationToken);

            health.FailedLoginAttempts = failedLogins;

            // Get security incidents
            var incidents = await _securityAuditService.GetSuspiciousActivityCountAsync(
                string.Empty, // All IPs for this tenant
                TimeSpan.FromDays(1),
                cancellationToken);

            health.SecurityIncidents = incidents;
            health.LastSecurityScan = DateTime.UtcNow; // TODO: Implement actual security scan
            health.HasSecurityUpdates = false; // TODO: Check for pending security updates

            if (health.FailedLoginAttempts > 50)
            {
                errors.Add($"High failed login attempts: {health.FailedLoginAttempts}");
            }
            else if (health.FailedLoginAttempts > 20)
            {
                warnings.Add($"Elevated failed login attempts: {health.FailedLoginAttempts}");
            }

            if (health.SecurityIncidents > 0)
            {
                warnings.Add($"Security incidents detected: {health.SecurityIncidents}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Security health check failed");
            warnings.Add($"Security check failed: {ex.Message}");
        }

        return health;
    }

    private async Task<BackupHealth> CheckBackupHealthAsync(
        Guid tenantId,
        List<string> errors,
        List<string> warnings,
        CancellationToken cancellationToken)
    {
        var health = new BackupHealth();

        try
        {
            // TODO: Implement backup status check
            // - Query backup table or backup service
            // - Check last backup date
            // - Verify backup file exists and size

            health.LastBackupDate = null; // TODO: Get from backup service
            health.IsHealthy = false; // TODO: Determine based on backup recency
            health.LastBackupSizeMb = 0;

            if (health.LastBackupDate == null)
            {
                warnings.Add("No backup found");
            }
            else if ((DateTime.UtcNow - health.LastBackupDate.Value).TotalHours > 24)
            {
                errors.Add($"Backup older than 24 hours: {health.LastBackupDate}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Backup health check failed");
            health.IsHealthy = false;
            warnings.Add($"Backup check failed: {ex.Message}");
        }

        return health;
    }

    private async Task SaveHealthCheckAsync(TenantHealthCheckResult result, CancellationToken cancellationToken)
    {
        var healthCheck = TenantHealthCheck.Create(result.TenantId);

        healthCheck.UpdateDatabaseHealth(
            result.Database.IsHealthy,
            result.Database.ResponseTimeMs,
            result.Database.SizeMb,
            result.Database.ActiveConnections);

        healthCheck.UpdateApiHealth(
            result.Api.IsHealthy,
            result.Api.ResponseTimeMs,
            result.Api.ErrorRate,
            result.Api.RequestsPerMinute);

        healthCheck.UpdateStorageHealth(
            result.Storage.IsHealthy,
            result.Storage.UsedMb,
            result.Storage.AvailableMb);

        healthCheck.UpdateServiceHealth(
            result.Services.IsEmailHealthy,
            result.Services.IsNotificationHealthy,
            result.Services.IsBackgroundJobsHealthy,
            result.Services.IsCacheHealthy);

        healthCheck.UpdatePerformanceMetrics(
            result.Performance.CpuUsagePercent,
            result.Performance.MemoryUsagePercent,
            result.Performance.ActiveUsers,
            result.Performance.ConcurrentSessions);

        healthCheck.UpdateSecurityHealth(
            result.Security.FailedLoginAttempts,
            result.Security.SecurityIncidents,
            result.Security.LastSecurityScan,
            result.Security.HasSecurityUpdates);

        healthCheck.UpdateBackupHealth(
            result.Backup.LastBackupDate,
            result.Backup.IsHealthy,
            result.Backup.LastBackupSizeMb);

        healthCheck.SetErrors(
            result.Errors.Any() ? JsonSerializer.Serialize(result.Errors) : null,
            result.Errors.Count);

        healthCheck.SetWarnings(
            result.Warnings.Any() ? JsonSerializer.Serialize(result.Warnings) : null,
            result.Warnings.Count);

        healthCheck.CalculateOverallHealth();

        result.OverallStatus = healthCheck.OverallStatus;
        result.HealthScore = healthCheck.HealthScore;

        _masterContext.TenantHealthChecks.Add(healthCheck);
        await _masterContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<TenantHealthCheckResult>> CheckAllTenantsHealthAsync(CancellationToken cancellationToken = default)
    {
        var tenants = await _masterContext.Tenants
            .Where(t => t.IsActive)
            .ToListAsync(cancellationToken);

        var results = new List<TenantHealthCheckResult>();

        foreach (var tenant in tenants)
        {
            try
            {
                var result = await CheckTenantHealthAsync(tenant.Id, cancellationToken);
                results.Add(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed health check for tenant {TenantId}", tenant.Id);
            }
        }

        return results;
    }

    public async Task<TenantHealthCheckResult?> GetLatestHealthCheckAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var healthCheck = await _masterContext.TenantHealthChecks
            .Where(h => h.TenantId == tenantId)
            .OrderByDescending(h => h.CheckedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (healthCheck == null)
            return null;

        return MapToResult(healthCheck);
    }

    public async Task<IEnumerable<TenantHealthCheckResult>> GetHealthCheckHistoryAsync(
        Guid tenantId,
        DateTime fromDate,
        DateTime toDate,
        CancellationToken cancellationToken = default)
    {
        var healthChecks = await _masterContext.TenantHealthChecks
            .Where(h => h.TenantId == tenantId &&
                       h.CheckedAt >= fromDate &&
                       h.CheckedAt <= toDate)
            .OrderByDescending(h => h.CheckedAt)
            .ToListAsync(cancellationToken);

        return healthChecks.Select(MapToResult);
    }

    private TenantHealthCheckResult MapToResult(TenantHealthCheck healthCheck)
    {
        return new TenantHealthCheckResult
        {
            TenantId = healthCheck.TenantId,
            TenantName = healthCheck.Tenant?.Name ?? string.Empty,
            OverallStatus = healthCheck.OverallStatus,
            HealthScore = healthCheck.HealthScore,
            CheckedAt = healthCheck.CheckedAt,
            Database = new DatabaseHealth
            {
                IsHealthy = healthCheck.IsDatabaseHealthy,
                ResponseTimeMs = healthCheck.DatabaseResponseTimeMs,
                SizeMb = healthCheck.DatabaseSizeMb,
                ActiveConnections = healthCheck.ActiveConnections
            },
            Api = new ApiHealth
            {
                IsHealthy = healthCheck.IsApiHealthy,
                ResponseTimeMs = healthCheck.ApiResponseTimeMs,
                ErrorRate = healthCheck.ApiErrorRate,
                RequestsPerMinute = healthCheck.ApiRequestsPerMinute
            },
            Storage = new StorageHealth
            {
                IsHealthy = healthCheck.IsStorageHealthy,
                UsedMb = healthCheck.StorageUsedMb,
                AvailableMb = healthCheck.StorageAvailableMb,
                UsagePercent = healthCheck.StorageUsagePercent
            },
            Services = new ServiceHealth
            {
                IsEmailHealthy = healthCheck.IsEmailServiceHealthy,
                IsNotificationHealthy = healthCheck.IsNotificationServiceHealthy,
                IsBackgroundJobsHealthy = healthCheck.IsBackgroundJobsHealthy,
                IsCacheHealthy = healthCheck.IsCacheHealthy
            },
            Performance = new PerformanceMetrics
            {
                CpuUsagePercent = healthCheck.CpuUsagePercent,
                MemoryUsagePercent = healthCheck.MemoryUsagePercent,
                ActiveUsers = healthCheck.ActiveUsers,
                ConcurrentSessions = healthCheck.ConcurrentSessions
            },
            Security = new SecurityHealth
            {
                FailedLoginAttempts = healthCheck.FailedLoginAttempts,
                SecurityIncidents = healthCheck.SecurityIncidents,
                LastSecurityScan = healthCheck.LastSecurityScan,
                HasSecurityUpdates = healthCheck.HasSecurityUpdates
            },
            Backup = new BackupHealth
            {
                LastBackupDate = healthCheck.LastBackupDate,
                IsHealthy = healthCheck.IsBackupHealthy,
                LastBackupSizeMb = healthCheck.LastBackupSizeMb
            },
            Errors = healthCheck.Errors != null ?
                JsonSerializer.Deserialize<List<string>>(healthCheck.Errors) ?? new() : new(),
            Warnings = healthCheck.Warnings != null ?
                JsonSerializer.Deserialize<List<string>>(healthCheck.Warnings) ?? new() : new()
        };
    }
}
```

### Step 3: Create Hangfire Background Job

**File**: `src/Infrastructure/Stocker.Infrastructure/BackgroundJobs/TenantHealthCheckJob.cs`

```csharp
using Hangfire;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Infrastructure.BackgroundJobs;

public class TenantHealthCheckJob
{
    private readonly ITenantHealthCheckService _healthCheckService;
    private readonly ILogger<TenantHealthCheckJob> _logger;

    public TenantHealthCheckJob(
        ITenantHealthCheckService healthCheckService,
        ILogger<TenantHealthCheckJob> logger)
    {
        _healthCheckService = healthCheckService;
        _logger = logger;
    }

    /// <summary>
    /// Run health check for all tenants (scheduled every 15 minutes)
    /// </summary>
    [AutomaticRetry(Attempts = 3)]
    public async Task RunHealthCheckForAllTenantsAsync()
    {
        _logger.LogInformation("Starting health check for all tenants");

        try
        {
            var results = await _healthCheckService.CheckAllTenantsHealthAsync();

            var unhealthyTenants = results.Where(r => r.OverallStatus == "Unhealthy").ToList();
            var degradedTenants = results.Where(r => r.OverallStatus == "Degraded").ToList();

            _logger.LogInformation(
                "Health check completed. Total: {Total}, Healthy: {Healthy}, Degraded: {Degraded}, Unhealthy: {Unhealthy}",
                results.Count(),
                results.Count(r => r.OverallStatus == "Healthy"),
                degradedTenants.Count,
                unhealthyTenants.Count);

            // Alert for unhealthy tenants
            foreach (var tenant in unhealthyTenants)
            {
                _logger.LogError(
                    "ALERT: Tenant {TenantId} ({TenantName}) is unhealthy! Score: {Score}, Errors: {Errors}",
                    tenant.TenantId,
                    tenant.TenantName,
                    tenant.HealthScore,
                    string.Join(", ", tenant.Errors));

                // TODO: Send alert notification (email, Slack, etc.)
            }

            // Warning for degraded tenants
            foreach (var tenant in degradedTenants)
            {
                _logger.LogWarning(
                    "WARNING: Tenant {TenantId} ({TenantName}) is degraded. Score: {Score}, Warnings: {Warnings}",
                    tenant.TenantId,
                    tenant.TenantName,
                    tenant.HealthScore,
                    string.Join(", ", tenant.Warnings));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during tenant health check job");
            throw; // Re-throw to trigger Hangfire retry
        }
    }

    /// <summary>
    /// Run health check for specific tenant
    /// </summary>
    [AutomaticRetry(Attempts = 2)]
    public async Task RunHealthCheckForTenantAsync(Guid tenantId)
    {
        _logger.LogInformation("Running health check for tenant: {TenantId}", tenantId);

        try
        {
            var result = await _healthCheckService.CheckTenantHealthAsync(tenantId);

            if (result.OverallStatus == "Unhealthy")
            {
                _logger.LogError(
                    "Tenant {TenantId} health check failed! Score: {Score}",
                    tenantId,
                    result.HealthScore);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during health check for tenant {TenantId}", tenantId);
            throw;
        }
    }
}
```

### Step 4: Register Services and Schedule Jobs

**File**: `src/Infrastructure/Stocker.Infrastructure/Extensions/ServiceCollectionExtensions.cs`

Add to `AddInfrastructureServices`:

```csharp
// Register TenantHealthCheck service
services.AddScoped<ITenantHealthCheckService, TenantHealthCheckService>();
services.AddScoped<TenantHealthCheckJob>();
```

**File**: `src/API/Stocker.API/Program.cs` or Hangfire configuration:

```csharp
// Schedule health check job to run every 15 minutes
RecurringJob.AddOrUpdate<TenantHealthCheckJob>(
    "tenant-health-check-all",
    job => job.RunHealthCheckForAllTenantsAsync(),
    "*/15 * * * *"); // Every 15 minutes
```

### Step 5: Create API Endpoints

**File**: `src/API/Stocker.API/Controllers/Master/TenantHealthController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Interfaces;

namespace Stocker.API.Controllers.Master;

[ApiController]
[Route("api/master/tenant-health")]
[Authorize(Roles = "SystemAdmin,SuperAdmin")]
public class TenantHealthController : ControllerBase
{
    private readonly ITenantHealthCheckService _healthCheckService;
    private readonly ILogger<TenantHealthController> _logger;

    public TenantHealthController(
        ITenantHealthCheckService healthCheckService,
        ILogger<TenantHealthController> logger)
    {
        _healthCheckService = healthCheckService;
        _logger = logger;
    }

    /// <summary>
    /// Get latest health check for specific tenant
    /// </summary>
    [HttpGet("{tenantId}")]
    public async Task<IActionResult> GetTenantHealth(Guid tenantId)
    {
        var result = await _healthCheckService.GetLatestHealthCheckAsync(tenantId);

        if (result == null)
        {
            return NotFound(new { message = "No health check found for tenant" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Trigger health check for specific tenant
    /// </summary>
    [HttpPost("{tenantId}/check")]
    public async Task<IActionResult> CheckTenantHealth(Guid tenantId)
    {
        var result = await _healthCheckService.CheckTenantHealthAsync(tenantId);
        return Ok(result);
    }

    /// <summary>
    /// Get health check history for tenant
    /// </summary>
    [HttpGet("{tenantId}/history")]
    public async Task<IActionResult> GetHealthCheckHistory(
        Guid tenantId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var from = fromDate ?? DateTime.UtcNow.AddDays(-7);
        var to = toDate ?? DateTime.UtcNow;

        var history = await _healthCheckService.GetHealthCheckHistoryAsync(tenantId, from, to);
        return Ok(history);
    }

    /// <summary>
    /// Trigger health check for all active tenants
    /// </summary>
    [HttpPost("check-all")]
    public async Task<IActionResult> CheckAllTenantsHealth()
    {
        _logger.LogInformation("Manual health check triggered for all tenants");
        var results = await _healthCheckService.CheckAllTenantsHealthAsync();
        return Ok(results);
    }
}
```

## 📊 Usage Examples

### Manual Health Check
```bash
# Check specific tenant
POST /api/master/tenant-health/{tenantId}/check

# Check all tenants
POST /api/master/tenant-health/check-all
```

### View Health Status
```bash
# Get latest health check
GET /api/master/tenant-health/{tenantId}

# Get history (last 7 days)
GET /api/master/tenant-health/{tenantId}/history?fromDate=2025-10-21&toDate=2025-10-28
```

### SQL Queries

```sql
-- Get all unhealthy tenants
SELECT
    t.Name AS TenantName,
    h.OverallStatus,
    h.HealthScore,
    h.CheckedAt,
    h.Errors,
    h.Warnings
FROM TenantHealthChecks h
INNER JOIN Tenants t ON h.TenantId = t.Id
WHERE h.OverallStatus = 'Unhealthy'
AND h.CheckedAt >= DATEADD(HOUR, -1, GETUTCDATE())
ORDER BY h.HealthScore ASC;

-- Get health trend for tenant
SELECT
    CheckedAt,
    HealthScore,
    OverallStatus,
    DatabaseResponseTimeMs,
    ApiResponseTimeMs,
    StorageUsagePercent
FROM TenantHealthChecks
WHERE TenantId = @tenantId
AND CheckedAt >= DATEADD(DAY, -7, GETUTCDATE())
ORDER BY CheckedAt DESC;

-- Get degraded tenants with high database response time
SELECT
    t.Name,
    h.DatabaseResponseTimeMs,
    h.DatabaseSizeMb,
    h.ActiveConnections,
    h.HealthScore
FROM TenantHealthChecks h
INNER JOIN Tenants t ON h.TenantId = t.Id
WHERE h.DatabaseResponseTimeMs > 1000
AND h.CheckedAt >= DATEADD(MINUTE, -30, GETUTCDATE())
ORDER BY h.DatabaseResponseTimeMs DESC;
```

## 🔔 Alerting Integration

### Email Alerts
```csharp
if (result.OverallStatus == "Unhealthy")
{
    await _emailService.SendAlertEmailAsync(
        to: "admin@company.com",
        subject: $"ALERT: Tenant {result.TenantName} Unhealthy",
        body: $@"
            Tenant: {result.TenantName}
            Status: {result.OverallStatus}
            Health Score: {result.HealthScore}/100

            Errors:
            {string.Join("\n", result.Errors)}
        ");
}
```

### Slack Integration
```csharp
if (result.HealthScore < 70)
{
    await _slackService.SendMessageAsync(
        channel: "#infrastructure-alerts",
        message: $"⚠️ Tenant *{result.TenantName}* health degraded: {result.HealthScore}/100"
    );
}
```

## 📈 Dashboard Metrics

**Recommended Metrics to Display**:
- Overall tenant health distribution (Healthy/Degraded/Unhealthy)
- Average health score across all tenants
- Tenants with critical issues (score < 50)
- Database response time trend
- Storage usage trend
- Failed login attempts by tenant
- Backup status (last backup date)

## 🎯 Benefits

1. **Proactive Monitoring** - Detect issues before users complain
2. **Performance Tracking** - Identify slow databases, high resource usage
3. **Security Monitoring** - Track failed logins, security incidents
4. **Capacity Planning** - Monitor storage, connections, users
5. **SLA Compliance** - Prove uptime and performance metrics
6. **Automated Alerting** - Get notified of critical issues
7. **Historical Analysis** - Trend analysis and capacity forecasting

## 🚀 Implementation Priority

1. **Phase 1** (High Priority):
   - ✅ Database health check
   - ✅ Storage health check
   - ✅ Security health check (using existing SecurityAuditLog)

2. **Phase 2** (Medium Priority):
   - ⏳ Service health checks (email, cache, jobs)
   - ⏳ Performance metrics (CPU, memory, users)
   - ⏳ API health metrics

3. **Phase 3** (Low Priority):
   - ⏳ Backup health check
   - ⏳ Alerting integration
   - ⏳ Dashboard visualization
