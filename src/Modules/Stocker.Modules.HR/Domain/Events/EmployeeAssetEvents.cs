using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.HR.Domain.Events;

#region EmployeeAsset Events

/// <summary>
/// Raised when an asset is assigned to an employee
/// </summary>
public sealed record AssetAssignedToEmployeeDomainEvent(
    int EmployeeAssetId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string AssetType,
    string AssetName,
    string? SerialNumber,
    DateTime AssignmentDate) : DomainEvent;

/// <summary>
/// Raised when an asset is returned by an employee
/// </summary>
public sealed record AssetReturnedByEmployeeDomainEvent(
    int EmployeeAssetId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string AssetName,
    DateTime ReturnDate,
    string? Condition) : DomainEvent;

/// <summary>
/// Raised when an asset is reported lost or damaged
/// </summary>
public sealed record AssetReportedLostOrDamagedDomainEvent(
    int EmployeeAssetId,
    Guid TenantId,
    int EmployeeId,
    string EmployeeName,
    string AssetName,
    string ReportType,
    string Description) : DomainEvent;

#endregion
