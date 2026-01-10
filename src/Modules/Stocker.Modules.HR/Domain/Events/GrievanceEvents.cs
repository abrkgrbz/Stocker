using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Grievance Events

/// <summary>
/// Raised when a grievance is filed
/// </summary>
public sealed record GrievanceFiledDomainEvent(
    int GrievanceId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string Category,
    string Subject,
    DateTime FilingDate) : DomainEvent;

/// <summary>
/// Raised when a grievance is assigned for investigation
/// </summary>
public sealed record GrievanceAssignedDomainEvent(
    int GrievanceId,
    Guid TenantId,
    string Subject,
    int AssignedToId,
    string AssignedToName) : DomainEvent;

/// <summary>
/// Raised when a grievance investigation is completed
/// </summary>
public sealed record GrievanceInvestigationCompletedDomainEvent(
    int GrievanceId,
    Guid TenantId,
    int EmployeeId,
    string Subject,
    string Findings) : DomainEvent;

/// <summary>
/// Raised when a grievance is resolved
/// </summary>
public sealed record GrievanceResolvedDomainEvent(
    int GrievanceId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string Resolution,
    int ResolvedById,
    DateTime ResolutionDate) : DomainEvent;

/// <summary>
/// Raised when a grievance is escalated
/// </summary>
public sealed record GrievanceEscalatedDomainEvent(
    int GrievanceId,
    Guid TenantId,
    int EmployeeId,
    string Subject,
    string EscalationReason,
    int EscalatedToId) : DomainEvent;

/// <summary>
/// Raised when a grievance is closed
/// </summary>
public sealed record GrievanceClosedDomainEvent(
    int GrievanceId,
    Guid TenantId,
    int EmployeeId,
    string Subject,
    string ClosureReason) : DomainEvent;

#endregion
