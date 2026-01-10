using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Services;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Stok hareket servisi implementasyonu.
/// </summary>
public class StockMovementService : IStockMovementService
{
    private readonly InventoryDbContext _dbContext;
    private static readonly SemaphoreSlim _lock = new(1, 1);

    public StockMovementService(InventoryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<StockMovement> CreateIncomingMovementAsync(
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
        CancellationToken cancellationToken = default)
    {
        var stock = await GetOrCreateStockAsync(productId, warehouseId, locationId, lotNumber, serialNumber, cancellationToken);

        // Stok artır
        stock.IncreaseStock(quantity);

        // Hareket oluştur
        var documentNumber = await GenerateMovementNumberAsync(stock.TenantId, movementType, cancellationToken);

        var movement = new StockMovement(
            documentNumber,
            DateTime.UtcNow,
            productId,
            warehouseId,
            movementType,
            quantity,
            unitCost,
            userId);

        movement.SetLocations(null, locationId);

        if (!string.IsNullOrEmpty(lotNumber))
            movement.SetLotNumber(lotNumber);

        if (!string.IsNullOrEmpty(serialNumber))
            movement.SetSerialNumber(serialNumber);

        if (!string.IsNullOrEmpty(referenceDocumentType))
            movement.SetReference(referenceDocumentType, referenceDocumentNumber ?? "", referenceDocumentId);

        if (!string.IsNullOrEmpty(description))
            movement.SetDescription(description);

        movement.SetTenantId(stock.TenantId);

        await _dbContext.StockMovements.AddAsync(movement, cancellationToken);

        return movement;
    }

    public async Task<StockMovement> CreateOutgoingMovementAsync(
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
        CancellationToken cancellationToken = default)
    {
        var stock = await GetStockAsync(productId, warehouseId, locationId, lotNumber, serialNumber, cancellationToken);

        if (stock == null)
            throw new InvalidOperationException($"Stock not found for product {productId} in warehouse {warehouseId}");

        // Stok azalt
        stock.DecreaseStock(quantity);

        // Hareket oluştur
        var documentNumber = await GenerateMovementNumberAsync(stock.TenantId, movementType, cancellationToken);

        var movement = new StockMovement(
            documentNumber,
            DateTime.UtcNow,
            productId,
            warehouseId,
            movementType,
            quantity,
            unitCost,
            userId);

        movement.SetLocations(locationId, null);

        if (!string.IsNullOrEmpty(lotNumber))
            movement.SetLotNumber(lotNumber);

        if (!string.IsNullOrEmpty(serialNumber))
            movement.SetSerialNumber(serialNumber);

        if (!string.IsNullOrEmpty(referenceDocumentType))
            movement.SetReference(referenceDocumentType, referenceDocumentNumber ?? "", referenceDocumentId);

        if (!string.IsNullOrEmpty(description))
            movement.SetDescription(description);

        movement.SetTenantId(stock.TenantId);

        await _dbContext.StockMovements.AddAsync(movement, cancellationToken);

        return movement;
    }

    public async Task<StockMovement> CreateTransferMovementAsync(
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
        CancellationToken cancellationToken = default)
    {
        // Kaynak stok
        var sourceStock = await GetStockAsync(productId, warehouseId, fromLocationId, lotNumber, serialNumber, cancellationToken);

        if (sourceStock == null)
            throw new InvalidOperationException($"Source stock not found for product {productId} at location {fromLocationId}");

        sourceStock.DecreaseStock(quantity);

        // Hedef stok
        var targetStock = await GetOrCreateStockAsync(productId, warehouseId, toLocationId, lotNumber, serialNumber, cancellationToken);
        targetStock.IncreaseStock(quantity);

        // Transfer hareketi
        var documentNumber = await GenerateMovementNumberAsync(sourceStock.TenantId, StockMovementType.Transfer, cancellationToken);

        var movement = new StockMovement(
            documentNumber,
            DateTime.UtcNow,
            productId,
            warehouseId,
            StockMovementType.Transfer,
            quantity,
            unitCost,
            userId);

        movement.SetLocations(fromLocationId, toLocationId);

        if (!string.IsNullOrEmpty(lotNumber))
            movement.SetLotNumber(lotNumber);

        if (!string.IsNullOrEmpty(serialNumber))
            movement.SetSerialNumber(serialNumber);

        if (!string.IsNullOrEmpty(description))
            movement.SetDescription(description);

        movement.SetTenantId(sourceStock.TenantId);

        await _dbContext.StockMovements.AddAsync(movement, cancellationToken);

        return movement;
    }

    public async Task<StockMovement> ReverseMovementAsync(
        int stockMovementId,
        int userId,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var originalMovement = await _dbContext.StockMovements
            .FirstOrDefaultAsync(m => m.Id == stockMovementId, cancellationToken);

        if (originalMovement == null)
            throw new InvalidOperationException($"Stock movement {stockMovementId} not found");

        if (originalMovement.IsReversed)
            throw new InvalidOperationException($"Stock movement {stockMovementId} has already been reversed");

        // Ters hareket türünü belirle
        var reversalType = GetReversalMovementType(originalMovement.MovementType);

        // Stok düzeltmesi yap
        if (originalMovement.IsIncoming())
        {
            // Giriş ise çıkış yap
            var stock = await GetStockAsync(
                originalMovement.ProductId,
                originalMovement.WarehouseId,
                originalMovement.ToLocationId,
                originalMovement.LotNumber,
                originalMovement.SerialNumber,
                cancellationToken);

            stock?.DecreaseStock(originalMovement.Quantity);
        }
        else if (originalMovement.IsOutgoing())
        {
            // Çıkış ise giriş yap
            var stock = await GetOrCreateStockAsync(
                originalMovement.ProductId,
                originalMovement.WarehouseId,
                originalMovement.FromLocationId,
                originalMovement.LotNumber,
                originalMovement.SerialNumber,
                cancellationToken);

            stock.IncreaseStock(originalMovement.Quantity);
        }

        // Ters hareket oluştur
        var documentNumber = await GenerateMovementNumberAsync(originalMovement.TenantId, reversalType, cancellationToken);

        var reversalMovement = new StockMovement(
            documentNumber,
            DateTime.UtcNow,
            originalMovement.ProductId,
            originalMovement.WarehouseId,
            reversalType,
            originalMovement.Quantity,
            originalMovement.UnitCost,
            userId);

        reversalMovement.SetLocations(originalMovement.ToLocationId, originalMovement.FromLocationId);
        reversalMovement.SetDescription($"İptal: {originalMovement.DocumentNumber} - {reason}");
        reversalMovement.SetTenantId(originalMovement.TenantId);

        await _dbContext.StockMovements.AddAsync(reversalMovement, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Orijinal hareketi iptal edildi olarak işaretle
        originalMovement.Reverse(reversalMovement.Id, "System", reason);

        return reversalMovement;
    }

    public async Task<string> GenerateMovementNumberAsync(
        Guid tenantId,
        StockMovementType movementType,
        CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var today = DateTime.UtcNow;
            var prefix = GetMovementPrefix(movementType);
            var datePrefix = $"{prefix}{today:yyyyMMdd}";

            var lastMovement = await _dbContext.StockMovements
                .AsNoTracking()
                .Where(m => m.TenantId == tenantId && m.DocumentNumber.StartsWith(datePrefix))
                .OrderByDescending(m => m.DocumentNumber)
                .Select(m => m.DocumentNumber)
                .FirstOrDefaultAsync(cancellationToken);

            int nextSequence = 1;
            if (lastMovement != null && lastMovement.Length > datePrefix.Length)
            {
                var sequencePart = lastMovement.Substring(datePrefix.Length);
                if (int.TryParse(sequencePart, out var lastSequence))
                {
                    nextSequence = lastSequence + 1;
                }
            }

            return $"{datePrefix}{nextSequence:D6}";
        }
        finally
        {
            _lock.Release();
        }
    }

    private static string GetMovementPrefix(StockMovementType movementType)
    {
        return movementType switch
        {
            StockMovementType.Purchase => "ALM",
            StockMovementType.Sales => "SAT",
            StockMovementType.PurchaseReturn => "AID",
            StockMovementType.SalesReturn => "SID",
            StockMovementType.Transfer => "TRF",
            StockMovementType.Production => "URE",
            StockMovementType.Consumption => "TUK",
            StockMovementType.AdjustmentIncrease => "DZA",
            StockMovementType.AdjustmentDecrease => "DZE",
            StockMovementType.Opening => "ACS",
            StockMovementType.Counting => "SAY",
            StockMovementType.Damage => "HAS",
            StockMovementType.Loss => "KAY",
            StockMovementType.Found => "BUL",
            _ => "HRK"
        };
    }

    private static StockMovementType GetReversalMovementType(StockMovementType originalType)
    {
        return originalType switch
        {
            StockMovementType.Purchase => StockMovementType.PurchaseReturn,
            StockMovementType.Sales => StockMovementType.SalesReturn,
            StockMovementType.AdjustmentIncrease => StockMovementType.AdjustmentDecrease,
            StockMovementType.AdjustmentDecrease => StockMovementType.AdjustmentIncrease,
            _ => StockMovementType.AdjustmentDecrease // Default reversal
        };
    }

    private async Task<Stock?> GetStockAsync(
        int productId,
        int warehouseId,
        int? locationId,
        string? lotNumber,
        string? serialNumber,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Stocks
            .Where(s => s.ProductId == productId && s.WarehouseId == warehouseId);

        if (locationId.HasValue)
            query = query.Where(s => s.LocationId == locationId);

        if (!string.IsNullOrEmpty(lotNumber))
            query = query.Where(s => s.LotNumber == lotNumber);

        if (!string.IsNullOrEmpty(serialNumber))
            query = query.Where(s => s.SerialNumber == serialNumber);

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<Stock> GetOrCreateStockAsync(
        int productId,
        int warehouseId,
        int? locationId,
        string? lotNumber,
        string? serialNumber,
        CancellationToken cancellationToken)
    {
        var stock = await GetStockAsync(productId, warehouseId, locationId, lotNumber, serialNumber, cancellationToken);

        if (stock == null)
        {
            // TenantId'yi warehouse'dan al
            var warehouse = await _dbContext.Warehouses
                .AsNoTracking()
                .FirstAsync(w => w.Id == warehouseId, cancellationToken);

            stock = new Stock(productId, warehouseId, 0);
            stock.SetTenantId(warehouse.TenantId);

            if (locationId.HasValue)
                stock.SetLocation(locationId);

            if (!string.IsNullOrEmpty(lotNumber))
                stock.SetLotNumber(lotNumber);

            if (!string.IsNullOrEmpty(serialNumber))
                stock.SetSerialNumber(serialNumber);

            await _dbContext.Stocks.AddAsync(stock, cancellationToken);
        }

        return stock;
    }
}
