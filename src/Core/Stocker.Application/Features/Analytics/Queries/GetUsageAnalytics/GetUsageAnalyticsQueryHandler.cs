using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetUsageAnalytics;

internal sealed class GetUsageAnalyticsQueryHandler : IRequestHandler<GetUsageAnalyticsQuery, Result<UsageAnalyticsDto>>
{
    private readonly IAnalyticsService _analyticsService;

    public GetUsageAnalyticsQueryHandler(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    public async Task<Result<UsageAnalyticsDto>> Handle(GetUsageAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var result = await _analyticsService.GetUsageAnalyticsAsync(cancellationToken);
        return Result.Success(result);
    }
}
