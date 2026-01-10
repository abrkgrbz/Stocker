using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

/// <summary>
/// Fatura oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record InvoiceCreatedDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    DateTime InvoiceDate,
    string InvoiceType,
    int CurrentAccountId,
    decimal TotalAmount,
    string Currency) : DomainEvent;

/// <summary>
/// Fatura onaylandığında tetiklenen event.
/// </summary>
public sealed record InvoiceApprovedDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    int ApprovedByUserId,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Fatura iptal edildiğinde tetiklenen event.
/// </summary>
public sealed record InvoiceCancelledDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    string CancelledBy,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

/// <summary>
/// Fatura GİB'e gönderildiğinde tetiklenen event.
/// </summary>
public sealed record InvoiceSentToGibDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    Guid GibUuid,
    string GibEnvelopeId,
    string ReceiverAlias,
    DateTime SentAt) : DomainEvent;

/// <summary>
/// Fatura GİB tarafından kabul edildiğinde tetiklenen event.
/// </summary>
public sealed record InvoiceAcceptedByGibDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    Guid GibUuid,
    string StatusCode,
    string StatusDescription,
    DateTime AcceptedAt) : DomainEvent;

/// <summary>
/// Fatura GİB tarafından reddedildiğinde tetiklenen event.
/// </summary>
public sealed record InvoiceRejectedByGibDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    Guid GibUuid,
    string RejectionCode,
    string RejectionReason,
    DateTime RejectedAt) : DomainEvent;

/// <summary>
/// Fatura ödendiğinde tetiklenen event.
/// </summary>
public sealed record InvoicePaidDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    int PaymentId,
    int CurrentAccountId,
    decimal PaidAmount,
    decimal RemainingAmount,
    string Currency) : DomainEvent;

/// <summary>
/// Fatura kısmen ödendiğinde tetiklenen event.
/// </summary>
public sealed record InvoicePartiallyPaidDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    int PaymentId,
    int CurrentAccountId,
    decimal PaidAmount,
    decimal TotalPaidAmount,
    decimal RemainingAmount,
    string Currency) : DomainEvent;
