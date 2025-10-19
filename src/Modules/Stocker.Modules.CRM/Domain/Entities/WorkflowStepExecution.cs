using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents the execution of a single workflow step
/// </summary>
public class WorkflowStepExecution : BaseEntity
{
    public int WorkflowExecutionId { get; private set; }
    public int WorkflowStepId { get; private set; }
    public string StepName { get; private set; } = string.Empty;
    public WorkflowActionType ActionType { get; private set; }
    public int StepOrder { get; private set; }
    public WorkflowExecutionStatus Status { get; private set; }
    public DateTime StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string InputData { get; private set; } = string.Empty; // JSON
    public string OutputData { get; private set; } = string.Empty; // JSON
    public string ErrorMessage { get; private set; } = string.Empty;
    public int RetryCount { get; private set; }

    // Navigation property
    public WorkflowExecution WorkflowExecution { get; private set; } = null!;
    public WorkflowStep WorkflowStep { get; private set; } = null!;

    // EF Core constructor
    private WorkflowStepExecution() { }

    private WorkflowStepExecution(
        int workflowExecutionId,
        int workflowStepId,
        string stepName,
        WorkflowActionType actionType,
        int stepOrder,
        string inputData)
    {
        WorkflowExecutionId = workflowExecutionId;
        WorkflowStepId = workflowStepId;
        StepName = stepName;
        ActionType = actionType;
        StepOrder = stepOrder;
        InputData = inputData;
        Status = WorkflowExecutionStatus.Pending;
        StartedAt = DateTime.UtcNow;
        RetryCount = 0;
    }

    public static Result<WorkflowStepExecution> Create(
        int workflowExecutionId,
        int workflowStepId,
        string stepName,
        WorkflowActionType actionType,
        int stepOrder,
        string inputData)
    {
        if (workflowExecutionId <= 0)
            return Result<WorkflowStepExecution>.Failure(Error.Validation("WorkflowStepExecution", "Valid workflow execution ID is required"));

        if (workflowStepId <= 0)
            return Result<WorkflowStepExecution>.Failure(Error.Validation("WorkflowStepExecution", "Valid workflow step ID is required"));

        if (string.IsNullOrWhiteSpace(stepName))
            return Result<WorkflowStepExecution>.Failure(Error.Validation("WorkflowStepExecution", "Step name is required"));

        var execution = new WorkflowStepExecution(workflowExecutionId, workflowStepId, stepName, actionType, stepOrder, inputData);
        return Result<WorkflowStepExecution>.Success(execution);
    }

    public Result Start()
    {
        if (Status != WorkflowExecutionStatus.Pending)
            return Result.Failure(Error.Validation("WorkflowStepExecution", "Step can only be started from Pending status"));

        Status = WorkflowExecutionStatus.Running;
        return Result.Success();
    }

    public Result Complete(string outputData)
    {
        if (Status == WorkflowExecutionStatus.Completed)
            return Result.Failure(Error.Validation("WorkflowStepExecution", "Step is already completed"));

        Status = WorkflowExecutionStatus.Completed;
        OutputData = outputData ?? string.Empty;
        CompletedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Fail(string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(errorMessage))
            return Result.Failure(Error.Validation("WorkflowStepExecution", "Error message is required"));

        Status = WorkflowExecutionStatus.Failed;
        ErrorMessage = errorMessage;
        CompletedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Retry()
    {
        if (Status != WorkflowExecutionStatus.Failed)
            return Result.Failure(Error.Validation("WorkflowStepExecution", "Can only retry failed steps"));

        if (RetryCount >= 3)
            return Result.Failure(Error.Validation("WorkflowStepExecution", "Maximum retry count exceeded"));

        Status = WorkflowExecutionStatus.Pending;
        ErrorMessage = string.Empty;
        RetryCount++;
        return Result.Success();
    }

    public TimeSpan GetDuration()
    {
        var endTime = CompletedAt ?? DateTime.UtcNow;
        return endTime - StartedAt;
    }
}
