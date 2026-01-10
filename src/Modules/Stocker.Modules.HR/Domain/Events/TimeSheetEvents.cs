using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region TimeSheet Events

/// <summary>
/// Raised when a timesheet is created
/// </summary>
public sealed record TimeSheetCreatedDomainEvent(
    int TimeSheetId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    DateTime PeriodStart,
    DateTime PeriodEnd) : DomainEvent;

/// <summary>
/// Raised when a timesheet entry is added
/// </summary>
public sealed record TimeSheetEntryAddedDomainEvent(
    int TimeSheetId,
    Guid TenantId,
    int EmployeeId,
    DateTime EntryDate,
    decimal Hours,
    string? ProjectCode) : DomainEvent;

/// <summary>
/// Raised when a timesheet is submitted
/// </summary>
public sealed record TimeSheetSubmittedDomainEvent(
    int TimeSheetId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal TotalHours,
    DateTime SubmissionDate) : DomainEvent;

/// <summary>
/// Raised when a timesheet is approved
/// </summary>
public sealed record TimeSheetApprovedDomainEvent(
    int TimeSheetId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal TotalHours,
    int ApprovedById) : DomainEvent;

/// <summary>
/// Raised when a timesheet is rejected
/// </summary>
public sealed record TimeSheetRejectedDomainEvent(
    int TimeSheetId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    int RejectedById,
    string RejectionReason) : DomainEvent;

/// <summary>
/// Raised when a timesheet is returned for revision
/// </summary>
public sealed record TimeSheetReturnedForRevisionDomainEvent(
    int TimeSheetId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string RevisionNotes) : DomainEvent;

#endregion
