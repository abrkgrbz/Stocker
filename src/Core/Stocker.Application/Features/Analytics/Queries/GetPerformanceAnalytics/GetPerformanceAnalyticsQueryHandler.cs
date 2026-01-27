using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetPerformanceAnalytics;

internal sealed class GetPerformanceAnalyticsQueryHandler : IRequestHandler<GetPerformanceAnalyticsQuery, Result<PerformanceAnalyticsDto>>
{
    private readonly IAnalyticsService _analyticsService;

    public GetPerformanceAnalyticsQueryHandler(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    public async Task<Result<PerformanceAnalyticsDto>> Handle(GetPerformanceAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var result = await _analyticsService.GetPerformanceAnalyticsAsync(cancellationToken);
        return Result.Success(result);
    }
}
