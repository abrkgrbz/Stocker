using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Overtime Events

/// <summary>
/// Raised when overtime is requested
/// </summary>
public sealed record OvertimeRequestedDomainEvent(
    int OvertimeId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    DateTime OvertimeDate,
    decimal Hours,
    string Reason) : DomainEvent;

/// <summary>
/// Raised when overtime is approved
/// </summary>
public sealed record OvertimeApprovedDomainEvent(
    int OvertimeId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal Hours,
    int ApprovedById) : DomainEvent;

/// <summary>
/// Raised when overtime is rejected
/// </summary>
public sealed record OvertimeRejectedDomainEvent(
    int OvertimeId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    int RejectedById,
    string RejectionReason) : DomainEvent;

/// <summary>
/// Raised when overtime is completed
/// </summary>
public sealed record OvertimeCompletedDomainEvent(
    int OvertimeId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal ActualHours,
    decimal PayAmount) : DomainEvent;

/// <summary>
/// Raised when overtime is cancelled
/// </summary>
public sealed record OvertimeCancelledDomainEvent(
    int OvertimeId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string CancellationReason) : DomainEvent;

#endregion
