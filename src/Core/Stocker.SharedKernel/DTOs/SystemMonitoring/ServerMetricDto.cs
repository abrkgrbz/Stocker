namespace Stocker.SharedKernel.DTOs.SystemMonitoring;

public record ServerMetricDto
{
    public string ServerName { get; init; } = string.Empty;
    public string ServerType { get; init; } = string.Empty;
    public double CpuUsagePercentage { get; init; }
    public double MemoryUsagePercentage { get; init; }
    public double DiskUsagePercentage { get; init; }
    public NetworkTraffic Network { get; init; } = null!;
    public ServerStatus Status { get; init; }
    public DateTime Timestamp { get; init; }
}

public record NetworkTraffic
{
    public double InboundMbps { get; init; }
    public double OutboundMbps { get; init; }
}

public enum ServerStatus
{
    Healthy,
    Warning,
    Critical,
    Offline
}
