using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents an automated workflow definition in the CRM system
/// </summary>
public class Workflow : BaseEntity
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public WorkflowTriggerType TriggerType { get; private set; }
    public string EntityType { get; private set; } = string.Empty; // "Customer", "Deal", "Task", etc.
    public string TriggerConditions { get; private set; } = string.Empty; // JSON
    public bool IsActive { get; private set; }
    public int ExecutionOrder { get; private set; }
    public Guid CreatedBy { get; private set; }
    public DateTime? LastExecutedAt { get; private set; }
    public int ExecutionCount { get; private set; }

    // Navigation properties
    private readonly List<WorkflowStep> _steps = new();
    public IReadOnlyCollection<WorkflowStep> Steps => _steps.AsReadOnly();

    private readonly List<WorkflowExecution> _executions = new();
    public IReadOnlyCollection<WorkflowExecution> Executions => _executions.AsReadOnly();

    // EF Core constructor
    private Workflow() { }

    private Workflow(
        string name,
        string description,
        WorkflowTriggerType triggerType,
        string entityType,
        string triggerConditions,
        Guid tenantId,
        Guid createdBy)
    {
        Name = name;
        Description = description;
        TriggerType = triggerType;
        EntityType = entityType;
        TriggerConditions = triggerConditions;
        TenantId = tenantId;
        CreatedBy = createdBy;
        IsActive = false;
        ExecutionOrder = 0;
        ExecutionCount = 0;
    }

    public static Result<Workflow> Create(
        string name,
        string description,
        WorkflowTriggerType triggerType,
        string entityType,
        string triggerConditions,
        Guid tenantId,
        Guid createdBy)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<Workflow>.Failure(Error.Validation("Workflow", "Name is required"));

        if (name.Length > 200)
            return Result<Workflow>.Failure(Error.Validation("Workflow", "Name cannot exceed 200 characters"));

        if (string.IsNullOrWhiteSpace(entityType))
            return Result<Workflow>.Failure(Error.Validation("Workflow", "Entity type is required"));

        if (tenantId == Guid.Empty)
            return Result<Workflow>.Failure(Error.Validation("Workflow", "Tenant ID is required"));

        if (createdBy == Guid.Empty)
            return Result<Workflow>.Failure(Error.Validation("Workflow", "Created by user ID is required"));

        var workflow = new Workflow(name, description, triggerType, entityType, triggerConditions, tenantId, createdBy);
        return Result<Workflow>.Success(workflow);
    }

    public Result Activate()
    {
        if (IsActive)
            return Result.Failure(Error.Validation("Workflow", "Workflow is already active"));

        if (_steps.Count == 0)
            return Result.Failure(Error.Validation("Workflow", "Cannot activate workflow without steps"));

        IsActive = true;
        return Result.Success();
    }

    public Result Deactivate()
    {
        if (!IsActive)
            return Result.Failure(Error.Validation("Workflow", "Workflow is already inactive"));

        IsActive = false;
        return Result.Success();
    }

    public Result UpdateDetails(string name, string description)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(Error.Validation("Workflow", "Name is required"));

        if (name.Length > 200)
            return Result.Failure(Error.Validation("Workflow", "Name cannot exceed 200 characters"));

        Name = name;
        Description = description;
        return Result.Success();
    }

    public Result UpdateTrigger(WorkflowTriggerType triggerType, string triggerConditions)
    {
        TriggerType = triggerType;
        TriggerConditions = triggerConditions ?? string.Empty;
        return Result.Success();
    }

    public Result SetExecutionOrder(int order)
    {
        if (order < 0)
            return Result.Failure(Error.Validation("Workflow", "Execution order cannot be negative"));

        ExecutionOrder = order;
        return Result.Success();
    }

    public void AddStep(WorkflowStep step)
    {
        _steps.Add(step);
    }

    public void RemoveStep(WorkflowStep step)
    {
        _steps.Remove(step);
    }

    public void RecordExecution()
    {
        LastExecutedAt = DateTime.UtcNow;
        ExecutionCount++;
    }
}
