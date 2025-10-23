namespace Stocker.SharedKernel.DTOs.SystemMonitoring;

public record SystemHealthDto
{
    public HealthStatus OverallStatus { get; init; }
    public string Message { get; init; } = string.Empty;
    public DateTime CheckTime { get; init; }
    public TimeSpan Uptime { get; init; }
    public string Version { get; init; } = string.Empty;
    public string Environment { get; init; } = string.Empty;
    public HealthCheck[] Checks { get; init; } = Array.Empty<HealthCheck>();
}

public record HealthCheck
{
    public string Name { get; init; } = string.Empty;
    public HealthStatus Status { get; init; }
    public string Description { get; init; } = string.Empty;
    public int ResponseTimeMs { get; init; }
    public Dictionary<string, object> Data { get; init; } = new();
}

public enum HealthStatus
{
    Healthy,
    Degraded,
    Unhealthy
}
