using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Queries.GetReportTypesGrouped;

internal sealed class GetReportTypesGroupedQueryHandler : IRequestHandler<GetReportTypesGroupedQuery, Result<Dictionary<string, List<ReportTypeDto>>>>
{
    private readonly IReportsService _reportsService;

    public GetReportTypesGroupedQueryHandler(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    public async Task<Result<Dictionary<string, List<ReportTypeDto>>>> Handle(GetReportTypesGroupedQuery request, CancellationToken cancellationToken)
    {
        var result = await _reportsService.GetReportTypesGroupedAsync(cancellationToken);
        return Result.Success(result);
    }
}
