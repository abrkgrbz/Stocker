namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Represents the rating/temperature of a lead
/// </summary>
public enum LeadRating
{
    /// <summary>
    /// Lead has not been rated yet
    /// </summary>
    Unrated = 0,

    /// <summary>
    /// Hot lead - high interest and ready to buy
    /// </summary>
    Hot = 1,

    /// <summary>
    /// Warm lead - moderate interest
    /// </summary>
    Warm = 2,

    /// <summary>
    /// Cold lead - low interest
    /// </summary>
    Cold = 3
}