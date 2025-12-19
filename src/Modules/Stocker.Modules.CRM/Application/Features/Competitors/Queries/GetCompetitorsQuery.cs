using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.CRM.Application.Features.Competitors.Queries;

public class GetCompetitorsQuery : IRequest<PagedResult<CompetitorDto>>
{
    public bool? IsActive { get; set; }
    public ThreatLevel? ThreatLevel { get; set; }
    public string? SearchTerm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetCompetitorsQueryHandler : IRequestHandler<GetCompetitorsQuery, PagedResult<CompetitorDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetCompetitorsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<PagedResult<CompetitorDto>> Handle(GetCompetitorsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Competitor>().AsQueryable()
            .Where(c => c.TenantId == tenantId);

        if (request.IsActive.HasValue)
            query = query.Where(c => c.IsActive == request.IsActive.Value);

        if (request.ThreatLevel.HasValue)
            query = query.Where(c => c.ThreatLevel == request.ThreatLevel.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(searchTerm) ||
                                   (c.Code != null && c.Code.ToLower().Contains(searchTerm)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(c => c.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CompetitorDto
            {
                Id = c.Id,
                TenantId = c.TenantId,
                Name = c.Name,
                Code = c.Code,
                Description = c.Description,
                IsActive = c.IsActive,
                ThreatLevel = c.ThreatLevel,
                Website = c.Website,
                Headquarters = c.Headquarters,
                FoundedYear = c.FoundedYear,
                EmployeeCount = c.EmployeeCount,
                AnnualRevenue = c.AnnualRevenue,
                MarketShare = c.MarketShare,
                TargetMarkets = c.TargetMarkets,
                Industries = c.Industries,
                GeographicCoverage = c.GeographicCoverage,
                CustomerSegments = c.CustomerSegments,
                PricingStrategy = c.PricingStrategy,
                PriceRange = c.PriceRange,
                PriceComparison = c.PriceComparison,
                SalesChannels = c.SalesChannels,
                MarketingStrategy = c.MarketingStrategy,
                KeyMessage = c.KeyMessage,
                SocialMediaLinks = c.SocialMediaLinks,
                ContactPerson = c.ContactPerson,
                Email = c.Email,
                Phone = c.Phone,
                SwotSummary = c.SwotSummary,
                CompetitiveStrategy = c.CompetitiveStrategy,
                WinStrategy = c.WinStrategy,
                LossReasons = c.LossReasons,
                LastAnalysisDate = c.LastAnalysisDate,
                AnalyzedBy = c.AnalyzedBy,
                EncounterCount = c.EncounterCount,
                WinCount = c.WinCount,
                LossCount = c.LossCount,
                WinRate = c.WinRate,
                Notes = c.Notes,
                Tags = c.Tags
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<CompetitorDto>(items, totalCount, request.Page, request.PageSize);
    }
}
