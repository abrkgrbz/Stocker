using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

/// <summary>
/// Ödeme oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record PaymentCreatedDomainEvent(
    Guid PaymentId,
    Guid TenantId,
    int CurrentAccountId,
    decimal Amount,
    string Currency,
    string PaymentType) : DomainEvent;

/// <summary>
/// Ödeme onaylandığında tetiklenen event.
/// </summary>
public sealed record PaymentApprovedDomainEvent(
    Guid PaymentId,
    Guid TenantId,
    string ApprovedBy,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Ödeme iptal edildiğinde tetiklenen event.
/// </summary>
public sealed record PaymentCancelledDomainEvent(
    Guid PaymentId,
    Guid TenantId,
    string CancellationReason,
    string CancelledBy) : DomainEvent;

/// <summary>
/// Ödeme faturaya eşleştirildiğinde tetiklenen event.
/// </summary>
public sealed record PaymentAllocatedToInvoiceDomainEvent(
    Guid PaymentId,
    Guid InvoiceId,
    Guid TenantId,
    decimal AllocatedAmount) : DomainEvent;

/// <summary>
/// Ödeme iade edildiğinde tetiklenen event.
/// </summary>
public sealed record PaymentRefundedDomainEvent(
    Guid PaymentId,
    Guid RefundPaymentId,
    Guid TenantId,
    decimal RefundAmount,
    string RefundReason) : DomainEvent;
