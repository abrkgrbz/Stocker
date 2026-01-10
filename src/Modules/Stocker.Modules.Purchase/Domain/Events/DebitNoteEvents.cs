using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region DebitNote Events

/// <summary>
/// Borç dekontu oluşturulduğunda tetiklenen event
/// </summary>
public sealed record DebitNoteCreatedDomainEvent(
    int DebitNoteId,
    Guid TenantId,
    string DebitNoteNumber,
    int SupplierId,
    string SupplierName,
    decimal Amount,
    string Currency,
    string Reason) : DomainEvent;

/// <summary>
/// Borç dekontu onaylandığında tetiklenen event
/// </summary>
public sealed record DebitNoteApprovedDomainEvent(
    int DebitNoteId,
    Guid TenantId,
    string DebitNoteNumber,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Borç dekontu uygulandığında tetiklenen event
/// </summary>
public sealed record DebitNoteAppliedDomainEvent(
    int DebitNoteId,
    Guid TenantId,
    string DebitNoteNumber,
    int SupplierId,
    decimal Amount,
    DateTime AppliedAt) : DomainEvent;

#endregion
