using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Competitors.Queries;

public class GetCompetitorByIdQuery : IRequest<CompetitorDto?>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class GetCompetitorByIdQueryHandler : IRequestHandler<GetCompetitorByIdQuery, CompetitorDto?>
{
    private readonly CRMDbContext _context;

    public GetCompetitorByIdQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<CompetitorDto?> Handle(GetCompetitorByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Competitors
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.TenantId == request.TenantId, cancellationToken);

        if (entity == null)
            return null;

        return new CompetitorDto
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            Name = entity.Name,
            Code = entity.Code,
            Description = entity.Description,
            IsActive = entity.IsActive,
            ThreatLevel = entity.ThreatLevel,
            Website = entity.Website,
            Headquarters = entity.Headquarters,
            FoundedYear = entity.FoundedYear,
            EmployeeCount = entity.EmployeeCount,
            AnnualRevenue = entity.AnnualRevenue,
            MarketShare = entity.MarketShare,
            TargetMarkets = entity.TargetMarkets,
            Industries = entity.Industries,
            GeographicCoverage = entity.GeographicCoverage,
            CustomerSegments = entity.CustomerSegments,
            PricingStrategy = entity.PricingStrategy,
            PriceRange = entity.PriceRange,
            PriceComparison = entity.PriceComparison,
            SalesChannels = entity.SalesChannels,
            MarketingStrategy = entity.MarketingStrategy,
            KeyMessage = entity.KeyMessage,
            SocialMediaLinks = entity.SocialMediaLinks,
            ContactPerson = entity.ContactPerson,
            Email = entity.Email,
            Phone = entity.Phone,
            SwotSummary = entity.SwotSummary,
            CompetitiveStrategy = entity.CompetitiveStrategy,
            WinStrategy = entity.WinStrategy,
            LossReasons = entity.LossReasons,
            LastAnalysisDate = entity.LastAnalysisDate,
            AnalyzedBy = entity.AnalyzedBy,
            EncounterCount = entity.EncounterCount,
            WinCount = entity.WinCount,
            LossCount = entity.LossCount,
            WinRate = entity.WinRate,
            Notes = entity.Notes,
            Tags = entity.Tags
        };
    }
}
