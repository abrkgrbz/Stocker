using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.Features.Competitors.Commands;

public record CreateCompetitorCommand(
    Guid TenantId,
    string Name,
    string? Code = null,
    string? Description = null,
    bool IsActive = true,
    ThreatLevel ThreatLevel = ThreatLevel.Medium,
    string? Website = null,
    string? Headquarters = null,
    int? FoundedYear = null,
    string? EmployeeCount = null,
    string? AnnualRevenue = null,
    decimal? MarketShare = null,
    string? TargetMarkets = null,
    string? Industries = null,
    string? GeographicCoverage = null,
    string? CustomerSegments = null,
    string? PricingStrategy = null,
    string? PriceRange = null,
    PriceComparison? PriceComparison = null,
    string? SalesChannels = null,
    string? MarketingStrategy = null,
    string? KeyMessage = null,
    string? SocialMediaLinks = null,
    string? ContactPerson = null,
    string? Email = null,
    string? Phone = null,
    string? Notes = null,
    string? Tags = null
) : IRequest<Result<Guid>>;
