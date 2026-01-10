using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Depo oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record WarehouseCreatedDomainEvent(
    int WarehouseId,
    Guid TenantId,
    string Code,
    string Name,
    int? BranchId) : DomainEvent;

/// <summary>
/// Depo güncellendiğinde tetiklenen event.
/// </summary>
public sealed record WarehouseUpdatedDomainEvent(
    int WarehouseId,
    Guid TenantId,
    string Code,
    string Name,
    string? Manager) : DomainEvent;

/// <summary>
/// Depo varsayılan olarak ayarlandığında tetiklenen event.
/// </summary>
public sealed record WarehouseSetAsDefaultDomainEvent(
    int WarehouseId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Depo aktifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record WarehouseActivatedDomainEvent(
    int WarehouseId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Depo pasifleştirildiğinde tetiklenen event.
/// Depo pasifleştirildiğinde ilişkili stok işlemleri etkilenebilir.
/// </summary>
public sealed record WarehouseDeactivatedDomainEvent(
    int WarehouseId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;
