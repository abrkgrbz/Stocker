using Stocker.Application.Abstractions.Messaging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetSystemMetrics;

internal sealed class GetSystemMetricsQueryHandler
    : IQueryHandler<GetSystemMetricsQuery, SystemMetricsDto>
{
    private readonly ISystemMonitoringService _monitoringService;

    public GetSystemMetricsQueryHandler(ISystemMonitoringService monitoringService)
    {
        _monitoringService = monitoringService;
    }

    public async Task<Result<SystemMetricsDto>> Handle(
        GetSystemMetricsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var metrics = await _monitoringService.GetSystemMetricsAsync(cancellationToken);
            return Result.Success(metrics);
        }
        catch (Exception ex)
        {
            return Result.Failure<SystemMetricsDto>(
                DomainErrors.General.ServerError(ex.Message));
        }
    }
}
