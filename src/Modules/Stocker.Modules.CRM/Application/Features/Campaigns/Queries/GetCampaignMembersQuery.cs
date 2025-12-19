using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

public class GetCampaignMembersQuery : IRequest<IEnumerable<CampaignMemberDto>>
{
    public Guid CampaignId { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetCampaignMembersQueryHandler : IRequestHandler<GetCampaignMembersQuery, IEnumerable<CampaignMemberDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetCampaignMembersQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<CampaignMemberDto>> Handle(GetCampaignMembersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var campaign = await _unitOfWork.ReadRepository<Campaign>().AsQueryable()
            .Include(c => c.Members)
                .ThenInclude(m => m.Lead)
            .Include(c => c.Members)
                .ThenInclude(m => m.Contact)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == tenantId, cancellationToken);

        if (campaign == null)
            return Enumerable.Empty<CampaignMemberDto>();

        return campaign.Members.Select(m => new CampaignMemberDto
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
        });
    }
}
