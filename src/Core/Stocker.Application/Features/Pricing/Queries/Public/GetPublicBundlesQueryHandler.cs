using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries.Public;

/// <summary>
/// Handler for GetPublicBundlesQuery
/// </summary>
public class GetPublicBundlesQueryHandler : IRequestHandler<GetPublicBundlesQuery, Result<GetPublicBundlesResponse>>
{
    private readonly IPricingService _pricingService;
    private readonly ILogger<GetPublicBundlesQueryHandler> _logger;

    public GetPublicBundlesQueryHandler(
        IPricingService pricingService,
        ILogger<GetPublicBundlesQueryHandler> logger)
    {
        _pricingService = pricingService;
        _logger = logger;
    }

    public async Task<Result<GetPublicBundlesResponse>> Handle(
        GetPublicBundlesQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var bundles = await _pricingService.GetModuleBundlesAsync(cancellationToken);

            return Result<GetPublicBundlesResponse>.Success(new GetPublicBundlesResponse
            {
                Success = true,
                Bundles = bundles
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public bundle pricings");
            return Result<GetPublicBundlesResponse>.Failure("Failed to retrieve bundle pricings");
        }
    }
}
