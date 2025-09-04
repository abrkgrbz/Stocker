using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Campaigns.Queries;

namespace Stocker.Modules.CRM.Application.Features.Campaigns.Handlers;

public class GetCampaignsQueryHandler : IRequestHandler<GetCampaignsQuery, IEnumerable<CampaignDto>>
{
    public GetCampaignsQueryHandler()
    {
    }

    public async Task<IEnumerable<CampaignDto>> Handle(GetCampaignsQuery request, CancellationToken cancellationToken)
    {
        // TODO: Implement campaigns retrieval logic
        // This is a placeholder implementation until Campaign entity and repository are created
        
        await Task.CompletedTask;

        return new List<CampaignDto>();
    }
}