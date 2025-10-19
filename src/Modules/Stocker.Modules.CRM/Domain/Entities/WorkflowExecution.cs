using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a single execution instance of a workflow
/// </summary>
public class WorkflowExecution : BaseEntity
{
    public int WorkflowId { get; private set; }
    public Guid TenantId { get; private set; }
    public int EntityId { get; private set; }
    public string EntityType { get; private set; } = string.Empty;
    public WorkflowExecutionStatus Status { get; private set; }
    public DateTime StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public Guid? TriggeredBy { get; private set; } // User who triggered (for manual workflows)
    public string TriggerData { get; private set; } = string.Empty; // JSON snapshot of trigger data
    public string ErrorMessage { get; private set; } = string.Empty;
    public int CurrentStepOrder { get; private set; }
    public int TotalSteps { get; private set; }
    public int CompletedSteps { get; private set; }
    public int FailedSteps { get; private set; }

    // Navigation property
    public Workflow Workflow { get; private set; } = null!;

    private readonly List<WorkflowStepExecution> _stepExecutions = new();
    public IReadOnlyCollection<WorkflowStepExecution> StepExecutions => _stepExecutions.AsReadOnly();

    // EF Core constructor
    private WorkflowExecution() { }

    private WorkflowExecution(
        int workflowId,
        Guid tenantId,
        int entityId,
        string entityType,
        int totalSteps,
        Guid? triggeredBy,
        string triggerData)
    {
        WorkflowId = workflowId;
        TenantId = tenantId;
        EntityId = entityId;
        EntityType = entityType;
        TotalSteps = totalSteps;
        TriggeredBy = triggeredBy;
        TriggerData = triggerData;
        Status = WorkflowExecutionStatus.Pending;
        StartedAt = DateTime.UtcNow;
        CurrentStepOrder = 0;
        CompletedSteps = 0;
        FailedSteps = 0;
    }

    public static Result<WorkflowExecution> Create(
        int workflowId,
        Guid tenantId,
        int entityId,
        string entityType,
        int totalSteps,
        Guid? triggeredBy,
        string triggerData)
    {
        if (workflowId <= 0)
            return Result<WorkflowExecution>.Failure(Error.Validation("WorkflowExecution", "Valid workflow ID is required"));

        if (tenantId == Guid.Empty)
            return Result<WorkflowExecution>.Failure(Error.Validation("WorkflowExecution", "Tenant ID is required"));

        if (entityId <= 0)
            return Result<WorkflowExecution>.Failure(Error.Validation("WorkflowExecution", "Valid entity ID is required"));

        if (string.IsNullOrWhiteSpace(entityType))
            return Result<WorkflowExecution>.Failure(Error.Validation("WorkflowExecution", "Entity type is required"));

        if (totalSteps <= 0)
            return Result<WorkflowExecution>.Failure(Error.Validation("WorkflowExecution", "Total steps must be greater than zero"));

        var execution = new WorkflowExecution(workflowId, tenantId, entityId, entityType, totalSteps, triggeredBy, triggerData);
        return Result<WorkflowExecution>.Success(execution);
    }

    public Result Start()
    {
        if (Status != WorkflowExecutionStatus.Pending)
            return Result.Failure(Error.Validation("WorkflowExecution", "Execution can only be started from Pending status"));

        Status = WorkflowExecutionStatus.Running;
        return Result.Success();
    }

    public Result Complete()
    {
        if (Status == WorkflowExecutionStatus.Completed)
            return Result.Failure(Error.Validation("WorkflowExecution", "Execution is already completed"));

        Status = WorkflowExecutionStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Fail(string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(errorMessage))
            return Result.Failure(Error.Validation("WorkflowExecution", "Error message is required"));

        Status = WorkflowExecutionStatus.Failed;
        ErrorMessage = errorMessage;
        CompletedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Cancel()
    {
        if (Status == WorkflowExecutionStatus.Completed || Status == WorkflowExecutionStatus.Failed)
            return Result.Failure(Error.Validation("WorkflowExecution", "Cannot cancel completed or failed execution"));

        Status = WorkflowExecutionStatus.Cancelled;
        CompletedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetWaiting()
    {
        if (Status != WorkflowExecutionStatus.Running)
            return Result.Failure(Error.Validation("WorkflowExecution", "Can only set to waiting from running status"));

        Status = WorkflowExecutionStatus.Waiting;
        return Result.Success();
    }

    public Result Timeout()
    {
        Status = WorkflowExecutionStatus.TimedOut;
        CompletedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public void UpdateProgress(int currentStepOrder, int completedSteps, int failedSteps)
    {
        CurrentStepOrder = currentStepOrder;
        CompletedSteps = completedSteps;
        FailedSteps = failedSteps;
    }

    public void AddStepExecution(WorkflowStepExecution stepExecution)
    {
        _stepExecutions.Add(stepExecution);
    }

    public TimeSpan GetDuration()
    {
        var endTime = CompletedAt ?? DateTime.UtcNow;
        return endTime - StartedAt;
    }

    public int GetSuccessRate()
    {
        if (TotalSteps == 0) return 0;
        return (CompletedSteps * 100) / TotalSteps;
    }
}
