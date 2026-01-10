using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region Department Events

/// <summary>
/// Raised when a department is created
/// </summary>
public sealed record DepartmentCreatedDomainEvent(
    int DepartmentId,
    Guid TenantId,
    string Code,
    string Name,
    int? ParentDepartmentId,
    int? ManagerId) : DomainEvent;

/// <summary>
/// Raised when a department is updated
/// </summary>
public sealed record DepartmentUpdatedDomainEvent(
    int DepartmentId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Raised when a department manager is assigned
/// </summary>
public sealed record DepartmentManagerAssignedDomainEvent(
    int DepartmentId,
    Guid TenantId,
    string DepartmentName,
    int? OldManagerId,
    int NewManagerId,
    string NewManagerName) : DomainEvent;

/// <summary>
/// Raised when a department is activated
/// </summary>
public sealed record DepartmentActivatedDomainEvent(
    int DepartmentId,
    Guid TenantId,
    string Name) : DomainEvent;

/// <summary>
/// Raised when a department is deactivated
/// </summary>
public sealed record DepartmentDeactivatedDomainEvent(
    int DepartmentId,
    Guid TenantId,
    string Name,
    int EmployeeCount) : DomainEvent;

/// <summary>
/// Raised when department hierarchy changes
/// </summary>
public sealed record DepartmentHierarchyChangedDomainEvent(
    int DepartmentId,
    Guid TenantId,
    string DepartmentName,
    int? OldParentId,
    int? NewParentId) : DomainEvent;

#endregion
