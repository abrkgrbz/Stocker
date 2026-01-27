using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetGrowthAnalytics;

internal sealed class GetGrowthAnalyticsQueryHandler : IRequestHandler<GetGrowthAnalyticsQuery, Result<GrowthAnalyticsDto>>
{
    private readonly IAnalyticsService _analyticsService;

    public GetGrowthAnalyticsQueryHandler(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    public async Task<Result<GrowthAnalyticsDto>> Handle(GetGrowthAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var result = await _analyticsService.GetGrowthAnalyticsAsync(cancellationToken);
        return Result.Success(result);
    }
}
