using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region DisciplinaryAction Events

/// <summary>
/// Raised when a disciplinary action is created
/// </summary>
public sealed record DisciplinaryActionCreatedDomainEvent(
    int DisciplinaryActionId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string ActionType,
    string Reason,
    DateTime IncidentDate) : DomainEvent;

/// <summary>
/// Raised when a disciplinary action is issued
/// </summary>
public sealed record DisciplinaryActionIssuedDomainEvent(
    int DisciplinaryActionId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string ActionType,
    int IssuedById,
    DateTime IssueDate) : DomainEvent;

/// <summary>
/// Raised when a disciplinary action is appealed
/// </summary>
public sealed record DisciplinaryActionAppealedDomainEvent(
    int DisciplinaryActionId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string AppealReason,
    DateTime AppealDate) : DomainEvent;

/// <summary>
/// Raised when a disciplinary action appeal is resolved
/// </summary>
public sealed record DisciplinaryActionAppealResolvedDomainEvent(
    int DisciplinaryActionId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string Resolution,
    int ResolvedById) : DomainEvent;

/// <summary>
/// Raised when a disciplinary action expires
/// </summary>
public sealed record DisciplinaryActionExpiredDomainEvent(
    int DisciplinaryActionId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string ActionType,
    DateTime ExpiryDate) : DomainEvent;

#endregion
