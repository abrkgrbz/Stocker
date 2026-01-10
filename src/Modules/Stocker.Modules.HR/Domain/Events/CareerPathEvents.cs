using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region CareerPath Events

/// <summary>
/// Raised when a career path is created
/// </summary>
public sealed record CareerPathCreatedDomainEvent(
    int CareerPathId,
    Guid TenantId,
    string Name,
    int StartingPositionId,
    int MilestoneCount) : DomainEvent;

/// <summary>
/// Raised when an employee is assigned to a career path
/// </summary>
public sealed record EmployeeAssignedToCareerPathDomainEvent(
    int CareerPathId,
    Guid TenantId,
    string CareerPathName,
    int EmployeeId,
    string EmployeeName,
    DateTime AssignmentDate) : DomainEvent;

/// <summary>
/// Raised when a career path milestone is completed
/// </summary>
public sealed record CareerPathMilestoneCompletedDomainEvent(
    int CareerPathId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string MilestoneName,
    int CompletedMilestones,
    int TotalMilestones) : DomainEvent;

/// <summary>
/// Raised when a career path is completed
/// </summary>
public sealed record CareerPathCompletedDomainEvent(
    int CareerPathId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string CareerPathName,
    DateTime CompletionDate) : DomainEvent;

/// <summary>
/// Raised when career path progress is updated
/// </summary>
public sealed record CareerPathProgressUpdatedDomainEvent(
    int CareerPathId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    decimal ProgressPercentage) : DomainEvent;

#endregion
