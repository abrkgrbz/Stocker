using Stocker.Application.Abstractions.Messaging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetServiceStatus;

internal sealed class GetServiceStatusQueryHandler
    : IQueryHandler<GetServiceStatusQuery, List<ServiceStatusDto>>
{
    private readonly ISystemMonitoringService _monitoringService;

    public GetServiceStatusQueryHandler(ISystemMonitoringService monitoringService)
    {
        _monitoringService = monitoringService;
    }

    public async Task<Result<List<ServiceStatusDto>>> Handle(
        GetServiceStatusQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var services = await _monitoringService.GetServiceStatusAsync(cancellationToken);
            return Result.Success(services);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<ServiceStatusDto>>(
                DomainErrors.General.ServerError(ex.Message));
        }
    }
}
