using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Payslip Events

/// <summary>
/// Raised when a payslip is generated
/// </summary>
public sealed record PayslipGeneratedDomainEvent(
    int PayslipId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    int PayrollId,
    decimal GrossAmount,
    decimal NetAmount,
    DateTime PayPeriodStart,
    DateTime PayPeriodEnd) : DomainEvent;

/// <summary>
/// Raised when a payslip is approved
/// </summary>
public sealed record PayslipApprovedDomainEvent(
    int PayslipId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal NetAmount,
    int ApprovedById) : DomainEvent;

/// <summary>
/// Raised when a payslip is sent to employee
/// </summary>
public sealed record PayslipSentToEmployeeDomainEvent(
    int PayslipId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string EmployeeEmail,
    DateTime SentDate) : DomainEvent;

/// <summary>
/// Raised when a payslip is disputed
/// </summary>
public sealed record PayslipDisputedDomainEvent(
    int PayslipId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string DisputeReason) : DomainEvent;

/// <summary>
/// Raised when a payslip is corrected
/// </summary>
public sealed record PayslipCorrectedDomainEvent(
    int PayslipId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal OldNetAmount,
    decimal NewNetAmount,
    string CorrectionReason) : DomainEvent;

#endregion
