using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Activities.Queries;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.Features.Activities.Handlers;

public class GetActivitiesQueryHandler : IRequestHandler<GetActivitiesQuery, IEnumerable<ActivityDto>>
{
    public GetActivitiesQueryHandler()
    {
    }

    public async Task<IEnumerable<ActivityDto>> Handle(GetActivitiesQuery request, CancellationToken cancellationToken)
    {
        // TODO: Implement activities retrieval logic
        // This is a placeholder implementation until Activity entity and repository are created
        
        await Task.CompletedTask;

        return new List<ActivityDto>();
    }
}