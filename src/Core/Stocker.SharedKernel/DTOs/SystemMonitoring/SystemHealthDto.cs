namespace Stocker.SharedKernel.DTOs.SystemMonitoring;

public record ServiceHealthDto(
    string Name,
    string Status,
    double ResponseTime,
    DateTime LastCheck
);

public record SystemHealthDto(
    string OverallStatus,
    List<ServiceHealthDto> Services,
    long Uptime,
    DateTime Timestamp
);
