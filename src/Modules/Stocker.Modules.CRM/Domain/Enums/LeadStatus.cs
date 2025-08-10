namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Represents the status of a lead
/// </summary>
public enum LeadStatus
{
    /// <summary>
    /// New lead, not yet contacted
    /// </summary>
    New = 0,

    /// <summary>
    /// Lead has been contacted
    /// </summary>
    Contacted = 1,

    /// <summary>
    /// Lead is being worked on
    /// </summary>
    Working = 2,

    /// <summary>
    /// Lead has been qualified as a potential customer
    /// </summary>
    Qualified = 3,

    /// <summary>
    /// Lead was not qualified
    /// </summary>
    Unqualified = 4,

    /// <summary>
    /// Lead has been converted to a customer
    /// </summary>
    Converted = 5,

    /// <summary>
    /// Lead is lost/dead
    /// </summary>
    Lost = 6
}