using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetSystemHealth;

internal sealed class GetSystemHealthQueryHandler : IRequestHandler<GetSystemHealthQuery, Result<SystemHealthDto>>
{
    private readonly ISystemMonitoringService _systemMonitoringService;

    public GetSystemHealthQueryHandler(ISystemMonitoringService systemMonitoringService)
    {
        _systemMonitoringService = systemMonitoringService;
    }

    public async Task<Result<SystemHealthDto>> Handle(GetSystemHealthQuery request, CancellationToken cancellationToken)
    {
        var health = await _systemMonitoringService.GetSystemHealthAsync(cancellationToken);
        return Result.Success(health);
    }
}
