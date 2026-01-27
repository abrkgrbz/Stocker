using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Commands.DeleteScheduledReport;

internal sealed class DeleteScheduledReportCommandHandler : IRequestHandler<DeleteScheduledReportCommand, Result<bool>>
{
    private readonly IReportsService _reportsService;

    public DeleteScheduledReportCommandHandler(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    public async Task<Result<bool>> Handle(DeleteScheduledReportCommand request, CancellationToken cancellationToken)
    {
        var success = await _reportsService.DeleteScheduledReportAsync(request.Id, cancellationToken);

        if (!success)
        {
            return Result.Failure<bool>(Error.NotFound("ScheduledReport.NotFound", "Scheduled report not found"));
        }

        return Result.Success(true);
    }
}
