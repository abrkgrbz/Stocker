using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Payment Events

/// <summary>
/// Müşteri ödemesi alındığında tetiklenen event
/// </summary>
public sealed record CustomerPaymentReceivedDomainEvent(
    int PaymentId,
    Guid TenantId,
    string PaymentNumber,
    int CustomerId,
    string CustomerName,
    decimal Amount,
    string Currency,
    string PaymentMethod,
    DateTime ReceivedAt) : DomainEvent;

/// <summary>
/// Müşteri ödemesi onaylandığında tetiklenen event
/// </summary>
public sealed record CustomerPaymentConfirmedDomainEvent(
    int PaymentId,
    Guid TenantId,
    string PaymentNumber,
    decimal Amount,
    int ConfirmedById,
    DateTime ConfirmedAt) : DomainEvent;

/// <summary>
/// Müşteri ödemesi faturaya eşleştirildiğinde tetiklenen event
/// </summary>
public sealed record CustomerPaymentAllocatedDomainEvent(
    int PaymentId,
    Guid TenantId,
    string PaymentNumber,
    int InvoiceId,
    string InvoiceNumber,
    decimal AllocatedAmount) : DomainEvent;

/// <summary>
/// Müşteri ödemesi iade edildiğinde tetiklenen event
/// </summary>
public sealed record CustomerPaymentRefundedDomainEvent(
    int PaymentId,
    Guid TenantId,
    string PaymentNumber,
    decimal RefundAmount,
    string RefundReason,
    DateTime RefundedAt) : DomainEvent;

/// <summary>
/// Müşteri ödemesi başarısız olduğunda tetiklenen event
/// </summary>
public sealed record CustomerPaymentFailedDomainEvent(
    int PaymentId,
    Guid TenantId,
    string PaymentNumber,
    int CustomerId,
    decimal Amount,
    string FailureReason,
    DateTime FailedAt) : DomainEvent;

#endregion
