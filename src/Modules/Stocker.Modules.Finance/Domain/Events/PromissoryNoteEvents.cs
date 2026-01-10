using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region PromissoryNote Events

/// <summary>
/// Senet oluşturulduğunda tetiklenen event
/// </summary>
public sealed record PromissoryNoteCreatedDomainEvent(
    int PromissoryNoteId,
    Guid TenantId,
    string NoteNumber,
    string NoteType,
    decimal Amount,
    string Currency,
    DateTime DueDate,
    string DebtorName) : DomainEvent;

/// <summary>
/// Senet tahsil edildiğinde tetiklenen event
/// </summary>
public sealed record PromissoryNoteCollectedDomainEvent(
    int PromissoryNoteId,
    Guid TenantId,
    string NoteNumber,
    decimal Amount,
    DateTime CollectedAt) : DomainEvent;

/// <summary>
/// Senet protesto edildiğinde tetiklenen event
/// </summary>
public sealed record PromissoryNoteProtestedDomainEvent(
    int PromissoryNoteId,
    Guid TenantId,
    string NoteNumber,
    string DebtorName,
    decimal Amount,
    string ProtestReason,
    DateTime ProtestedAt) : DomainEvent;

/// <summary>
/// Senet ciro edildiğinde tetiklenen event
/// </summary>
public sealed record PromissoryNoteEndorsedDomainEvent(
    int PromissoryNoteId,
    Guid TenantId,
    string NoteNumber,
    string EndorsedTo,
    DateTime EndorsedAt) : DomainEvent;

#endregion
