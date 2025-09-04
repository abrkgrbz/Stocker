using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Pipelines.Queries;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Handlers;

public class GetPipelinesQueryHandler : IRequestHandler<GetPipelinesQuery, IEnumerable<PipelineDto>>
{
    public GetPipelinesQueryHandler()
    {
    }

    public async Task<IEnumerable<PipelineDto>> Handle(GetPipelinesQuery request, CancellationToken cancellationToken)
    {
        // TODO: Implement pipelines retrieval logic
        // This is a placeholder implementation until Pipeline entity and repository are created
        
        await Task.CompletedTask;

        return new List<PipelineDto>();
    }
}