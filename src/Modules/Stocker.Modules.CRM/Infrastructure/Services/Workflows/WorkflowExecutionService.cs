using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Features.Workflows.ActionHandlers;
using Stocker.Modules.CRM.Application.Services.Workflows;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Infrastructure.Services.Workflows;

/// <summary>
/// Service for executing workflow steps and actions
/// </summary>
public class WorkflowExecutionService : IWorkflowExecutionService
{
    private readonly IWorkflowExecutionRepository _executionRepository;
    private readonly IWorkflowRepository _workflowRepository;
    private readonly IEnumerable<IWorkflowActionHandler> _actionHandlers;
    private readonly ILogger<WorkflowExecutionService> _logger;

    public WorkflowExecutionService(
        IWorkflowExecutionRepository executionRepository,
        IWorkflowRepository workflowRepository,
        IEnumerable<IWorkflowActionHandler> actionHandlers,
        ILogger<WorkflowExecutionService> logger)
    {
        _executionRepository = executionRepository;
        _workflowRepository = workflowRepository;
        _actionHandlers = actionHandlers;
        _logger = logger;
    }

    public async Task<Result> ProcessExecutionAsync(
        int executionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var execution = await _executionRepository.GetByIdAsync(executionId, cancellationToken);
            if (execution == null)
            {
                return Result.Failure(
                    Error.NotFound("WorkflowExecution", $"Execution with ID {executionId} not found"));
            }

            var workflow = await _workflowRepository.GetByIdWithStepsAsync(
                execution.WorkflowId, cancellationToken);

            if (workflow == null)
            {
                execution.Fail("Workflow not found");
                await _executionRepository.UpdateAsync(execution, cancellationToken);
                await _executionRepository.SaveChangesAsync(cancellationToken);

                return Result.Failure(
                    Error.NotFound("Workflow", $"Workflow with ID {execution.WorkflowId} not found"));
            }

            _logger.LogInformation(
                "Processing workflow execution {ExecutionId} for workflow {WorkflowId}",
                executionId, workflow.Id);

            var steps = workflow.Steps.Where(s => s.IsEnabled).OrderBy(s => s.StepOrder).ToList();

            foreach (var step in steps)
            {
                _logger.LogInformation(
                    "Executing step {StepId}: {StepName} (Action: {ActionType})",
                    step.Id, step.Name, step.ActionType);

                // Apply delay if configured
                if (step.DelayMinutes > 0)
                {
                    _logger.LogInformation(
                        "Delaying step {StepId} for {DelayMinutes} minutes",
                        step.Id, step.DelayMinutes);
                    await Task.Delay(TimeSpan.FromMinutes(step.DelayMinutes), cancellationToken);
                }

                // Find action handler
                var handler = _actionHandlers.FirstOrDefault(h => h.CanHandle(step.ActionType.ToString()));
                if (handler == null)
                {
                    var errorMessage = $"No handler found for action type: {step.ActionType}";
                    _logger.LogError(errorMessage);

                    if (!step.ContinueOnError)
                    {
                        execution.Fail(errorMessage);
                        await _executionRepository.UpdateAsync(execution, cancellationToken);
                        await _executionRepository.SaveChangesAsync(cancellationToken);
                        return Result.Failure(Error.NotFound("ActionHandler", errorMessage));
                    }

                    continue;
                }

                // Parse trigger data from JSON string to dictionary
                Dictionary<string, object>? triggerData = null;
                if (!string.IsNullOrEmpty(execution.TriggerData))
                {
                    try
                    {
                        triggerData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(execution.TriggerData);
                    }
                    catch
                    {
                        _logger.LogWarning("Failed to parse trigger data for execution {ExecutionId}", executionId);
                    }
                }

                // Execute action
                var context = new WorkflowActionContext(
                    WorkflowId: workflow.Id,
                    ExecutionId: execution.Id,
                    StepId: step.Id,
                    ActionType: step.ActionType.ToString(),
                    ActionConfiguration: step.ActionConfiguration ?? "{}",
                    EntityId: execution.EntityId,
                    EntityType: execution.EntityType,
                    TriggerData: triggerData
                );

                var result = await handler.ExecuteAsync(context, cancellationToken);

                if (!result.IsSuccess)
                {
                    _logger.LogError(
                        "Step {StepId} execution failed: {Error}",
                        step.Id, result.Error?.Description);

                    if (!step.ContinueOnError)
                    {
                        execution.Fail(result.Error?.Description ?? "Step execution failed");
                        await _executionRepository.UpdateAsync(execution, cancellationToken);
                        await _executionRepository.SaveChangesAsync(cancellationToken);
                        return result;
                    }
                }
                else
                {
                    _logger.LogInformation(
                        "Step {StepId} executed successfully",
                        step.Id);
                }
            }

            execution.Complete();
            await _executionRepository.UpdateAsync(execution, cancellationToken);
            await _executionRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Workflow execution {ExecutionId} completed successfully",
                executionId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error processing workflow execution {ExecutionId}",
                executionId);

            try
            {
                var execution = await _executionRepository.GetByIdAsync(executionId, cancellationToken);
                if (execution != null)
                {
                    execution.Fail(ex.Message);
                    await _executionRepository.UpdateAsync(execution, cancellationToken);
                    await _executionRepository.SaveChangesAsync(cancellationToken);
                }
            }
            catch (Exception updateEx)
            {
                _logger.LogError(updateEx, "Failed to update execution status after error");
            }

            return Result.Failure(
                Error.Failure("WorkflowExecution", $"Failed to process workflow execution: {ex.Message}"));
        }
    }
}
