namespace Stocker.Application.DTOs.Master;

public class SystemHealthDto
{
    public string Status { get; set; } = "Unknown";
    public TimeSpan Uptime { get; set; }
    public double CpuUsage { get; set; }
    public double MemoryUsage { get; set; }
    public double DiskUsage { get; set; }
    public int ActiveConnections { get; set; }
    public string Environment { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public DateTime LastChecked { get; set; }
}

public class SystemMetricsDto
{
    public DateTime Timestamp { get; set; }
    public CpuMetrics CpuMetrics { get; set; } = new();
    public MemoryMetrics MemoryMetrics { get; set; } = new();
    public DiskMetrics DiskMetrics { get; set; } = new();
    public NetworkMetrics NetworkMetrics { get; set; } = new();
    public DatabaseMetrics DatabaseMetrics { get; set; } = new();
    public ApplicationMetrics ApplicationMetrics { get; set; } = new();
}

public class CpuMetrics
{
    public double Usage { get; set; }
    public int Cores { get; set; }
    public int Processes { get; set; }
}

public class MemoryMetrics
{
    public long Total { get; set; }
    public long Used { get; set; }
    public long Free { get; set; }
    public double UsagePercentage { get; set; }
}

public class DiskMetrics
{
    public long Total { get; set; }
    public long Used { get; set; }
    public long Free { get; set; }
    public double UsagePercentage { get; set; }
}

public class NetworkMetrics
{
    public long BytesReceived { get; set; }
    public long BytesSent { get; set; }
    public int ActiveConnections { get; set; }
    public double RequestsPerSecond { get; set; }
}

public class DatabaseMetrics
{
    public int ActiveConnections { get; set; }
    public double QueryExecutionTime { get; set; }
    public long DatabaseSize { get; set; }
    public double TransactionsPerSecond { get; set; }
}

public class ApplicationMetrics
{
    public long RequestCount { get; set; }
    public double ErrorRate { get; set; }
    public double AverageResponseTime { get; set; }
    public int ActiveSessions { get; set; }
}

public class ServiceStatusDto
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsHealthy { get; set; }
    public DateTime LastChecked { get; set; }
    public double ResponseTime { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class SystemLogDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
}

public class SystemAlertDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public bool IsActive { get; set; }
    public string Severity { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
}