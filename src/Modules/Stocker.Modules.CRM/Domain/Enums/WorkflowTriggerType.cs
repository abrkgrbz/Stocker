namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Type of event that triggers a workflow
/// </summary>
public enum WorkflowTriggerType
{
    /// <summary>
    /// Manual execution by user
    /// </summary>
    Manual = 0,

    /// <summary>
    /// When an entity is created (Customer, Deal, etc.)
    /// </summary>
    EntityCreated = 1,

    /// <summary>
    /// When an entity is updated
    /// </summary>
    EntityUpdated = 2,

    /// <summary>
    /// When an entity status changes
    /// </summary>
    StatusChanged = 3,

    /// <summary>
    /// When a deal reaches specific stage
    /// </summary>
    DealStageChanged = 4,

    /// <summary>
    /// Time-based trigger (scheduled)
    /// </summary>
    Scheduled = 5,

    /// <summary>
    /// When a field value matches condition
    /// </summary>
    FieldCondition = 6,

    /// <summary>
    /// When deal amount exceeds threshold
    /// </summary>
    AmountThreshold = 7,

    /// <summary>
    /// When a due date approaches or passes
    /// </summary>
    DueDateEvent = 8
}
