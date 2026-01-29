using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries.Public;

/// <summary>
/// Handler for GetPublicModulesQuery
/// </summary>
public class GetPublicModulesQueryHandler : IRequestHandler<GetPublicModulesQuery, Result<GetPublicModulesResponse>>
{
    private readonly IPricingService _pricingService;
    private readonly ILogger<GetPublicModulesQueryHandler> _logger;

    public GetPublicModulesQueryHandler(
        IPricingService pricingService,
        ILogger<GetPublicModulesQueryHandler> logger)
    {
        _pricingService = pricingService;
        _logger = logger;
    }

    public async Task<Result<GetPublicModulesResponse>> Handle(
        GetPublicModulesQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var modules = await _pricingService.GetModulePricingsAsync(cancellationToken);

            return Result<GetPublicModulesResponse>.Success(new GetPublicModulesResponse
            {
                Success = true,
                Modules = modules
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public module pricings");
            return Result<GetPublicModulesResponse>.Failure("Failed to retrieve module pricings");
        }
    }
}
