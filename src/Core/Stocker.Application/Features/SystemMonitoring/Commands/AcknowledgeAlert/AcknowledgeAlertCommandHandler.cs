using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Commands.AcknowledgeAlert;

internal sealed class AcknowledgeAlertCommandHandler : IRequestHandler<AcknowledgeAlertCommand, Result<SystemAlertDto>>
{
    private readonly ISystemMonitoringService _systemMonitoringService;

    public AcknowledgeAlertCommandHandler(ISystemMonitoringService systemMonitoringService)
    {
        _systemMonitoringService = systemMonitoringService;
    }

    public async Task<Result<SystemAlertDto>> Handle(AcknowledgeAlertCommand request, CancellationToken cancellationToken)
    {
        var alert = await _systemMonitoringService.AcknowledgeAlertAsync(
            request.AlertId,
            request.AcknowledgedBy,
            cancellationToken);

        if (alert == null)
        {
            return Result.Failure<SystemAlertDto>(Error.NotFound("Alert.NotFound", "Alert not found"));
        }

        return Result.Success(alert);
    }
}
