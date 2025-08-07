namespace Stocker.Domain.Master.Enums;

public enum InvoiceStatus
{
    Draft = 0,
    Sent = 1,
    Paid = 2,
    PartiallyPaid = 3,
    Overdue = 4,
    Cancelled = 5,
    Refunded = 6
}