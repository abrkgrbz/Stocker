using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetServiceStatus;

internal sealed class GetServiceStatusQueryHandler : IRequestHandler<GetServiceStatusQuery, Result<List<ServiceStatusDto>>>
{
    private readonly ISystemMonitoringService _systemMonitoringService;

    public GetServiceStatusQueryHandler(ISystemMonitoringService systemMonitoringService)
    {
        _systemMonitoringService = systemMonitoringService;
    }

    public async Task<Result<List<ServiceStatusDto>>> Handle(GetServiceStatusQuery request, CancellationToken cancellationToken)
    {
        var services = await _systemMonitoringService.GetServiceStatusAsync(cancellationToken);
        return Result.Success(services);
    }
}
