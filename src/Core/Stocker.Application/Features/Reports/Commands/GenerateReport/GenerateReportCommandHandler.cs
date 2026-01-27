using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Commands.GenerateReport;

internal sealed class GenerateReportCommandHandler : IRequestHandler<GenerateReportCommand, Result<ReportResultDto>>
{
    private readonly IReportsService _reportsService;

    public GenerateReportCommandHandler(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    public async Task<Result<ReportResultDto>> Handle(GenerateReportCommand request, CancellationToken cancellationToken)
    {
        var result = await _reportsService.GenerateReportAsync(
            request.Request,
            request.CurrentUserEmail,
            cancellationToken);

        if (result == null)
        {
            return Result.Failure<ReportResultDto>(Error.Validation("Report.InvalidType", "Invalid or unsupported report type"));
        }

        return Result.Success(result);
    }
}
