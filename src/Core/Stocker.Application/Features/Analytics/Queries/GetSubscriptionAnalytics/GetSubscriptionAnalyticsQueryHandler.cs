using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetSubscriptionAnalytics;

internal sealed class GetSubscriptionAnalyticsQueryHandler : IRequestHandler<GetSubscriptionAnalyticsQuery, Result<SubscriptionAnalyticsDto>>
{
    private readonly IAnalyticsService _analyticsService;

    public GetSubscriptionAnalyticsQueryHandler(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    public async Task<Result<SubscriptionAnalyticsDto>> Handle(GetSubscriptionAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var result = await _analyticsService.GetSubscriptionAnalyticsAsync(cancellationToken);
        return Result.Success(result);
    }
}
