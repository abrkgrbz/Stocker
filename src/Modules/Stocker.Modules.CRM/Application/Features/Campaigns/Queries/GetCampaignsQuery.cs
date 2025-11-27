using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

public class GetCampaignsQuery : IRequest<IEnumerable<CampaignDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? Search { get; set; }
    public CampaignStatus? Status { get; set; }
    public CampaignType? Type { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class GetCampaignsQueryHandler : IRequestHandler<GetCampaignsQuery, IEnumerable<CampaignDto>>
{
    private readonly CRMDbContext _context;

    public GetCampaignsQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CampaignDto>> Handle(GetCampaignsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Campaigns
            .Include(c => c.Members)
            .Where(c => c.TenantId == request.TenantId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            query = query.Where(c => c.Name.Contains(request.Search) ||
                                      (c.Description != null && c.Description.Contains(request.Search)));
        }

        if (request.Status.HasValue)
            query = query.Where(c => c.Status == request.Status.Value);

        if (request.Type.HasValue)
            query = query.Where(c => c.Type == request.Type.Value);

        if (request.FromDate.HasValue)
            query = query.Where(c => c.StartDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(c => c.EndDate <= request.ToDate.Value);

        var campaigns = await query
            .OrderByDescending(c => c.StartDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return campaigns.Select(c => new CampaignDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            Type = c.Type,
            Status = c.Status,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            BudgetedCost = c.BudgetedCost.Amount,
            ActualCost = c.ActualCost.Amount,
            ExpectedRevenue = c.ExpectedRevenue.Amount,
            ActualRevenue = c.ActualRevenue.Amount,
            TargetAudience = c.TargetAudience,
            TargetLeads = c.ExpectedResponse,
            ActualLeads = c.ActualResponse,
            OwnerId = c.OwnerId.ToString(),
            MemberCount = c.Members.Count
        });
    }
}