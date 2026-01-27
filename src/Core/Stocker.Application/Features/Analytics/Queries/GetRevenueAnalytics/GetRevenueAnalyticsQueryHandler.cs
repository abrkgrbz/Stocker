using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetRevenueAnalytics;

internal sealed class GetRevenueAnalyticsQueryHandler : IRequestHandler<GetRevenueAnalyticsQuery, Result<RevenueAnalyticsDto>>
{
    private readonly IAnalyticsService _analyticsService;

    public GetRevenueAnalyticsQueryHandler(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    public async Task<Result<RevenueAnalyticsDto>> Handle(GetRevenueAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var result = await _analyticsService.GetRevenueAnalyticsAsync(
            request.StartDate,
            request.EndDate,
            request.Period,
            cancellationToken);

        return Result.Success(result);
    }
}
