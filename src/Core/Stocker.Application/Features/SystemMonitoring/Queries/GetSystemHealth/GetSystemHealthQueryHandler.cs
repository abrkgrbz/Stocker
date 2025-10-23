using Stocker.Application.Abstractions.Messaging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetSystemHealth;

internal sealed class GetSystemHealthQueryHandler
    : IQueryHandler<GetSystemHealthQuery, SystemHealthDto>
{
    private readonly ISystemMonitoringService _monitoringService;

    public GetSystemHealthQueryHandler(ISystemMonitoringService monitoringService)
    {
        _monitoringService = monitoringService;
    }

    public async Task<Result<SystemHealthDto>> Handle(
        GetSystemHealthQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var health = await _monitoringService.GetSystemHealthAsync(cancellationToken);
            return Result.Success(health);
        }
        catch (Exception ex)
        {
            return Result.Failure<SystemHealthDto>(
                DomainErrors.General.ServerError(ex.Message));
        }
    }
}
