namespace Stocker.SharedKernel.DTOs.SystemMonitoring;

public record CpuMetricsDto(
    double Usage,
    int Cores,
    double Frequency
);

public record MemoryMetricsDto(
    long Used,
    long Total,
    long Available,
    double UsagePercentage
);

public record DiskMetricsDto(
    long Used,
    long Total,
    long Free,
    double UsagePercentage
);

public record NetworkMetricsDto(
    long BytesSent,
    long BytesReceived,
    double Speed
);

public record SystemMetricsDto(
    CpuMetricsDto Cpu,
    MemoryMetricsDto Memory,
    DiskMetricsDto Disk,
    NetworkMetricsDto Network,
    DateTime Timestamp
);
