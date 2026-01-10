using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Email Events

/// <summary>
/// Raised when an email is sent
/// </summary>
public sealed record EmailSentDomainEvent(
    Guid EmailId,
    Guid TenantId,
    string Subject,
    string ToAddress,
    string? RelatedEntityType,
    Guid? RelatedEntityId,
    int SentById) : DomainEvent;

/// <summary>
/// Raised when an email is received
/// </summary>
public sealed record EmailReceivedDomainEvent(
    Guid EmailId,
    Guid TenantId,
    string Subject,
    string FromAddress,
    string? RelatedEntityType,
    Guid? RelatedEntityId) : DomainEvent;

/// <summary>
/// Raised when an email is opened
/// </summary>
public sealed record EmailOpenedDomainEvent(
    Guid EmailId,
    Guid TenantId,
    string Subject,
    string ToAddress,
    DateTime OpenedAt,
    int SentById) : DomainEvent;

/// <summary>
/// Raised when an email link is clicked
/// </summary>
public sealed record EmailLinkClickedDomainEvent(
    Guid EmailId,
    Guid TenantId,
    string Subject,
    string ToAddress,
    string ClickedLink,
    DateTime ClickedAt,
    int SentById) : DomainEvent;

/// <summary>
/// Raised when an email bounces
/// </summary>
public sealed record EmailBouncedDomainEvent(
    Guid EmailId,
    Guid TenantId,
    string Subject,
    string ToAddress,
    string BounceType,
    string BounceReason,
    int SentById) : DomainEvent;

/// <summary>
/// Raised when an email is scheduled
/// </summary>
public sealed record EmailScheduledDomainEvent(
    Guid EmailId,
    Guid TenantId,
    string Subject,
    string ToAddress,
    DateTime ScheduledSendTime,
    int ScheduledById) : DomainEvent;

/// <summary>
/// Raised when recipient unsubscribes
/// </summary>
public sealed record EmailUnsubscribedDomainEvent(
    Guid EmailId,
    Guid TenantId,
    string EmailAddress,
    Guid? ContactId,
    DateTime UnsubscribedAt) : DomainEvent;

#endregion
