using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

public class GetCampaignByIdQuery : IRequest<CampaignDto?>
{
    public Guid Id { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetCampaignByIdQueryHandler : IRequestHandler<GetCampaignByIdQuery, CampaignDto?>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetCampaignByIdQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CampaignDto?> Handle(GetCampaignByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var campaign = await _unitOfWork.ReadRepository<Campaign>().AsQueryable()
            .Include(c => c.Members)
                .ThenInclude(m => m.Lead)
            .Include(c => c.Members)
                .ThenInclude(m => m.Contact)
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.TenantId == tenantId, cancellationToken);

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
            // Email campaign performance metrics
            TotalRecipients = campaign.Members.Count,
            SentCount = campaign.NumberSent,
            DeliveredCount = campaign.NumberDelivered,
            OpenedCount = campaign.NumberOpened,
            ClickedCount = campaign.NumberClicked,
            ResponseCount = campaign.ActualResponse,
            ConvertedCount = campaign.Members.Count(m => m.HasConverted),
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
