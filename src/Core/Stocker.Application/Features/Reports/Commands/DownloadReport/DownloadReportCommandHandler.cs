using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Commands.DownloadReport;

internal sealed class DownloadReportCommandHandler : IRequestHandler<DownloadReportCommand, Result<DownloadReportResult>>
{
    private readonly IReportsService _reportsService;

    public DownloadReportCommandHandler(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    public async Task<Result<DownloadReportResult>> Handle(DownloadReportCommand request, CancellationToken cancellationToken)
    {
        var result = await _reportsService.DownloadReportAsync(
            request.ReportId,
            request.Format,
            cancellationToken);

        if (result == null)
        {
            return Result.Failure<DownloadReportResult>(Error.NotFound("Report.NotFound", "Report not found"));
        }

        return Result.Success(new DownloadReportResult(result.Value.Content, result.Value.FileName));
    }
}
