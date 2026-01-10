using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Services;

/// <summary>
/// Stok seviye kontrol servisi interface'i.
/// Minimum stok, reorder point ve son kullanma tarihi kontrollerini yönetir.
/// </summary>
public interface IStockLevelService
{
    /// <summary>
    /// Minimum stok seviyesinin altına düşen ürünleri kontrol eder.
    /// </summary>
    Task<IReadOnlyList<StockLevelAlert>> CheckMinimumStockLevelsAsync(
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Yeniden sipariş noktasına ulaşan ürünleri kontrol eder.
    /// </summary>
    Task<IReadOnlyList<ReorderAlert>> CheckReorderPointsAsync(
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Son kullanma tarihi yaklaşan stokları kontrol eder.
    /// </summary>
    Task<IReadOnlyList<ExpiryAlert>> CheckExpiringStocksAsync(
        int daysThreshold,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Belirli bir ürün için stok seviyesini kontrol eder ve gerekirse uyarı oluşturur.
    /// </summary>
    Task CheckProductStockLevelAsync(
        int productId,
        int warehouseId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Depo bazında toplam stok değerini hesaplar.
    /// </summary>
    Task<decimal> CalculateWarehouseStockValueAsync(
        int warehouseId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Ürün bazında toplam stok miktarını hesaplar.
    /// </summary>
    Task<decimal> GetProductTotalStockAsync(
        int productId,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Minimum stok uyarısı.
/// </summary>
public record StockLevelAlert(
    int ProductId,
    string ProductCode,
    string ProductName,
    int WarehouseId,
    string WarehouseName,
    decimal CurrentQuantity,
    decimal MinimumStock,
    decimal Shortage);

/// <summary>
/// Yeniden sipariş uyarısı.
/// </summary>
public record ReorderAlert(
    int ProductId,
    string ProductCode,
    string ProductName,
    int WarehouseId,
    string WarehouseName,
    decimal CurrentQuantity,
    decimal ReorderPoint,
    decimal ReorderQuantity,
    int? PreferredSupplierId,
    string? PreferredSupplierName);

/// <summary>
/// Son kullanma tarihi uyarısı.
/// </summary>
public record ExpiryAlert(
    int StockId,
    int ProductId,
    string ProductCode,
    string ProductName,
    int WarehouseId,
    string WarehouseName,
    string? LotNumber,
    decimal Quantity,
    DateTime ExpiryDate,
    int DaysUntilExpiry);
