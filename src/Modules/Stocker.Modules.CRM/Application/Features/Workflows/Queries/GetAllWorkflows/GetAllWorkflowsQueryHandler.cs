using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Features.Workflows.Queries.GetWorkflow;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Queries.GetAllWorkflows;

public class GetAllWorkflowsQueryHandler : IRequestHandler<GetAllWorkflowsQuery, Result<List<WorkflowResponse>>>
{
    private readonly IWorkflowRepository _workflowRepository;
    private readonly ILogger<GetAllWorkflowsQueryHandler> _logger;

    public GetAllWorkflowsQueryHandler(
        IWorkflowRepository workflowRepository,
        ILogger<GetAllWorkflowsQueryHandler> logger)
    {
        _workflowRepository = workflowRepository;
        _logger = logger;
    }

    public async Task<Result<List<WorkflowResponse>>> Handle(GetAllWorkflowsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var workflows = await _workflowRepository.GetAllWithStepsAsync(cancellationToken);

            var responses = workflows.Select(workflow => new WorkflowResponse(
                workflow.Id,
                workflow.Name,
                workflow.Description,
                workflow.TriggerType,
                workflow.EntityType,
                workflow.TriggerConditions ?? "{}",
                workflow.IsActive,
                workflow.ExecutionCount,
                workflow.LastExecutedAt,
                workflow.Steps.Select(s => new WorkflowStepResponse(
                    s.Id,
                    s.Name,
                    s.Description,
                    s.ActionType,
                    s.StepOrder,
                    s.ActionConfiguration ?? "{}",
                    s.DelayMinutes,
                    s.IsEnabled
                )).ToList()
            )).ToList();

            return Result<List<WorkflowResponse>>.Success(responses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all workflows");
            return Result<List<WorkflowResponse>>.Failure(Error.Failure("Workflows.GetAll", $"Failed to retrieve workflows: {ex.Message}"));
        }
    }
}
