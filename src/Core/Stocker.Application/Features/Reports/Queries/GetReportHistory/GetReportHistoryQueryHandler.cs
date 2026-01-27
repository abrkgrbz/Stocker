using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Queries.GetReportHistory;

internal sealed class GetReportHistoryQueryHandler : IRequestHandler<GetReportHistoryQuery, Result<List<ReportHistoryDto>>>
{
    private readonly IReportsService _reportsService;

    public GetReportHistoryQueryHandler(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    public async Task<Result<List<ReportHistoryDto>>> Handle(GetReportHistoryQuery request, CancellationToken cancellationToken)
    {
        var result = await _reportsService.GetReportHistoryAsync(request.Page, request.PageSize, cancellationToken);
        return Result.Success(result);
    }
}
