namespace Stocker.SharedKernel.DTOs.SystemMonitoring;

public record ServiceStatusDto(
    string Id,
    string Name,
    string Status,
    long Uptime,
    DateTime LastCheck,
    double ResponseTime,
    double ErrorRate
);
