using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Handlers;

public class GetOpportunityByIdQueryHandler : IRequestHandler<GetOpportunityByIdQuery, OpportunityDto?>
{
    private readonly ILogger<GetOpportunityByIdQueryHandler> _logger;

    public GetOpportunityByIdQueryHandler(ILogger<GetOpportunityByIdQueryHandler> logger)
    {
        _logger = logger;
    }

    public async Task<OpportunityDto?> Handle(GetOpportunityByIdQuery request, CancellationToken cancellationToken)
    {
        // TODO: Implement opportunity retrieval logic
        // This is a placeholder implementation until Opportunity entity and repository are created

        _logger.LogWarning("GetOpportunityByIdQuery: Handler is a placeholder. Opportunity feature not fully implemented yet.");

        await Task.CompletedTask;

        return null;
    }
}
