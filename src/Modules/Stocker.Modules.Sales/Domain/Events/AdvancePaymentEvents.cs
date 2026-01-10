using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region AdvancePayment Events

/// <summary>
/// Avans ödemesi alındığında tetiklenen event
/// </summary>
public sealed record AdvancePaymentReceivedDomainEvent(
    int AdvancePaymentId,
    Guid TenantId,
    string PaymentNumber,
    int CustomerId,
    string CustomerName,
    decimal Amount,
    string Currency,
    int? SalesOrderId) : DomainEvent;

/// <summary>
/// Avans ödemesi faturaya uygulandığında tetiklenen event
/// </summary>
public sealed record AdvancePaymentAppliedDomainEvent(
    int AdvancePaymentId,
    Guid TenantId,
    string PaymentNumber,
    int InvoiceId,
    string InvoiceNumber,
    decimal AppliedAmount,
    decimal RemainingBalance) : DomainEvent;

/// <summary>
/// Avans bakiyesi iade edildiğinde tetiklenen event
/// </summary>
public sealed record AdvancePaymentRefundedDomainEvent(
    int AdvancePaymentId,
    Guid TenantId,
    string PaymentNumber,
    int CustomerId,
    decimal RefundAmount,
    string RefundReason,
    DateTime RefundedAt) : DomainEvent;

#endregion
