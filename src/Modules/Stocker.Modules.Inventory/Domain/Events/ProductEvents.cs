using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Ürün oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record ProductCreatedDomainEvent(
    int ProductId,
    Guid TenantId,
    string Code,
    string Name,
    string? SKU,
    string? Barcode,
    int? CategoryId,
    int? BrandId,
    string ProductType,
    decimal CostPrice,
    decimal UnitPrice) : DomainEvent;

/// <summary>
/// Ürün güncellendiğinde tetiklenen event.
/// </summary>
public sealed record ProductUpdatedDomainEvent(
    int ProductId,
    Guid TenantId,
    string Code,
    string Name,
    decimal CostPrice,
    decimal UnitPrice) : DomainEvent;

/// <summary>
/// Ürün aktifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record ProductActivatedDomainEvent(
    int ProductId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Ürün pasifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record ProductDeactivatedDomainEvent(
    int ProductId,
    Guid TenantId,
    string Code,
    string Name,
    string DeactivatedBy,
    string? Reason) : DomainEvent;

/// <summary>
/// Ürün stok seviyeleri değiştirildiğinde tetiklenen event.
/// </summary>
public sealed record ProductStockLevelsChangedDomainEvent(
    int ProductId,
    Guid TenantId,
    string Code,
    decimal MinimumStock,
    decimal MaximumStock,
    decimal ReorderPoint,
    decimal ReorderQuantity) : DomainEvent;
