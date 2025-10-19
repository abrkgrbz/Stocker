using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a single step/action in a workflow
/// </summary>
public class WorkflowStep : BaseEntity
{
    public int WorkflowId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public WorkflowActionType ActionType { get; private set; }
    public int StepOrder { get; private set; }
    public string ActionConfiguration { get; private set; } = string.Empty; // JSON configuration
    public string Conditions { get; private set; } = string.Empty; // JSON conditions for conditional execution
    public int DelayMinutes { get; private set; } // Delay before executing this step
    public bool IsEnabled { get; private set; }
    public bool ContinueOnError { get; private set; }

    // Navigation property
    public Workflow Workflow { get; private set; } = null!;

    // EF Core constructor
    private WorkflowStep() { }

    private WorkflowStep(
        int workflowId,
        string name,
        string description,
        WorkflowActionType actionType,
        int stepOrder,
        string actionConfiguration,
        string conditions)
    {
        WorkflowId = workflowId;
        Name = name;
        Description = description;
        ActionType = actionType;
        StepOrder = stepOrder;
        ActionConfiguration = actionConfiguration;
        Conditions = conditions;
        DelayMinutes = 0;
        IsEnabled = true;
        ContinueOnError = false;
    }

    public static Result<WorkflowStep> Create(
        int workflowId,
        string name,
        string description,
        WorkflowActionType actionType,
        int stepOrder,
        string actionConfiguration,
        string conditions)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<WorkflowStep>.Failure(Error.Validation("WorkflowStep", "Name is required"));

        if (name.Length > 200)
            return Result<WorkflowStep>.Failure(Error.Validation("WorkflowStep", "Name cannot exceed 200 characters"));

        if (workflowId <= 0)
            return Result<WorkflowStep>.Failure(Error.Validation("WorkflowStep", "Valid workflow ID is required"));

        if (stepOrder < 0)
            return Result<WorkflowStep>.Failure(Error.Validation("WorkflowStep", "Step order cannot be negative"));

        var step = new WorkflowStep(workflowId, name, description, actionType, stepOrder, actionConfiguration, conditions);
        return Result<WorkflowStep>.Success(step);
    }

    public Result UpdateDetails(string name, string description)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(Error.Validation("WorkflowStep", "Name is required"));

        if (name.Length > 200)
            return Result.Failure(Error.Validation("WorkflowStep", "Name cannot exceed 200 characters"));

        Name = name;
        Description = description;
        return Result.Success();
    }

    public Result UpdateConfiguration(string actionConfiguration, string conditions)
    {
        ActionConfiguration = actionConfiguration ?? string.Empty;
        Conditions = conditions ?? string.Empty;
        return Result.Success();
    }

    public Result SetDelay(int delayMinutes)
    {
        if (delayMinutes < 0)
            return Result.Failure(Error.Validation("WorkflowStep", "Delay cannot be negative"));

        if (delayMinutes > 43200) // Max 30 days
            return Result.Failure(Error.Validation("WorkflowStep", "Delay cannot exceed 30 days (43200 minutes)"));

        DelayMinutes = delayMinutes;
        return Result.Success();
    }

    public Result SetStepOrder(int order)
    {
        if (order < 0)
            return Result.Failure(Error.Validation("WorkflowStep", "Step order cannot be negative"));

        StepOrder = order;
        return Result.Success();
    }

    public void Enable() => IsEnabled = true;
    public void Disable() => IsEnabled = false;

    public void SetContinueOnError(bool continueOnError)
    {
        ContinueOnError = continueOnError;
    }
}
