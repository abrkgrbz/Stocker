using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Handlers;

public class GetOpportunitiesQueryHandler : IRequestHandler<GetOpportunitiesQuery, IEnumerable<OpportunityDto>>
{
    public GetOpportunitiesQueryHandler()
    {
    }

    public async Task<IEnumerable<OpportunityDto>> Handle(GetOpportunitiesQuery request, CancellationToken cancellationToken)
    {
        // TODO: Implement opportunities retrieval logic
        // This is a placeholder implementation until Opportunity entity and repository are created
        
        await Task.CompletedTask;

        return new List<OpportunityDto>();
    }
}