using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Queries.GetReportTypes;

internal sealed class GetReportTypesQueryHandler : IRequestHandler<GetReportTypesQuery, Result<List<ReportTypeDto>>>
{
    private readonly IReportsService _reportsService;

    public GetReportTypesQueryHandler(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    public async Task<Result<List<ReportTypeDto>>> Handle(GetReportTypesQuery request, CancellationToken cancellationToken)
    {
        var result = await _reportsService.GetReportTypesAsync(cancellationToken);
        return Result.Success(result);
    }
}
