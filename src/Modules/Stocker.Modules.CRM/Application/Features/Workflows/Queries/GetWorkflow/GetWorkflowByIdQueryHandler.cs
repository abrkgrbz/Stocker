using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Queries.GetWorkflow;

public class GetWorkflowByIdQueryHandler : IRequestHandler<GetWorkflowByIdQuery, Result<WorkflowResponse>>
{
    private readonly IWorkflowRepository _workflowRepository;
    private readonly ILogger<GetWorkflowByIdQueryHandler> _logger;

    public GetWorkflowByIdQueryHandler(
        IWorkflowRepository workflowRepository,
        ILogger<GetWorkflowByIdQueryHandler> logger)
    {
        _workflowRepository = workflowRepository;
        _logger = logger;
    }

    public async Task<Result<WorkflowResponse>> Handle(GetWorkflowByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _workflowRepository.GetByIdWithStepsAsync(request.WorkflowId, cancellationToken);
            if (workflow == null)
                return Result<WorkflowResponse>.Failure(Error.NotFound("Workflow", $"Workflow with ID {request.WorkflowId} not found"));

            var response = new WorkflowResponse(
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
            );

            return Result<WorkflowResponse>.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow {WorkflowId}", request.WorkflowId);
            return Result<WorkflowResponse>.Failure(Error.Failure("Workflow.Get", $"Failed to retrieve workflow: {ex.Message}"));
        }
    }
}
