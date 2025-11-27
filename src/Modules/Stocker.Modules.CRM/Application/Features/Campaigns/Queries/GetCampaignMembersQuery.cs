using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

public class GetCampaignMembersQuery : IRequest<IEnumerable<CampaignMemberDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid CampaignId { get; set; }
}

public class GetCampaignMembersQueryHandler : IRequestHandler<GetCampaignMembersQuery, IEnumerable<CampaignMemberDto>>
{
    private readonly CRMDbContext _context;

    public GetCampaignMembersQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CampaignMemberDto>> Handle(GetCampaignMembersQuery request, CancellationToken cancellationToken)
    {
        var campaign = await _context.Campaigns
            .Include(c => c.Members)
                .ThenInclude(m => m.Lead)
            .Include(c => c.Members)
                .ThenInclude(m => m.Contact)
            .FirstOrDefaultAsync(c => c.Id == request.CampaignId && c.TenantId == request.TenantId, cancellationToken);

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