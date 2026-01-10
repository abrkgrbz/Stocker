using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Services;

/// <summary>
/// Stok hareket servisi interface'i.
/// Stok giriş/çıkış işlemlerini yönetir.
/// </summary>
public interface IStockMovementService
{
    /// <summary>
    /// Stok girişi oluşturur (Alış, İade, Üretim, Sayım artısı vb.)
    /// </summary>
    Task<StockMovement> CreateIncomingMovementAsync(
        int productId,
        int warehouseId,
        int? locationId,
        StockMovementType movementType,
        decimal quantity,
        decimal unitCost,
        int userId,
        string? lotNumber = null,
        string? serialNumber = null,
        string? referenceDocumentType = null,
        string? referenceDocumentNumber = null,
        int? referenceDocumentId = null,
        string? description = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Stok çıkışı oluşturur (Satış, İade, Tüketim, Fire vb.)
    /// </summary>
    Task<StockMovement> CreateOutgoingMovementAsync(
        int productId,
        int warehouseId,
        int? locationId,
        StockMovementType movementType,
        decimal quantity,
        decimal unitCost,
        int userId,
        string? lotNumber = null,
        string? serialNumber = null,
        string? referenceDocumentType = null,
        string? referenceDocumentNumber = null,
        int? referenceDocumentId = null,
        string? description = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Lokasyonlar arası transfer hareketi oluşturur.
    /// </summary>
    Task<StockMovement> CreateTransferMovementAsync(
        int productId,
        int warehouseId,
        int fromLocationId,
        int toLocationId,
        decimal quantity,
        decimal unitCost,
        int userId,
        string? lotNumber = null,
        string? serialNumber = null,
        string? description = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Stok hareketini tersine çevirir.
    /// </summary>
    Task<StockMovement> ReverseMovementAsync(
        int stockMovementId,
        int userId,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Hareket numarası üretir.
    /// </summary>
    Task<string> GenerateMovementNumberAsync(
        Guid tenantId,
        StockMovementType movementType,
        CancellationToken cancellationToken = default);
}
