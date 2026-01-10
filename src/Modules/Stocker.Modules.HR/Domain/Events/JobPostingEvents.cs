using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region JobPosting Events

/// <summary>
/// Raised when a job posting is created
/// </summary>
public sealed record JobPostingCreatedDomainEvent(
    int JobPostingId,
    Guid TenantId,
    string Title,
    int PositionId,
    int DepartmentId,
    DateTime OpenDate,
    DateTime? CloseDate) : DomainEvent;

/// <summary>
/// Raised when a job posting is published
/// </summary>
public sealed record JobPostingPublishedDomainEvent(
    int JobPostingId,
    Guid TenantId,
    string Title,
    DateTime PublishDate) : DomainEvent;

/// <summary>
/// Raised when a job posting is closed
/// </summary>
public sealed record JobPostingClosedDomainEvent(
    int JobPostingId,
    Guid TenantId,
    string Title,
    int ApplicationCount,
    string CloseReason) : DomainEvent;

/// <summary>
/// Raised when a job posting is extended
/// </summary>
public sealed record JobPostingExtendedDomainEvent(
    int JobPostingId,
    Guid TenantId,
    string Title,
    DateTime OldCloseDate,
    DateTime NewCloseDate) : DomainEvent;

/// <summary>
/// Raised when a job posting is filled
/// </summary>
public sealed record JobPostingFilledDomainEvent(
    int JobPostingId,
    Guid TenantId,
    string Title,
    int HiredCandidateId,
    string HiredCandidateName) : DomainEvent;

#endregion
