using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region JournalEntry Events

/// <summary>
/// Yevmiye kaydı oluşturulduğunda tetiklenen event
/// </summary>
public sealed record JournalEntryCreatedDomainEvent(
    int JournalEntryId,
    Guid TenantId,
    string EntryNumber,
    DateTime EntryDate,
    string Description,
    decimal TotalDebit,
    decimal TotalCredit) : DomainEvent;

/// <summary>
/// Yevmiye kaydı onaylandığında tetiklenen event
/// </summary>
public sealed record JournalEntryApprovedDomainEvent(
    int JournalEntryId,
    Guid TenantId,
    string EntryNumber,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Yevmiye kaydı nakledildiğinde tetiklenen event
/// </summary>
public sealed record JournalEntryPostedDomainEvent(
    int JournalEntryId,
    Guid TenantId,
    string EntryNumber,
    DateTime PostedAt) : DomainEvent;

/// <summary>
/// Yevmiye kaydı iptal edildiğinde tetiklenen event
/// </summary>
public sealed record JournalEntryCancelledDomainEvent(
    int JournalEntryId,
    Guid TenantId,
    string EntryNumber,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

/// <summary>
/// Yevmiye kaydı tersine çevrildiğinde tetiklenen event
/// </summary>
public sealed record JournalEntryReversedDomainEvent(
    int JournalEntryId,
    Guid TenantId,
    string EntryNumber,
    int ReversalEntryId,
    string ReversalEntryNumber,
    DateTime ReversedAt) : DomainEvent;

#endregion
