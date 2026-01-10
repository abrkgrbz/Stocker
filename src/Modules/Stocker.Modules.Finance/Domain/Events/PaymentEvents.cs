using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

/// <summary>
/// Ödeme oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record PaymentCreatedDomainEvent(
    int PaymentId,
    Guid TenantId,
    string PaymentNumber,
    DateTime PaymentDate,
    string PaymentType,
    string Direction,
    int CurrentAccountId,
    decimal Amount,
    string Currency) : DomainEvent;

/// <summary>
/// Ödeme onaylandığında tetiklenen event.
/// </summary>
public sealed record PaymentApprovedDomainEvent(
    int PaymentId,
    Guid TenantId,
    string PaymentNumber,
    int ApprovedByUserId,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Ödeme iptal edildiğinde tetiklenen event.
/// </summary>
public sealed record PaymentCancelledDomainEvent(
    int PaymentId,
    Guid TenantId,
    string PaymentNumber,
    string CancelledBy,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

/// <summary>
/// Ödeme faturaya eşleştirildiğinde tetiklenen event.
/// </summary>
public sealed record PaymentAllocatedToInvoiceDomainEvent(
    int PaymentId,
    Guid TenantId,
    string PaymentNumber,
    int InvoiceId,
    string InvoiceNumber,
    decimal AllocatedAmount,
    string Currency,
    DateTime AllocatedAt) : DomainEvent;

/// <summary>
/// Ödeme iade edildiğinde tetiklenen event.
/// </summary>
public sealed record PaymentRefundedDomainEvent(
    int PaymentId,
    Guid TenantId,
    string PaymentNumber,
    string RefundedBy,
    decimal RefundAmount,
    string Currency,
    string RefundReason,
    DateTime RefundedAt) : DomainEvent;
