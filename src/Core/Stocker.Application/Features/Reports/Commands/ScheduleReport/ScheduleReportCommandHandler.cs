using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Commands.ScheduleReport;

internal sealed class ScheduleReportCommandHandler : IRequestHandler<ScheduleReportCommand, Result<ScheduledReportDto>>
{
    private readonly IReportsService _reportsService;

    public ScheduleReportCommandHandler(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    public async Task<Result<ScheduledReportDto>> Handle(ScheduleReportCommand request, CancellationToken cancellationToken)
    {
        var result = await _reportsService.ScheduleReportAsync(
            request.Request,
            request.CurrentUserEmail,
            cancellationToken);

        if (result == null)
        {
            return Result.Failure<ScheduledReportDto>(Error.Validation("Report.InvalidSchedule", "Invalid report type or frequency"));
        }

        return Result.Success(result);
    }
}
