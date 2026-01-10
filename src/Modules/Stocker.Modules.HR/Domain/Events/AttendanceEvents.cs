using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Attendance Events

/// <summary>
/// Raised when an employee checks in
/// </summary>
public sealed record EmployeeCheckedInDomainEvent(
    int AttendanceId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    DateTime CheckInTime,
    string? Location) : DomainEvent;

/// <summary>
/// Raised when an employee checks out
/// </summary>
public sealed record EmployeeCheckedOutDomainEvent(
    int AttendanceId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    DateTime CheckOutTime,
    TimeSpan TotalHours,
    TimeSpan? OvertimeHours) : DomainEvent;

/// <summary>
/// Raised when employee is late
/// </summary>
public sealed record EmployeeLateArrivalDomainEvent(
    int AttendanceId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    DateTime ExpectedTime,
    DateTime ActualTime,
    TimeSpan LateBy,
    int ManagerId) : DomainEvent;

/// <summary>
/// Raised when employee is absent without leave
/// </summary>
public sealed record EmployeeAbsentDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    DateTime Date,
    int ManagerId) : DomainEvent;

/// <summary>
/// Raised when overtime is detected
/// </summary>
public sealed record OvertimeDetectedDomainEvent(
    int AttendanceId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    DateTime Date,
    TimeSpan OvertimeHours,
    int ManagerId) : DomainEvent;

#endregion
