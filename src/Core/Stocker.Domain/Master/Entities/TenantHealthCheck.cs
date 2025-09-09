using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantHealthCheck : Entity
{
    public Guid TenantId { get; private set; }
    public DateTime CheckedAt { get; private set; }
    
    // Overall Status
    public string OverallStatus { get; private set; } // Healthy, Degraded, Unhealthy
    public int HealthScore { get; private set; } // 0-100
    
    // Database Health
    public bool IsDatabaseHealthy { get; private set; }
    public long DatabaseResponseTimeMs { get; private set; }
    public long DatabaseSizeMb { get; private set; }
    public int ActiveConnections { get; private set; }
    
    // API Health
    public bool IsApiHealthy { get; private set; }
    public long ApiResponseTimeMs { get; private set; }
    public int ApiErrorRate { get; private set; } // Percentage
    public int ApiRequestsPerMinute { get; private set; }
    
    // Storage Health
    public bool IsStorageHealthy { get; private set; }
    public long StorageUsedMb { get; private set; }
    public long StorageAvailableMb { get; private set; }
    public int StorageUsagePercent { get; private set; }
    
    // Service Health
    public bool IsEmailServiceHealthy { get; private set; }
    public bool IsNotificationServiceHealthy { get; private set; }
    public bool IsBackgroundJobsHealthy { get; private set; }
    public bool IsCacheHealthy { get; private set; }
    
    // Performance Metrics
    public double CpuUsagePercent { get; private set; }
    public double MemoryUsagePercent { get; private set; }
    public int ActiveUsers { get; private set; }
    public int ConcurrentSessions { get; private set; }
    
    // Security Health
    public int FailedLoginAttempts { get; private set; }
    public int SecurityIncidents { get; private set; }
    public DateTime? LastSecurityScan { get; private set; }
    public bool HasSecurityUpdates { get; private set; }
    
    // Backup Health
    public DateTime? LastBackupDate { get; private set; }
    public bool IsBackupHealthy { get; private set; }
    public long LastBackupSizeMb { get; private set; }
    
    // Errors and Warnings
    public string? Errors { get; private set; } // JSON array of error messages
    public string? Warnings { get; private set; } // JSON array of warning messages
    public int ErrorCount { get; private set; }
    public int WarningCount { get; private set; }
    
    // Navigation property
    public Tenant Tenant { get; private set; } = null!;
    
    private TenantHealthCheck() { } // EF Constructor
    
    private TenantHealthCheck(Guid tenantId)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        CheckedAt = DateTime.UtcNow;
        OverallStatus = "Unknown";
        HealthScore = 0;
    }
    
    public static TenantHealthCheck Create(Guid tenantId)
    {
        return new TenantHealthCheck(tenantId);
    }
    
    public void UpdateDatabaseHealth(
        bool isHealthy,
        long responseTimeMs,
        long sizeMb,
        int activeConnections)
    {
        IsDatabaseHealthy = isHealthy;
        DatabaseResponseTimeMs = responseTimeMs;
        DatabaseSizeMb = sizeMb;
        ActiveConnections = activeConnections;
    }
    
    public void UpdateApiHealth(
        bool isHealthy,
        long responseTimeMs,
        int errorRate,
        int requestsPerMinute)
    {
        IsApiHealthy = isHealthy;
        ApiResponseTimeMs = responseTimeMs;
        ApiErrorRate = errorRate;
        ApiRequestsPerMinute = requestsPerMinute;
    }
    
    public void UpdateStorageHealth(
        bool isHealthy,
        long usedMb,
        long availableMb)
    {
        IsStorageHealthy = isHealthy;
        StorageUsedMb = usedMb;
        StorageAvailableMb = availableMb;
        
        var total = usedMb + availableMb;
        StorageUsagePercent = total > 0 ? (int)((usedMb * 100) / total) : 0;
    }
    
    public void UpdateServiceHealth(
        bool emailHealthy,
        bool notificationHealthy,
        bool backgroundJobsHealthy,
        bool cacheHealthy)
    {
        IsEmailServiceHealthy = emailHealthy;
        IsNotificationServiceHealthy = notificationHealthy;
        IsBackgroundJobsHealthy = backgroundJobsHealthy;
        IsCacheHealthy = cacheHealthy;
    }
    
    public void UpdatePerformanceMetrics(
        double cpuUsage,
        double memoryUsage,
        int activeUsers,
        int concurrentSessions)
    {
        CpuUsagePercent = cpuUsage;
        MemoryUsagePercent = memoryUsage;
        ActiveUsers = activeUsers;
        ConcurrentSessions = concurrentSessions;
    }
    
    public void UpdateSecurityHealth(
        int failedLogins,
        int securityIncidents,
        DateTime? lastScan,
        bool hasUpdates)
    {
        FailedLoginAttempts = failedLogins;
        SecurityIncidents = securityIncidents;
        LastSecurityScan = lastScan;
        HasSecurityUpdates = hasUpdates;
    }
    
    public void UpdateBackupHealth(
        DateTime? lastBackupDate,
        bool isHealthy,
        long sizeMb)
    {
        LastBackupDate = lastBackupDate;
        IsBackupHealthy = isHealthy;
        LastBackupSizeMb = sizeMb;
    }
    
    public void SetErrors(string? errors, int count)
    {
        Errors = errors;
        ErrorCount = count;
    }
    
    public void SetWarnings(string? warnings, int count)
    {
        Warnings = warnings;
        WarningCount = count;
    }
    
    public void CalculateOverallHealth()
    {
        var score = 100;
        var issues = new List<string>();
        
        // Critical checks (each -20 points)
        if (!IsDatabaseHealthy) { score -= 20; issues.Add("Database"); }
        if (!IsApiHealthy) { score -= 20; issues.Add("API"); }
        if (!IsStorageHealthy) { score -= 20; issues.Add("Storage"); }
        
        // Important checks (each -10 points)
        if (!IsEmailServiceHealthy) { score -= 10; issues.Add("Email"); }
        if (!IsBackgroundJobsHealthy) { score -= 10; issues.Add("Jobs"); }
        if (!IsBackupHealthy) { score -= 10; issues.Add("Backup"); }
        
        // Performance checks (each -5 points)
        if (CpuUsagePercent > 80) { score -= 5; issues.Add("CPU"); }
        if (MemoryUsagePercent > 80) { score -= 5; issues.Add("Memory"); }
        if (ApiErrorRate > 5) { score -= 5; issues.Add("API Errors"); }
        
        // Security checks (each -5 points)
        if (SecurityIncidents > 0) { score -= 5; issues.Add("Security"); }
        if (HasSecurityUpdates) { score -= 5; issues.Add("Updates"); }
        
        // Add penalty for errors and warnings
        score -= ErrorCount * 2;
        score -= WarningCount;
        
        HealthScore = Math.Max(0, score);
        
        if (HealthScore >= 90)
            OverallStatus = "Healthy";
        else if (HealthScore >= 60)
            OverallStatus = "Degraded";
        else
            OverallStatus = "Unhealthy";
    }
}