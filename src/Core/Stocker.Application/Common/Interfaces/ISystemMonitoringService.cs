using Stocker.SharedKernel.DTOs.SystemMonitoring;

namespace Stocker.Application.Common.Interfaces;

public interface ISystemMonitoringService
{
    Task<SystemMetricsDto> GetSystemMetricsAsync(CancellationToken cancellationToken = default);
    Task<SystemHealthDto> GetSystemHealthAsync(CancellationToken cancellationToken = default);
    Task<List<ServiceStatusDto>> GetServiceStatusAsync(CancellationToken cancellationToken = default);
    Task<SystemLogsResponseDto> GetSystemLogsAsync(
        string? level = null,
        string? source = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default);
    Task<List<SystemAlertDto>> GetSystemAlertsAsync(bool activeOnly = true, CancellationToken cancellationToken = default);
    Task<SystemAlertDto?> AcknowledgeAlertAsync(string alertId, string acknowledgedBy, CancellationToken cancellationToken = default);
    Task<bool> DismissAlertAsync(string alertId, string dismissedBy, CancellationToken cancellationToken = default);
}
