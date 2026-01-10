using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region CreditNote Events

/// <summary>
/// Alacak dekontu oluşturulduğunda tetiklenen event
/// </summary>
public sealed record CreditNoteCreatedDomainEvent(
    int CreditNoteId,
    Guid TenantId,
    string CreditNoteNumber,
    int CustomerId,
    string CustomerName,
    decimal Amount,
    string Currency,
    string Reason) : DomainEvent;

/// <summary>
/// Alacak dekontu onaylandığında tetiklenen event
/// </summary>
public sealed record CreditNoteApprovedDomainEvent(
    int CreditNoteId,
    Guid TenantId,
    string CreditNoteNumber,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Alacak dekontu uygulandığında tetiklenen event
/// </summary>
public sealed record CreditNoteAppliedDomainEvent(
    int CreditNoteId,
    Guid TenantId,
    string CreditNoteNumber,
    int CustomerId,
    decimal Amount,
    DateTime AppliedAt) : DomainEvent;

/// <summary>
/// Alacak dekontu iptal edildiğinde tetiklenen event
/// </summary>
public sealed record CreditNoteCancelledDomainEvent(
    int CreditNoteId,
    Guid TenantId,
    string CreditNoteNumber,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

#endregion
