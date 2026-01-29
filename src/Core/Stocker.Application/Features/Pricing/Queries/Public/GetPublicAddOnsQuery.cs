using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries.Public;

/// <summary>
/// Query to get all active add-ons with pricing (Public - No Auth Required)
/// </summary>
public record GetPublicAddOnsQuery(string? ModuleCode = null) : IRequest<Result<GetPublicAddOnsResponse>>;

public record GetPublicAddOnsResponse
{
    public bool Success { get; init; } = true;
    public IReadOnlyList<AddOnPricingDto> AddOns { get; init; } = new List<AddOnPricingDto>();
}
