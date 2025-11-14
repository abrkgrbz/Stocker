namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Type of reminder
/// </summary>
public enum ReminderType
{
    /// <summary>
    /// General reminder
    /// </summary>
    General = 0,

    /// <summary>
    /// Task deadline reminder
    /// </summary>
    Task = 1,

    /// <summary>
    /// Meeting reminder
    /// </summary>
    Meeting = 2,

    /// <summary>
    /// Follow-up reminder for deals
    /// </summary>
    FollowUp = 3,

    /// <summary>
    /// Customer birthday
    /// </summary>
    Birthday = 4,

    /// <summary>
    /// Contract renewal reminder
    /// </summary>
    ContractRenewal = 5,

    /// <summary>
    /// Payment due reminder
    /// </summary>
    PaymentDue = 6
}
