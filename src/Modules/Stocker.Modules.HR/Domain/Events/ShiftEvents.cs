using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Shift Events

/// <summary>
/// Raised when a shift is created
/// </summary>
public sealed record ShiftCreatedDomainEvent(
    int ShiftId,
    Guid TenantId,
    string Name,
    TimeSpan StartTime,
    TimeSpan EndTime,
    decimal WorkHours) : DomainEvent;

/// <summary>
/// Raised when a shift is updated
/// </summary>
public sealed record ShiftUpdatedDomainEvent(
    int ShiftId,
    Guid TenantId,
    string Name,
    TimeSpan StartTime,
    TimeSpan EndTime) : DomainEvent;

/// <summary>
/// Raised when an employee is assigned to a shift
/// </summary>
public sealed record EmployeeAssignedToShiftDomainEvent(
    int ShiftId,
    Guid TenantId,
    string ShiftName,
    int EmployeeId,
    string EmployeeName,
    DateTime EffectiveDate) : DomainEvent;

/// <summary>
/// Raised when an employee's shift is changed
/// </summary>
public sealed record EmployeeShiftChangedDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    int OldShiftId,
    string OldShiftName,
    int NewShiftId,
    string NewShiftName,
    DateTime EffectiveDate) : DomainEvent;

/// <summary>
/// Raised when a shift is deactivated
/// </summary>
public sealed record ShiftDeactivatedDomainEvent(
    int ShiftId,
    Guid TenantId,
    string Name,
    int AffectedEmployeeCount) : DomainEvent;

#endregion
