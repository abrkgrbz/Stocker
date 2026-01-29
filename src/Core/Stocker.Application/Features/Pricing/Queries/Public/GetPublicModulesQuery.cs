using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries.Public;

/// <summary>
/// Query to get all active module pricings (Public - No Auth Required)
/// </summary>
public record GetPublicModulesQuery : IRequest<Result<GetPublicModulesResponse>>;

public record GetPublicModulesResponse
{
    public bool Success { get; init; } = true;
    public IReadOnlyList<ModulePricingDto> Modules { get; init; } = new List<ModulePricingDto>();
}
