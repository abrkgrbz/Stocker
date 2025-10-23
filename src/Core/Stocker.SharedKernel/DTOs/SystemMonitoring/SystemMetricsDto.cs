namespace Stocker.SharedKernel.DTOs.SystemMonitoring;

public record SystemMetricsDto
{
    public CpuMetrics Cpu { get; init; } = null!;
    public MemoryMetrics Memory { get; init; } = null!;
    public DiskMetrics Disk { get; init; } = null!;
    public NetworkMetrics Network { get; init; } = null!;
    public DateTime Timestamp { get; init; }
}

public record CpuMetrics
{
    public double UsagePercentage { get; init; }
    public int CoreCount { get; init; }
    public double[] PerCoreUsage { get; init; } = Array.Empty<double>();
    public string ProcessorName { get; init; } = string.Empty;
}

public record MemoryMetrics
{
    public long TotalBytes { get; init; }
    public long UsedBytes { get; init; }
    public long AvailableBytes { get; init; }
    public double UsagePercentage { get; init; }
    public long CachedBytes { get; init; }
}

public record DiskMetrics
{
    public DiskInfo[] Drives { get; init; } = Array.Empty<DiskInfo>();
    public double TotalUsagePercentage { get; init; }
}

public record DiskInfo
{
    public string Name { get; init; } = string.Empty;
    public string VolumeLabel { get; init; } = string.Empty;
    public long TotalBytes { get; init; }
    public long UsedBytes { get; init; }
    public long AvailableBytes { get; init; }
    public double UsagePercentage { get; init; }
    public string FileSystem { get; init; } = string.Empty;
}

public record NetworkMetrics
{
    public long BytesReceived { get; init; }
    public long BytesSent { get; init; }
    public double ReceiveMbps { get; init; }
    public double SendMbps { get; init; }
    public NetworkInterface[] Interfaces { get; init; } = Array.Empty<NetworkInterface>();
}

public record NetworkInterface
{
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public long BytesReceived { get; init; }
    public long BytesSent { get; init; }
    public string Status { get; init; } = string.Empty;
    public string MacAddress { get; init; } = string.Empty;
}
