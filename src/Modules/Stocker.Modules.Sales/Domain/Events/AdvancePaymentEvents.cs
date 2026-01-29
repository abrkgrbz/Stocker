using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region AdvancePayment Events

/// <summary>
/// Avans ödemesi alındığında tetiklenen event
/// </summary>
public sealed record AdvancePaymentReceivedDomainEvent(
    Guid AdvancePaymentId,
    Guid TenantId,
    string PaymentNumber,
    Guid? CustomerId,
    string CustomerName,
    decimal Amount,
    string Currency,
    Guid? SalesOrderId) : DomainEvent;

/// <summary>
/// Avans ödemesi faturaya uygulandığında tetiklenen event
/// </summary>
public sealed record AdvancePaymentAppliedDomainEvent(
    Guid AdvancePaymentId,
    Guid TenantId,
    string PaymentNumber,
    Guid InvoiceId,
    string InvoiceNumber,
    decimal AppliedAmount,
    decimal RemainingBalance) : DomainEvent;

/// <summary>
/// Avans bakiyesi iade edildiğinde tetiklenen event
/// </summary>
public sealed record AdvancePaymentRefundedDomainEvent(
    Guid AdvancePaymentId,
    Guid TenantId,
    string PaymentNumber,
    Guid? CustomerId,
    decimal RefundAmount,
    string RefundReason,
    DateTime RefundedAt) : DomainEvent;

#endregion
