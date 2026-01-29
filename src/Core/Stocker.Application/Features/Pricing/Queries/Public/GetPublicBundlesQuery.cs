using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries.Public;

/// <summary>
/// Query to get all active bundles with pricing (Public - No Auth Required)
/// </summary>
public record GetPublicBundlesQuery : IRequest<Result<GetPublicBundlesResponse>>;

public record GetPublicBundlesResponse
{
    public bool Success { get; init; } = true;
    public IReadOnlyList<ModuleBundleDto> Bundles { get; init; } = new List<ModuleBundleDto>();
}
