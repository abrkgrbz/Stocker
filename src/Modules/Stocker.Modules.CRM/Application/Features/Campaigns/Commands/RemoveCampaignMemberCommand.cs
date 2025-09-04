using MediatR;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class RemoveCampaignMemberCommand : IRequest
{
    public Guid CampaignId { get; set; }
    public Guid MemberId { get; set; }
}