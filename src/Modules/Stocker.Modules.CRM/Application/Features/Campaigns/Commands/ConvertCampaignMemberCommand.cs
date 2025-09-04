using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Commands;

public class ConvertCampaignMemberCommand : IRequest<Result<CampaignMemberDto>>
{
    public Guid CampaignId { get; set; }
    public Guid MemberId { get; set; }
}