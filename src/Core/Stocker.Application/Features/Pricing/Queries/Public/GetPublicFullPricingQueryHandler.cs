using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries.Public;

/// <summary>
/// Handler for GetPublicFullPricingQuery
/// </summary>
public class GetPublicFullPricingQueryHandler : IRequestHandler<GetPublicFullPricingQuery, Result<GetPublicFullPricingResponse>>
{
    private readonly IPricingService _pricingService;
    private readonly ILogger<GetPublicFullPricingQueryHandler> _logger;

    public GetPublicFullPricingQueryHandler(
        IPricingService pricingService,
        ILogger<GetPublicFullPricingQueryHandler> logger)
    {
        _pricingService = pricingService;
        _logger = logger;
    }

    public async Task<Result<GetPublicFullPricingResponse>> Handle(
        GetPublicFullPricingQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Execute all queries in parallel for better performance
            var modulesTask = _pricingService.GetModulePricingsAsync(cancellationToken);
            var bundlesTask = _pricingService.GetModuleBundlesAsync(cancellationToken);
            var addOnsTask = _pricingService.GetAddOnsAsync(null, cancellationToken);

            await Task.WhenAll(modulesTask, bundlesTask, addOnsTask);

            return Result<GetPublicFullPricingResponse>.Success(new GetPublicFullPricingResponse
            {
                Success = true,
                Modules = await modulesTask,
                Bundles = await bundlesTask,
                AddOns = await addOnsTask
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving full public pricing");
            return Result<GetPublicFullPricingResponse>.Failure("Failed to retrieve pricing information");
        }
    }
}
