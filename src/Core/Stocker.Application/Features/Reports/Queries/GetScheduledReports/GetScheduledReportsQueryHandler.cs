using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Queries.GetScheduledReports;

internal sealed class GetScheduledReportsQueryHandler : IRequestHandler<GetScheduledReportsQuery, Result<List<ScheduledReportDto>>>
{
    private readonly IReportsService _reportsService;

    public GetScheduledReportsQueryHandler(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    public async Task<Result<List<ScheduledReportDto>>> Handle(GetScheduledReportsQuery request, CancellationToken cancellationToken)
    {
        var result = await _reportsService.GetScheduledReportsAsync(cancellationToken);
        return Result.Success(result);
    }
}
