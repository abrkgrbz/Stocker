namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Type of action that a workflow can execute
/// </summary>
public enum WorkflowActionType
{
    /// <summary>
    /// Send email notification
    /// </summary>
    SendEmail = 1,

    /// <summary>
    /// Send SMS notification
    /// </summary>
    SendSMS = 2,

    /// <summary>
    /// Create a task
    /// </summary>
    CreateTask = 3,

    /// <summary>
    /// Update entity field
    /// </summary>
    UpdateField = 4,

    /// <summary>
    /// Assign to user/team
    /// </summary>
    AssignToUser = 5,

    /// <summary>
    /// Change entity status
    /// </summary>
    ChangeStatus = 6,

    /// <summary>
    /// Send webhook/API call
    /// </summary>
    WebhookCall = 7,

    /// <summary>
    /// Create activity log entry
    /// </summary>
    LogActivity = 8,

    /// <summary>
    /// Wait for duration
    /// </summary>
    WaitDelay = 9,

    /// <summary>
    /// Execute custom script/function
    /// </summary>
    CustomScript = 10,

    /// <summary>
    /// Send in-app notification
    /// </summary>
    SendNotification = 11,

    /// <summary>
    /// Update deal stage
    /// </summary>
    UpdateDealStage = 12
}
