using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

public class GetCampaignByIdQuery : IRequest<CampaignDto?>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class GetCampaignByIdQueryHandler : IRequestHandler<GetCampaignByIdQuery, CampaignDto?>
{
    private readonly CRMDbContext _context;

    public GetCampaignByIdQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<CampaignDto?> Handle(GetCampaignByIdQuery request, CancellationToken cancellationToken)
    {
        var campaign = await _context.Campaigns
            .Include(c => c.Members)
                .ThenInclude(m => m.Lead)
            .Include(c => c.Members)
                .ThenInclude(m => m.Contact)
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.TenantId == request.TenantId, cancellationToken);

        if (campaign == null)
            return null;

        return new CampaignDto
        {
            Id = campaign.Id,
            Name = campaign.Name,
            Description = campaign.Description,
            Type = campaign.Type,
            Status = campaign.Status,
            StartDate = campaign.StartDate,
            EndDate = campaign.EndDate,
            BudgetedCost = campaign.BudgetedCost.Amount,
            ActualCost = campaign.ActualCost.Amount,
            ExpectedRevenue = campaign.ExpectedRevenue.Amount,
            ActualRevenue = campaign.ActualRevenue.Amount,
            TargetAudience = campaign.TargetAudience,
            TargetLeads = campaign.ExpectedResponse,
            ActualLeads = campaign.ActualResponse,
            ConvertedLeads = campaign.Members.Count(m => m.HasConverted),
            OwnerId = campaign.OwnerId.ToString(),
            MemberCount = campaign.Members.Count,
            TopMembers = campaign.Members.Take(10).Select(m => new CampaignMemberDto
            {
                Id = m.Id,
                CampaignId = m.CampaignId,
                CampaignName = campaign.Name,
                LeadId = m.LeadId,
                LeadName = m.Lead != null ? $"{m.Lead.FirstName} {m.Lead.LastName}" : null,
                ContactId = m.ContactId,
                ContactName = m.Contact != null ? $"{m.Contact.FirstName} {m.Contact.LastName}" : null,
                Status = m.Status,
                HasResponded = m.RespondedDate.HasValue,
                RespondedDate = m.RespondedDate,
                IsConverted = m.HasConverted,
                ConvertedDate = m.ConvertedDate,
                Email = m.Lead?.Email ?? m.Contact?.Email
            }).ToList()
        };
    }
}