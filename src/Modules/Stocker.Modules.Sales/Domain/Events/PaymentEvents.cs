using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Payment Events

/// <summary>
/// Müşteri ödemesi alındığında tetiklenen event
/// </summary>
public sealed record CustomerPaymentReceivedDomainEvent(
    Guid PaymentId,
    Guid TenantId,
    string PaymentNumber,
    Guid? CustomerId,
    string CustomerName,
    decimal Amount,
    string Currency,
    string PaymentMethod,
    DateTime ReceivedAt) : DomainEvent;

/// <summary>
/// Müşteri ödemesi onaylandığında tetiklenen event
/// </summary>
public sealed record CustomerPaymentConfirmedDomainEvent(
    Guid PaymentId,
    Guid TenantId,
    string PaymentNumber,
    decimal Amount,
    Guid? ConfirmedById,
    DateTime ConfirmedAt) : DomainEvent;

/// <summary>
/// Müşteri ödemesi faturaya eşleştirildiğinde tetiklenen event
/// </summary>
public sealed record CustomerPaymentAllocatedDomainEvent(
    Guid PaymentId,
    Guid TenantId,
    string PaymentNumber,
    Guid InvoiceId,
    string InvoiceNumber,
    decimal AllocatedAmount) : DomainEvent;

/// <summary>
/// Müşteri ödemesi iade edildiğinde tetiklenen event
/// </summary>
public sealed record CustomerPaymentRefundedDomainEvent(
    Guid PaymentId,
    Guid TenantId,
    string PaymentNumber,
    decimal RefundAmount,
    string RefundReason,
    DateTime RefundedAt) : DomainEvent;

/// <summary>
/// Müşteri ödemesi başarısız olduğunda tetiklenen event
/// </summary>
public sealed record CustomerPaymentFailedDomainEvent(
    Guid PaymentId,
    Guid TenantId,
    string PaymentNumber,
    Guid? CustomerId,
    decimal Amount,
    string FailureReason,
    DateTime FailedAt) : DomainEvent;

#endregion
