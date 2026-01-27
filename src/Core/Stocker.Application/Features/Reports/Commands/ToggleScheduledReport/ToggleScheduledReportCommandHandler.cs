using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Commands.ToggleScheduledReport;

internal sealed class ToggleScheduledReportCommandHandler : IRequestHandler<ToggleScheduledReportCommand, Result<ScheduledReportDto>>
{
    private readonly IReportsService _reportsService;

    public ToggleScheduledReportCommandHandler(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    public async Task<Result<ScheduledReportDto>> Handle(ToggleScheduledReportCommand request, CancellationToken cancellationToken)
    {
        var result = await _reportsService.ToggleScheduledReportAsync(request.Id, cancellationToken);

        if (result == null)
        {
            return Result.Failure<ScheduledReportDto>(Error.NotFound("ScheduledReport.NotFound", "Scheduled report not found"));
        }

        return Result.Success(result);
    }
}
