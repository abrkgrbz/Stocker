using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetSystemAlerts;

internal sealed class GetSystemAlertsQueryHandler : IRequestHandler<GetSystemAlertsQuery, Result<List<SystemAlertDto>>>
{
    private readonly ISystemMonitoringService _systemMonitoringService;

    public GetSystemAlertsQueryHandler(ISystemMonitoringService systemMonitoringService)
    {
        _systemMonitoringService = systemMonitoringService;
    }

    public async Task<Result<List<SystemAlertDto>>> Handle(GetSystemAlertsQuery request, CancellationToken cancellationToken)
    {
        var alerts = await _systemMonitoringService.GetSystemAlertsAsync(request.ActiveOnly, cancellationToken);
        return Result.Success(alerts);
    }
}
