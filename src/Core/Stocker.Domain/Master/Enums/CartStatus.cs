namespace Stocker.Domain.Master.Enums;

/// <summary>
/// Status of a subscription cart
/// </summary>
public enum CartStatus
{
    /// <summary>
    /// Cart is active and can be modified
    /// </summary>
    Active = 0,

    /// <summary>
    /// Checkout has been initiated, waiting for payment
    /// </summary>
    CheckoutPending = 1,

    /// <summary>
    /// Payment completed, features unlocked
    /// </summary>
    Completed = 2,

    /// <summary>
    /// Cart has expired (not checked out in time)
    /// </summary>
    Expired = 3,

    /// <summary>
    /// User abandoned the cart
    /// </summary>
    Abandoned = 4
}
