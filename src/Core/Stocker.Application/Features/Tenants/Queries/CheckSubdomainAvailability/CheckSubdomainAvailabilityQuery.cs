using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Queries.CheckSubdomainAvailability;

public sealed record CheckSubdomainAvailabilityQuery(string Subdomain) : IRequest<Result<CheckSubdomainAvailabilityResponse>>;

public sealed record CheckSubdomainAvailabilityResponse
{
    public bool Available { get; init; }
    public string Subdomain { get; init; } = string.Empty;
    public string? Reason { get; init; }
    public string SuggestedUrl { get; init; } = string.Empty;
}