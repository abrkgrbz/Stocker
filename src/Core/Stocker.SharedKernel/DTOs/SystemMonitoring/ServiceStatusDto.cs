namespace Stocker.SharedKernel.DTOs.SystemMonitoring;

public record ServiceStatusDto
{
    public string ServiceName { get; init; } = string.Empty;
    public ServiceHealth Status { get; init; }
    public double UptimePercentage { get; init; }
    public int ResponseTimeMs { get; init; }
    public double ErrorRate { get; init; }
    public DateTime LastCheckTime { get; init; }
    public int IncidentCount { get; init; }
    public Dictionary<string, string> AdditionalInfo { get; init; } = new();
}

public enum ServiceHealth
{
    Online,
    Degraded,
    Offline,
    Maintenance
}
