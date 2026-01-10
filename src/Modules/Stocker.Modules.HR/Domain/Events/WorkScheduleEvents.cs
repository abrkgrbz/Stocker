using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region WorkSchedule Events

/// <summary>
/// Raised when a work schedule is created
/// </summary>
public sealed record WorkScheduleCreatedDomainEvent(
    int WorkScheduleId,
    Guid TenantId,
    string Name,
    decimal WeeklyHours,
    int WorkDays) : DomainEvent;

/// <summary>
/// Raised when a work schedule is updated
/// </summary>
public sealed record WorkScheduleUpdatedDomainEvent(
    int WorkScheduleId,
    Guid TenantId,
    string Name,
    decimal WeeklyHours) : DomainEvent;

/// <summary>
/// Raised when an employee is assigned to a work schedule
/// </summary>
public sealed record EmployeeAssignedToWorkScheduleDomainEvent(
    int WorkScheduleId,
    Guid TenantId,
    string ScheduleName,
    int EmployeeId,
    string EmployeeName,
    DateTime EffectiveDate) : DomainEvent;

/// <summary>
/// Raised when a work schedule is set as default
/// </summary>
public sealed record WorkScheduleSetAsDefaultDomainEvent(
    int WorkScheduleId,
    Guid TenantId,
    string Name) : DomainEvent;

/// <summary>
/// Raised when a work schedule is deactivated
/// </summary>
public sealed record WorkScheduleDeactivatedDomainEvent(
    int WorkScheduleId,
    Guid TenantId,
    string Name,
    int AffectedEmployeeCount) : DomainEvent;

#endregion
