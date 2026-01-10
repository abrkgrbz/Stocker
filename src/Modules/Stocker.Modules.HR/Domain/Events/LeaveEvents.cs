using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Leave Events

/// <summary>
/// Raised when a leave request is created
/// </summary>
public sealed record LeaveRequestCreatedDomainEvent(
    int LeaveId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string LeaveTypeName,
    DateTime StartDate,
    DateTime EndDate,
    decimal TotalDays,
    int ManagerId) : DomainEvent;

/// <summary>
/// Raised when a leave request is approved
/// </summary>
public sealed record LeaveRequestApprovedDomainEvent(
    int LeaveId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string LeaveTypeName,
    DateTime StartDate,
    DateTime EndDate,
    decimal TotalDays,
    int ApprovedById,
    string ApprovedByName) : DomainEvent;

/// <summary>
/// Raised when a leave request is rejected
/// </summary>
public sealed record LeaveRequestRejectedDomainEvent(
    int LeaveId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string LeaveTypeName,
    DateTime StartDate,
    DateTime EndDate,
    string RejectionReason,
    int RejectedById) : DomainEvent;

/// <summary>
/// Raised when a leave request is cancelled
/// </summary>
public sealed record LeaveRequestCancelledDomainEvent(
    int LeaveId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string LeaveTypeName,
    DateTime StartDate,
    DateTime EndDate,
    string? CancellationReason) : DomainEvent;

/// <summary>
/// Raised when leave balance is low
/// </summary>
public sealed record LeaveBalanceLowDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    string LeaveTypeName,
    decimal RemainingDays,
    decimal ThresholdDays) : DomainEvent;

/// <summary>
/// Raised when leave balance is about to expire
/// </summary>
public sealed record LeaveBalanceExpiringDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    string LeaveTypeName,
    decimal ExpiringDays,
    DateTime ExpiryDate) : DomainEvent;

#endregion
