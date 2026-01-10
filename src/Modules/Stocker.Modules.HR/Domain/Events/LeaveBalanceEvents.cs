using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region LeaveBalance Events

/// <summary>
/// Raised when leave balance is allocated
/// </summary>
public sealed record LeaveBalanceAllocatedDomainEvent(
    int LeaveBalanceId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    int LeaveTypeId,
    string LeaveTypeName,
    decimal AllocatedDays,
    int Year) : DomainEvent;

/// <summary>
/// Raised when leave balance is adjusted
/// </summary>
public sealed record LeaveBalanceAdjustedDomainEvent(
    int LeaveBalanceId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string LeaveTypeName,
    decimal OldBalance,
    decimal NewBalance,
    string AdjustmentReason) : DomainEvent;

/// <summary>
/// Raised when leave balance is used
/// </summary>
public sealed record LeaveBalanceUsedDomainEvent(
    int LeaveBalanceId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string LeaveTypeName,
    decimal DaysUsed,
    decimal RemainingBalance) : DomainEvent;

/// <summary>
/// Raised when leave balance is carried forward
/// </summary>
public sealed record LeaveBalanceCarriedForwardDomainEvent(
    int LeaveBalanceId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string LeaveTypeName,
    decimal CarriedForwardDays,
    int FromYear,
    int ToYear) : DomainEvent;

/// <summary>
/// Raised when leave balance expires
/// </summary>
public sealed record LeaveBalanceExpiredDomainEvent(
    int LeaveBalanceId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string LeaveTypeName,
    decimal ExpiredDays) : DomainEvent;

#endregion
