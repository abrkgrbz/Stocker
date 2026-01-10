using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Stok artırıldığında tetiklenen event.
/// </summary>
public sealed record StockIncreasedDomainEvent(
    int StockId,
    Guid TenantId,
    int ProductId,
    int WarehouseId,
    int? LocationId,
    decimal PreviousQuantity,
    decimal IncreasedQuantity,
    decimal NewQuantity,
    string? LotNumber,
    string? SerialNumber) : DomainEvent;

/// <summary>
/// Stok azaltıldığında tetiklenen event.
/// </summary>
public sealed record StockDecreasedDomainEvent(
    int StockId,
    Guid TenantId,
    int ProductId,
    int WarehouseId,
    int? LocationId,
    decimal PreviousQuantity,
    decimal DecreasedQuantity,
    decimal NewQuantity,
    string? LotNumber,
    string? SerialNumber) : DomainEvent;

/// <summary>
/// Stok rezerve edildiğinde tetiklenen event.
/// </summary>
public sealed record StockReservedDomainEvent(
    int StockId,
    Guid TenantId,
    int ProductId,
    int WarehouseId,
    decimal ReservedQuantity,
    decimal TotalReservedQuantity,
    decimal AvailableQuantity) : DomainEvent;

/// <summary>
/// Stok rezervasyonu serbest bırakıldığında tetiklenen event.
/// </summary>
public sealed record StockReservationReleasedDomainEvent(
    int StockId,
    Guid TenantId,
    int ProductId,
    int WarehouseId,
    decimal ReleasedQuantity,
    decimal RemainingReservedQuantity,
    decimal AvailableQuantity) : DomainEvent;

/// <summary>
/// Stok sayımla düzeltildiğinde tetiklenen event.
/// </summary>
public sealed record StockAdjustedDomainEvent(
    int StockId,
    Guid TenantId,
    int ProductId,
    int WarehouseId,
    decimal PreviousQuantity,
    decimal NewQuantity,
    decimal Variance) : DomainEvent;

/// <summary>
/// Stok minimum seviyenin altına düştüğünde tetiklenen event.
/// </summary>
public sealed record StockBelowMinimumDomainEvent(
    int StockId,
    Guid TenantId,
    int ProductId,
    string ProductCode,
    string ProductName,
    int WarehouseId,
    string WarehouseName,
    decimal CurrentQuantity,
    decimal MinimumStock,
    decimal ReorderPoint) : DomainEvent;

/// <summary>
/// Stok son kullanma tarihi yaklaştığında tetiklenen event.
/// </summary>
public sealed record StockExpiringDomainEvent(
    int StockId,
    Guid TenantId,
    int ProductId,
    string ProductCode,
    string ProductName,
    int WarehouseId,
    string? LotNumber,
    decimal Quantity,
    DateTime ExpiryDate,
    int DaysUntilExpiry) : DomainEvent;
