using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.Commands.UpdateWorkflow;

public class UpdateWorkflowCommandHandler : IRequestHandler<UpdateWorkflowCommand, Result<Unit>>
{
    private readonly IWorkflowRepository _workflowRepository;
    private readonly ILogger<UpdateWorkflowCommandHandler> _logger;

    public UpdateWorkflowCommandHandler(
        IWorkflowRepository workflowRepository,
        ILogger<UpdateWorkflowCommandHandler> logger)
    {
        _workflowRepository = workflowRepository;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(UpdateWorkflowCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _workflowRepository.GetByIdWithStepsAsync(request.WorkflowId, cancellationToken);

            if (workflow == null)
                return Result<Unit>.Failure(Error.NotFound("Workflow", $"Workflow with ID {request.WorkflowId} not found"));

            // Update basic properties
            var updateDetailsResult = workflow.UpdateDetails(request.Name, request.Description);
            if (!updateDetailsResult.IsSuccess)
                return Result<Unit>.Failure(updateDetailsResult.Error);

            var updateTriggerResult = workflow.UpdateTrigger(request.TriggerType, request.TriggerConditions);
            if (!updateTriggerResult.IsSuccess)
                return Result<Unit>.Failure(updateTriggerResult.Error);

            // Deactivate workflow temporarily if active (to allow step changes)
            bool wasActive = workflow.IsActive;
            if (wasActive)
            {
                var deactivateResult = workflow.Deactivate();
                if (!deactivateResult.IsSuccess)
                    return Result<Unit>.Failure(deactivateResult.Error);
            }

            // Remove all existing steps
            var stepsToRemove = workflow.Steps.ToList();
            foreach (var step in stepsToRemove)
            {
                workflow.RemoveStep(step);
            }

            // Add updated steps
            foreach (var stepDto in request.Steps.OrderBy(s => s.StepOrder))
            {
                var stepResult = WorkflowStep.Create(
                    workflow.Id,
                    stepDto.Name,
                    stepDto.Description,
                    stepDto.ActionType,
                    stepDto.StepOrder,
                    stepDto.ActionConfiguration,
                    stepDto.Conditions);

                if (!stepResult.IsSuccess)
                    return Result<Unit>.Failure(stepResult.Error);

                var step = stepResult.Value;
                step.SetDelay(stepDto.DelayMinutes);
                step.SetContinueOnError(stepDto.ContinueOnError);

                if (!stepDto.IsEnabled)
                    step.Disable();

                workflow.AddStep(step);
            }

            // Reactivate if needed
            if (request.IsActive)
            {
                var activateResult = workflow.Activate();
                if (!activateResult.IsSuccess)
                    return Result<Unit>.Failure(activateResult.Error);
            }

            await _workflowRepository.UpdateAsync(workflow, cancellationToken);
            await _workflowRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Workflow {WorkflowId} updated successfully", request.WorkflowId);

            return Result<Unit>.Success(Unit.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating workflow {WorkflowId}", request.WorkflowId);
            return Result<Unit>.Failure(Error.Failure("Workflow.Update", $"Failed to update workflow: {ex.Message}"));
        }
    }
}
