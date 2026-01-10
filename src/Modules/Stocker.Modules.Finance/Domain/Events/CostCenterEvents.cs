using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region CostCenter Events

/// <summary>
/// Maliyet merkezi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record CostCenterCreatedDomainEvent(
    int CostCenterId,
    Guid TenantId,
    string CostCenterCode,
    string CostCenterName,
    int? ParentCostCenterId) : DomainEvent;

/// <summary>
/// Maliyet merkezi güncellendiğinde tetiklenen event
/// </summary>
public sealed record CostCenterUpdatedDomainEvent(
    int CostCenterId,
    Guid TenantId,
    string CostCenterCode,
    string CostCenterName) : DomainEvent;

/// <summary>
/// Maliyet merkezi devre dışı bırakıldığında tetiklenen event
/// </summary>
public sealed record CostCenterDeactivatedDomainEvent(
    int CostCenterId,
    Guid TenantId,
    string CostCenterCode,
    string CostCenterName) : DomainEvent;

#endregion
