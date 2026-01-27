using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Master;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Analytics.Queries.GetCustomAnalytics;

internal sealed class GetCustomAnalyticsQueryHandler : IRequestHandler<GetCustomAnalyticsQuery, Result<CustomAnalyticsResultDto>>
{
    private readonly IAnalyticsService _analyticsService;

    public GetCustomAnalyticsQueryHandler(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    public async Task<Result<CustomAnalyticsResultDto>> Handle(GetCustomAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var result = await _analyticsService.GetCustomAnalyticsAsync(request.Request, cancellationToken);
        return Result.Success(result);
    }
}
