namespace Stocker.Domain.Master.Enums;

public enum SubscriptionStatus
{
    Pending = -1,   // Waiting for payment
    Trial = 0,
    Active = 1,
    PastDue = 2,
    Suspended = 3,
    Cancelled = 4,
    Expired = 5
}