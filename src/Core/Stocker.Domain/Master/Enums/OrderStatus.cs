namespace Stocker.Domain.Master.Enums;

/// <summary>
/// Status of a subscription order
/// </summary>
public enum OrderStatus
{
    /// <summary>
    /// Order created, waiting for payment initiation
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Payment is being processed
    /// </summary>
    PaymentProcessing = 1,

    /// <summary>
    /// Payment completed successfully
    /// </summary>
    PaymentCompleted = 2,

    /// <summary>
    /// Payment failed
    /// </summary>
    PaymentFailed = 3,

    /// <summary>
    /// Activating purchased features
    /// </summary>
    Activating = 4,

    /// <summary>
    /// Order completed, all features activated
    /// </summary>
    Completed = 5,

    /// <summary>
    /// Order was cancelled
    /// </summary>
    Cancelled = 6,

    /// <summary>
    /// Refund has been requested
    /// </summary>
    RefundRequested = 7,

    /// <summary>
    /// Order has been refunded
    /// </summary>
    Refunded = 8
}
