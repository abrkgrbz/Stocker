using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region SupplierProduct Events

/// <summary>
/// Tedarikçi ürün ilişkisi oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record SupplierProductCreatedDomainEvent(
    int SupplierProductId,
    Guid TenantId,
    int SupplierId,
    int ProductId,
    string? SupplierProductCode,
    decimal PurchasePrice,
    int LeadTimeDays) : DomainEvent;

/// <summary>
/// Tedarikçi ürün fiyatı güncellendiğinde tetiklenen event.
/// </summary>
public sealed record SupplierProductPriceUpdatedDomainEvent(
    int SupplierProductId,
    Guid TenantId,
    int SupplierId,
    int ProductId,
    decimal OldPrice,
    decimal NewPrice) : DomainEvent;

/// <summary>
/// Tedarikçi ürün teslim süresi güncellendiğinde tetiklenen event.
/// </summary>
public sealed record SupplierProductLeadTimeUpdatedDomainEvent(
    int SupplierProductId,
    Guid TenantId,
    int SupplierId,
    int ProductId,
    int OldLeadTimeDays,
    int NewLeadTimeDays) : DomainEvent;

/// <summary>
/// Tedarikçi birincil olarak ayarlandığında tetiklenen event.
/// </summary>
public sealed record SupplierProductSetAsPrimaryDomainEvent(
    int SupplierProductId,
    Guid TenantId,
    int SupplierId,
    int ProductId) : DomainEvent;

/// <summary>
/// Tedarikçi ürün ilişkisi deaktif edildiğinde tetiklenen event.
/// </summary>
public sealed record SupplierProductDeactivatedDomainEvent(
    int SupplierProductId,
    Guid TenantId,
    int SupplierId,
    int ProductId) : DomainEvent;

/// <summary>
/// Tedarikçi ürün minimum sipariş miktarı güncellendiğinde tetiklenen event.
/// </summary>
public sealed record SupplierProductMinOrderQuantityUpdatedDomainEvent(
    int SupplierProductId,
    Guid TenantId,
    int SupplierId,
    int ProductId,
    decimal OldMinQuantity,
    decimal NewMinQuantity) : DomainEvent;

#endregion
