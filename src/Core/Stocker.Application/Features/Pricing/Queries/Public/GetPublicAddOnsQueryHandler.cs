using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries.Public;

/// <summary>
/// Handler for GetPublicAddOnsQuery
/// </summary>
public class GetPublicAddOnsQueryHandler : IRequestHandler<GetPublicAddOnsQuery, Result<GetPublicAddOnsResponse>>
{
    private readonly IPricingService _pricingService;
    private readonly ILogger<GetPublicAddOnsQueryHandler> _logger;

    public GetPublicAddOnsQueryHandler(
        IPricingService pricingService,
        ILogger<GetPublicAddOnsQueryHandler> logger)
    {
        _pricingService = pricingService;
        _logger = logger;
    }

    public async Task<Result<GetPublicAddOnsResponse>> Handle(
        GetPublicAddOnsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var addOns = await _pricingService.GetAddOnsAsync(request.ModuleCode, cancellationToken);

            return Result<GetPublicAddOnsResponse>.Success(new GetPublicAddOnsResponse
            {
                Success = true,
                AddOns = addOns
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public add-on pricings");
            return Result<GetPublicAddOnsResponse>.Failure(Error.Failure("Pricing.AddOnRetrievalFailed", "Ek özellik fiyatları alınamadı."));
        }
    }
}
