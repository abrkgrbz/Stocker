using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Payroll Events

/// <summary>
/// Raised when payroll is processed for an employee
/// </summary>
public sealed record PayrollProcessedDomainEvent(
    int PayrollId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal GrossSalary,
    decimal NetSalary,
    string Currency,
    string PayPeriod,
    DateTime PaymentDate) : DomainEvent;

/// <summary>
/// Raised when payroll is approved
/// </summary>
public sealed record PayrollApprovedDomainEvent(
    int PayrollId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal NetSalary,
    string Currency,
    int ApprovedById) : DomainEvent;

/// <summary>
/// Raised when salary payment is completed
/// </summary>
public sealed record SalaryPaidDomainEvent(
    int PayrollId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal Amount,
    string Currency,
    string PaymentMethod,
    DateTime PaymentDate) : DomainEvent;

/// <summary>
/// Raised when bonus is awarded
/// </summary>
public sealed record BonusAwardedDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    decimal BonusAmount,
    string Currency,
    string BonusType,
    string? Reason) : DomainEvent;

/// <summary>
/// Raised when salary deduction is applied
/// </summary>
public sealed record SalaryDeductionAppliedDomainEvent(
    int EmployeeId,
    Guid TenantId,
    string EmployeeName,
    decimal DeductionAmount,
    string Currency,
    string DeductionType,
    string? Reason) : DomainEvent;

/// <summary>
/// Raised when payroll period is closed
/// </summary>
public sealed record PayrollPeriodClosedDomainEvent(
    Guid TenantId,
    string PayPeriod,
    int TotalEmployees,
    decimal TotalAmount,
    string Currency,
    DateTime ClosedDate) : DomainEvent;

#endregion
