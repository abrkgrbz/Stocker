using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Lead Events

/// <summary>
/// Raised when a new lead is created
/// </summary>
public sealed record LeadCreatedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    string FullName,
    string Email,
    string? Source,
    string Status) : DomainEvent;

/// <summary>
/// Raised when lead information is updated
/// </summary>
public sealed record LeadUpdatedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    string FullName,
    string Email) : DomainEvent;

/// <summary>
/// Raised when lead status changes
/// </summary>
public sealed record LeadStatusChangedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    string OldStatus,
    string NewStatus) : DomainEvent;

/// <summary>
/// Raised when lead rating changes
/// </summary>
public sealed record LeadRatingChangedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    string OldRating,
    string NewRating) : DomainEvent;

/// <summary>
/// Raised when a lead is assigned to a user
/// </summary>
public sealed record LeadAssignedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    int AssignedToUserId,
    string LeadName) : DomainEvent;

/// <summary>
/// Raised when a lead is converted to customer
/// </summary>
public sealed record LeadConvertedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    Guid CustomerId,
    string LeadName,
    DateTime ConvertedDate) : DomainEvent;

/// <summary>
/// Raised when lead score changes
/// </summary>
public sealed record LeadScoreChangedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    int OldScore,
    int NewScore) : DomainEvent;

/// <summary>
/// Raised when a lead is qualified
/// </summary>
public sealed record LeadQualifiedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    string LeadName,
    int Score) : DomainEvent;

/// <summary>
/// Raised when a lead is disqualified
/// </summary>
public sealed record LeadDisqualifiedDomainEvent(
    Guid LeadId,
    Guid TenantId,
    string LeadName,
    string? Reason) : DomainEvent;

#endregion
