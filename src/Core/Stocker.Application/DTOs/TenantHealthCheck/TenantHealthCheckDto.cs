namespace Stocker.Application.DTOs.TenantHealthCheck;

public class TenantHealthCheckDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public DateTime CheckedAt { get; set; }

    // Overall Status
    public string OverallStatus { get; set; } = string.Empty;
    public int HealthScore { get; set; }

    // Database Health
    public bool IsDatabaseHealthy { get; set; }
    public long DatabaseResponseTimeMs { get; set; }
    public long DatabaseSizeMb { get; set; }
    public int ActiveConnections { get; set; }

    // API Health
    public bool IsApiHealthy { get; set; }
    public long ApiResponseTimeMs { get; set; }
    public int ApiErrorRate { get; set; }
    public int ApiRequestsPerMinute { get; set; }

    // Storage Health
    public bool IsStorageHealthy { get; set; }
    public long StorageUsedMb { get; set; }
    public long StorageAvailableMb { get; set; }
    public int StorageUsagePercent { get; set; }

    // Service Health
    public bool IsEmailServiceHealthy { get; set; }
    public bool IsNotificationServiceHealthy { get; set; }
    public bool IsBackgroundJobsHealthy { get; set; }
    public bool IsCacheHealthy { get; set; }

    // Performance Metrics
    public double CpuUsagePercent { get; set; }
    public double MemoryUsagePercent { get; set; }
    public int ActiveUsers { get; set; }
    public int ConcurrentSessions { get; set; }

    // Security Health
    public int FailedLoginAttempts { get; set; }
    public int SecurityIncidents { get; set; }
    public DateTime? LastSecurityScan { get; set; }
    public bool HasSecurityUpdates { get; set; }

    // Backup Health
    public DateTime? LastBackupDate { get; set; }
    public bool IsBackupHealthy { get; set; }
    public long LastBackupSizeMb { get; set; }

    // Errors and Warnings
    public string? Errors { get; set; }
    public string? Warnings { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
}

public class TenantHealthCheckSummaryDto
{
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string TenantCode { get; set; } = string.Empty;
    public string CurrentStatus { get; set; } = string.Empty;
    public int CurrentScore { get; set; }
    public DateTime LastCheckDate { get; set; }
    public int ChecksLast24Hours { get; set; }
    public int ChecksLast7Days { get; set; }
    public decimal AverageScore7Days { get; set; }
    public List<HealthIssueDto> CriticalIssues { get; set; } = new();
}

public class HealthIssueDto
{
    public string Category { get; set; } = string.Empty;
    public string Issue { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string? Recommendation { get; set; }
}

public class TenantHealthTrendDto
{
    public Guid TenantId { get; set; }
    public DateTime Date { get; set; }
    public int HealthScore { get; set; }
    public bool IsDatabaseHealthy { get; set; }
    public bool IsApiHealthy { get; set; }
    public bool IsStorageHealthy { get; set; }
}
