using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.ActionHandlers;

/// <summary>
/// Interface for workflow action handlers
/// </summary>
public interface IWorkflowActionHandler
{
    /// <summary>
    /// Determines if this handler can process the given action type
    /// </summary>
    bool CanHandle(string actionType);

    /// <summary>
    /// Executes the workflow action
    /// </summary>
    /// <param name="context">Action execution context</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result indicating success or failure</returns>
    Task<Result<WorkflowActionResult>> ExecuteAsync(
        WorkflowActionContext context,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Context for executing workflow actions
/// </summary>
public record WorkflowActionContext(
    int WorkflowId,
    int ExecutionId,
    int StepId,
    string ActionType,
    string ActionConfiguration,
    string EntityId,
    string EntityType,
    Dictionary<string, object>? TriggerData = null
);

/// <summary>
/// Result of workflow action execution
/// </summary>
public record WorkflowActionResult(
    bool IsSuccess,
    string? ErrorMessage = null,
    Dictionary<string, object>? OutputData = null
)
{
    public static WorkflowActionResult Success(Dictionary<string, object>? outputData = null)
        => new(true, null, outputData);

    public static WorkflowActionResult Failure(string errorMessage)
        => new(false, errorMessage, null);
}
