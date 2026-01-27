using MediatR;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Commands.AcknowledgeAlert;

public record AcknowledgeAlertCommand : IRequest<Result<SystemAlertDto>>
{
    public string AlertId { get; init; } = string.Empty;
    public string AcknowledgedBy { get; init; } = string.Empty;
}
