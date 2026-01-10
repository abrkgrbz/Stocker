using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Note Events

/// <summary>
/// Raised when a new note is created
/// </summary>
public sealed record NoteCreatedDomainEvent(
    Guid NoteId,
    Guid TenantId,
    string Title,
    string RelatedEntityType,
    Guid RelatedEntityId,
    bool IsPrivate,
    int CreatedById) : DomainEvent;

/// <summary>
/// Raised when a note is updated
/// </summary>
public sealed record NoteUpdatedDomainEvent(
    Guid NoteId,
    Guid TenantId,
    string Title,
    string RelatedEntityType,
    Guid RelatedEntityId,
    int UpdatedById) : DomainEvent;

/// <summary>
/// Raised when a note is deleted
/// </summary>
public sealed record NoteDeletedDomainEvent(
    Guid NoteId,
    Guid TenantId,
    string Title,
    string RelatedEntityType,
    Guid RelatedEntityId,
    int DeletedById) : DomainEvent;

/// <summary>
/// Raised when a note is pinned
/// </summary>
public sealed record NotePinnedDomainEvent(
    Guid NoteId,
    Guid TenantId,
    string Title,
    string RelatedEntityType,
    Guid RelatedEntityId,
    int PinnedById) : DomainEvent;

/// <summary>
/// Raised when a user is mentioned in a note
/// </summary>
public sealed record NoteUserMentionedDomainEvent(
    Guid NoteId,
    Guid TenantId,
    string Title,
    string RelatedEntityType,
    Guid RelatedEntityId,
    int MentionedUserId,
    int MentionedById) : DomainEvent;

#endregion
