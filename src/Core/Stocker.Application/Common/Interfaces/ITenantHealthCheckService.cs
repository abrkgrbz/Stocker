using Stocker.Application.DTOs.TenantHealthCheck;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Interfaces;

public interface ITenantHealthCheckService
{
    /// <summary>
    /// Performs a comprehensive health check for a specific tenant
    /// </summary>
    Task<Result<TenantHealthCheckDto>> PerformHealthCheckAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the latest health check result for a tenant
    /// </summary>
    Task<Result<TenantHealthCheckDto>> GetLatestHealthCheckAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets health check summary for a tenant including trends
    /// </summary>
    Task<Result<TenantHealthCheckSummaryDto>> GetHealthSummaryAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets health check history for a tenant within a date range
    /// </summary>
    Task<Result<List<TenantHealthCheckDto>>> GetHealthHistoryAsync(
        Guid tenantId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets health trend data for charting/visualization
    /// </summary>
    Task<Result<List<TenantHealthTrendDto>>> GetHealthTrendAsync(
        Guid tenantId,
        int days = 30,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all tenants with critical health issues
    /// </summary>
    Task<Result<List<TenantHealthCheckSummaryDto>>> GetUnhealthyTenantsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Performs health checks for all active tenants (used by background job)
    /// </summary>
    Task<Result<int>> PerformAllTenantsHealthCheckAsync(CancellationToken cancellationToken = default);
}
