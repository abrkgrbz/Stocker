using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries.Public;

/// <summary>
/// Query to get full pricing information (modules, bundles, add-ons) in a single response (Public - No Auth Required)
/// </summary>
public record GetPublicFullPricingQuery : IRequest<Result<GetPublicFullPricingResponse>>;

public record GetPublicFullPricingResponse
{
    public bool Success { get; init; } = true;
    public IReadOnlyList<ModulePricingDto> Modules { get; init; } = new List<ModulePricingDto>();
    public IReadOnlyList<ModuleBundleDto> Bundles { get; init; } = new List<ModuleBundleDto>();
    public IReadOnlyList<AddOnPricingDto> AddOns { get; init; } = new List<AddOnPricingDto>();
}
