using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.SystemMonitoring;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemMonitoring.Queries.GetSystemLogs;

internal sealed class GetSystemLogsQueryHandler : IRequestHandler<GetSystemLogsQuery, Result<SystemLogsResponseDto>>
{
    private readonly ISystemMonitoringService _systemMonitoringService;

    public GetSystemLogsQueryHandler(ISystemMonitoringService systemMonitoringService)
    {
        _systemMonitoringService = systemMonitoringService;
    }

    public async Task<Result<SystemLogsResponseDto>> Handle(GetSystemLogsQuery request, CancellationToken cancellationToken)
    {
        var logs = await _systemMonitoringService.GetSystemLogsAsync(
            request.Level,
            request.Source,
            request.StartDate,
            request.EndDate,
            request.Page,
            request.PageSize,
            cancellationToken);

        return Result.Success(logs);
    }
}
