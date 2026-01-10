using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region LeaveType Events

/// <summary>
/// Raised when a leave type is created
/// </summary>
public sealed record LeaveTypeCreatedDomainEvent(
    int LeaveTypeId,
    Guid TenantId,
    string Code,
    string Name,
    decimal DefaultDays,
    bool IsPaid,
    bool RequiresApproval) : DomainEvent;

/// <summary>
/// Raised when a leave type is updated
/// </summary>
public sealed record LeaveTypeUpdatedDomainEvent(
    int LeaveTypeId,
    Guid TenantId,
    string Code,
    string Name,
    decimal DefaultDays) : DomainEvent;

/// <summary>
/// Raised when a leave type is activated
/// </summary>
public sealed record LeaveTypeActivatedDomainEvent(
    int LeaveTypeId,
    Guid TenantId,
    string Name) : DomainEvent;

/// <summary>
/// Raised when a leave type is deactivated
/// </summary>
public sealed record LeaveTypeDeactivatedDomainEvent(
    int LeaveTypeId,
    Guid TenantId,
    string Name) : DomainEvent;

#endregion
