using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region WorkLocation Events

/// <summary>
/// Raised when a work location is created
/// </summary>
public sealed record WorkLocationCreatedDomainEvent(
    int WorkLocationId,
    Guid TenantId,
    string Code,
    string Name,
    string? City,
    string? Country) : DomainEvent;

/// <summary>
/// Raised when a work location is updated
/// </summary>
public sealed record WorkLocationUpdatedDomainEvent(
    int WorkLocationId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Raised when an employee is assigned to a work location
/// </summary>
public sealed record EmployeeAssignedToWorkLocationDomainEvent(
    int WorkLocationId,
    Guid TenantId,
    string LocationName,
    int EmployeeId,
    string EmployeeName) : DomainEvent;

/// <summary>
/// Raised when a work location is closed
/// </summary>
public sealed record WorkLocationClosedDomainEvent(
    int WorkLocationId,
    Guid TenantId,
    string Name,
    int AffectedEmployeeCount,
    string ClosureReason) : DomainEvent;

/// <summary>
/// Raised when a work location is set as headquarters
/// </summary>
public sealed record WorkLocationSetAsHeadquartersDomainEvent(
    int WorkLocationId,
    Guid TenantId,
    string Name) : DomainEvent;

#endregion
