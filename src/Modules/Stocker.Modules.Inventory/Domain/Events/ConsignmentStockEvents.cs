using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region ConsignmentStock Events

/// <summary>
/// Konsinye stok oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record ConsignmentStockCreatedDomainEvent(
    int ConsignmentStockId,
    Guid TenantId,
    int ProductId,
    int SupplierId,
    int WarehouseId,
    decimal Quantity,
    DateTime ReceivedDate) : DomainEvent;

/// <summary>
/// Konsinye stok miktarı güncellendiğinde tetiklenen event.
/// </summary>
public sealed record ConsignmentStockQuantityUpdatedDomainEvent(
    int ConsignmentStockId,
    Guid TenantId,
    int ProductId,
    decimal OldQuantity,
    decimal NewQuantity) : DomainEvent;

/// <summary>
/// Konsinye stok satıldığında tetiklenen event.
/// </summary>
public sealed record ConsignmentStockSoldDomainEvent(
    int ConsignmentStockId,
    Guid TenantId,
    int ProductId,
    int SupplierId,
    decimal QuantitySold,
    decimal SaleAmount) : DomainEvent;

/// <summary>
/// Konsinye stok iade edildiğinde tetiklenen event.
/// </summary>
public sealed record ConsignmentStockReturnedDomainEvent(
    int ConsignmentStockId,
    Guid TenantId,
    int ProductId,
    int SupplierId,
    decimal QuantityReturned,
    string? ReturnReason) : DomainEvent;

/// <summary>
/// Konsinye stok süresi dolduğunda tetiklenen event.
/// </summary>
public sealed record ConsignmentStockExpiredDomainEvent(
    int ConsignmentStockId,
    Guid TenantId,
    int ProductId,
    int SupplierId,
    decimal RemainingQuantity,
    DateTime ExpiryDate) : DomainEvent;

#endregion
