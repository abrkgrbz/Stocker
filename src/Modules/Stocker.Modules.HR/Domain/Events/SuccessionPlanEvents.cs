using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region SuccessionPlan Events

/// <summary>
/// Raised when a succession plan is created
/// </summary>
public sealed record SuccessionPlanCreatedDomainEvent(
    int SuccessionPlanId,
    Guid TenantId,
    int PositionId,
    string PositionTitle,
    int CurrentIncumbentId,
    string CurrentIncumbentName) : DomainEvent;

/// <summary>
/// Raised when a successor is identified
/// </summary>
public sealed record SuccessorIdentifiedDomainEvent(
    int SuccessionPlanId,
    Guid TenantId,
    string PositionTitle,
    int SuccessorId,
    string SuccessorName,
    string ReadinessLevel) : DomainEvent;

/// <summary>
/// Raised when successor readiness is updated
/// </summary>
public sealed record SuccessorReadinessUpdatedDomainEvent(
    int SuccessionPlanId,
    Guid TenantId,
    int SuccessorId,
    string SuccessorName,
    string OldReadiness,
    string NewReadiness) : DomainEvent;

/// <summary>
/// Raised when a succession plan is activated
/// </summary>
public sealed record SuccessionPlanActivatedDomainEvent(
    int SuccessionPlanId,
    Guid TenantId,
    string PositionTitle,
    int SuccessorId,
    string SuccessorName,
    DateTime EffectiveDate) : DomainEvent;

/// <summary>
/// Raised when a succession plan is closed
/// </summary>
public sealed record SuccessionPlanClosedDomainEvent(
    int SuccessionPlanId,
    Guid TenantId,
    string PositionTitle,
    string CloseReason) : DomainEvent;

#endregion
