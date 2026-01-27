using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Commands.DismissAlert;

public record DismissAlertCommand : IRequest<Result<bool>>
{
    public string AlertId { get; init; } = string.Empty;
    public string DismissedBy { get; init; } = string.Empty;
}
