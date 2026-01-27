using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Commands.DismissAlert;

internal sealed class DismissAlertCommandHandler : IRequestHandler<DismissAlertCommand, Result<bool>>
{
    private readonly ISystemMonitoringService _systemMonitoringService;

    public DismissAlertCommandHandler(ISystemMonitoringService systemMonitoringService)
    {
        _systemMonitoringService = systemMonitoringService;
    }

    public async Task<Result<bool>> Handle(DismissAlertCommand request, CancellationToken cancellationToken)
    {
        var success = await _systemMonitoringService.DismissAlertAsync(
            request.AlertId,
            request.DismissedBy,
            cancellationToken);

        if (!success)
        {
            return Result.Failure<bool>(Error.NotFound("Alert.NotFound", "Alert not found"));
        }

        return Result.Success(true);
    }
}
