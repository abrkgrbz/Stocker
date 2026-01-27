using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetUserAnalytics;

internal sealed class GetUserAnalyticsQueryHandler : IRequestHandler<GetUserAnalyticsQuery, Result<UserAnalyticsDto>>
{
    private readonly IAnalyticsService _analyticsService;

    public GetUserAnalyticsQueryHandler(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    public async Task<Result<UserAnalyticsDto>> Handle(GetUserAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var result = await _analyticsService.GetUserAnalyticsAsync(request.Period, cancellationToken);
        return Result.Success(result);
    }
}
