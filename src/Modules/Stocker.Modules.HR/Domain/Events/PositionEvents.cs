using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Position Events

/// <summary>
/// Raised when a position is created
/// </summary>
public sealed record PositionCreatedDomainEvent(
    int PositionId,
    Guid TenantId,
    string Code,
    string Title,
    int DepartmentId,
    string DepartmentName,
    int? GradeLevel) : DomainEvent;

/// <summary>
/// Raised when a position is updated
/// </summary>
public sealed record PositionUpdatedDomainEvent(
    int PositionId,
    Guid TenantId,
    string Code,
    string Title) : DomainEvent;

/// <summary>
/// Raised when a position is filled
/// </summary>
public sealed record PositionFilledDomainEvent(
    int PositionId,
    Guid TenantId,
    string Title,
    int EmployeeId,
    string EmployeeName) : DomainEvent;

/// <summary>
/// Raised when a position becomes vacant
/// </summary>
public sealed record PositionVacatedDomainEvent(
    int PositionId,
    Guid TenantId,
    string Title,
    int PreviousEmployeeId,
    string VacancyReason) : DomainEvent;

/// <summary>
/// Raised when a position is closed
/// </summary>
public sealed record PositionClosedDomainEvent(
    int PositionId,
    Guid TenantId,
    string Title,
    string ClosureReason) : DomainEvent;

#endregion
