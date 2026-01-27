using MediatR;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetSystemAlerts;

public record GetSystemAlertsQuery : IRequest<Result<List<SystemAlertDto>>>
{
    public bool ActiveOnly { get; init; } = true;
}
