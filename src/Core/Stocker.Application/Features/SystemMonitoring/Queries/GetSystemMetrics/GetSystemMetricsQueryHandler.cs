using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetSystemMetrics;

internal sealed class GetSystemMetricsQueryHandler : IRequestHandler<GetSystemMetricsQuery, Result<SystemMetricsDto>>
{
    private readonly ISystemMonitoringService _systemMonitoringService;

    public GetSystemMetricsQueryHandler(ISystemMonitoringService systemMonitoringService)
    {
        _systemMonitoringService = systemMonitoringService;
    }

    public async Task<Result<SystemMetricsDto>> Handle(GetSystemMetricsQuery request, CancellationToken cancellationToken)
    {
        var metrics = await _systemMonitoringService.GetSystemMetricsAsync(cancellationToken);
        return Result.Success(metrics);
    }
}
