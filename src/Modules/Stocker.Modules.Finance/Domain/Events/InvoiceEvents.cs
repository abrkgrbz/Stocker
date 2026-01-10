using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

/// <summary>
/// Fatura oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record InvoiceCreatedDomainEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Guid TenantId,
    int CurrentAccountId,
    decimal TotalAmount,
    string Currency) : DomainEvent;

/// <summary>
/// Fatura onaylandığında tetiklenen event.
/// </summary>
public sealed record InvoiceApprovedDomainEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Guid TenantId,
    string ApprovedBy) : DomainEvent;

/// <summary>
/// Fatura iptal edildiğinde tetiklenen event.
/// </summary>
public sealed record InvoiceCancelledDomainEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Guid TenantId,
    string CancellationReason,
    string CancelledBy) : DomainEvent;

/// <summary>
/// Fatura GİB'e gönderildiğinde tetiklenen event.
/// </summary>
public sealed record InvoiceSentToGibDomainEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Guid TenantId,
    string GibEnvelopeId,
    DateTime SentAt) : DomainEvent;

/// <summary>
/// Fatura GİB tarafından kabul edildiğinde tetiklenen event.
/// </summary>
public sealed record InvoiceAcceptedByGibDomainEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Guid TenantId,
    string GibResponseCode,
    DateTime AcceptedAt) : DomainEvent;

/// <summary>
/// Fatura GİB tarafından reddedildiğinde tetiklenen event.
/// </summary>
public sealed record InvoiceRejectedByGibDomainEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Guid TenantId,
    string RejectionCode,
    string RejectionReason,
    DateTime RejectedAt) : DomainEvent;

/// <summary>
/// Fatura ödendiğinde tetiklenen event.
/// </summary>
public sealed record InvoicePaidDomainEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Guid TenantId,
    Guid PaymentId,
    decimal PaidAmount,
    decimal RemainingAmount) : DomainEvent;

/// <summary>
/// Fatura kısmen ödendiğinde tetiklenen event.
/// </summary>
public sealed record InvoicePartiallyPaidDomainEvent(
    Guid InvoiceId,
    string InvoiceNumber,
    Guid TenantId,
    Guid PaymentId,
    decimal PaidAmount,
    decimal TotalPaidAmount,
    decimal RemainingAmount) : DomainEvent;
