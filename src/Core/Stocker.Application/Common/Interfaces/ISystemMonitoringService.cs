using Stocker.SharedKernel.DTOs.SystemMonitoring;

namespace Stocker.Application.Common.Interfaces;

public interface ISystemMonitoringService
{
    Task<SystemMetricsDto> GetSystemMetricsAsync(CancellationToken cancellationToken = default);
    Task<List<ServiceStatusDto>> GetServiceStatusAsync(CancellationToken cancellationToken = default);
    Task<SystemHealthDto> GetSystemHealthAsync(CancellationToken cancellationToken = default);
    Task<List<ServerMetricDto>> GetServerMetricsAsync(CancellationToken cancellationToken = default);
}
