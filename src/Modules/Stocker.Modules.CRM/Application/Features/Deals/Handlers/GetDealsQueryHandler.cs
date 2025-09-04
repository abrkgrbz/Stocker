using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Deals.Queries;

namespace Stocker.Modules.CRM.Application.Features.Deals.Handlers;

public class GetDealsQueryHandler : IRequestHandler<GetDealsQuery, IEnumerable<DealDto>>
{
    public GetDealsQueryHandler()
    {
    }

    public async Task<IEnumerable<DealDto>> Handle(GetDealsQuery request, CancellationToken cancellationToken)
    {
        // TODO: Implement deals retrieval logic
        // This is a placeholder implementation until Deal entity and repository are created
        
        await Task.CompletedTask;

        return new List<DealDto>();
    }
}