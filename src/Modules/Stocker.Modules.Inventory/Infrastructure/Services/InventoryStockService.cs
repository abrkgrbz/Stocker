using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Implementation of inventory stock service for stock operations.
/// Uses domain methods for state changes following DDD patterns.
/// </summary>
public class InventoryStockService : IInventoryStockService
{
    private readonly InventoryDbContext _dbContext;
    private readonly ILogger<InventoryStockService> _logger;

    public InventoryStockService(
        InventoryDbContext dbContext,
        ILogger<InventoryStockService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task ApplyStockCountAdjustmentsAsync(
        Guid tenantId,
        int stockCountId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var stockCount = await _dbContext.StockCounts
                .Include(sc => sc.Items)
                .FirstOrDefaultAsync(sc =>
                    sc.TenantId == tenantId &&
                    sc.Id == stockCountId,
                    cancellationToken);

            if (stockCount == null)
            {
                _logger.LogWarning("Stock count {StockCountId} not found for tenant {TenantId}", stockCountId, tenantId);
                return;
            }

            var adjustmentsApplied = 0;

            foreach (var item in stockCount.Items.Where(i => i.HasDifference))
            {
                var stock = await _dbContext.Stocks
                    .FirstOrDefaultAsync(s =>
                        s.TenantId == tenantId &&
                        s.ProductId == item.ProductId &&
                        s.WarehouseId == stockCount.WarehouseId,
                        cancellationToken);

                if (stock != null && item.CountedQuantity.HasValue)
                {
                    // Use domain method for stock adjustment
                    stock.AdjustStock(item.CountedQuantity.Value);
                    item.MarkAsAdjusted();
                    adjustmentsApplied++;

                    _logger.LogDebug(
                        "Stock count adjustment: Product {ProductId}, New: {NewQty}",
                        item.ProductId, item.CountedQuantity.Value);
                }
            }

            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Stock count {StockCountId} adjustments applied. Total adjustments: {Count}",
                stockCountId, adjustmentsApplied);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to apply stock count adjustments for stock count {StockCountId}", stockCountId);
            throw;
        }
    }

    public async Task RecalculateStockLevelsAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var stock = await _dbContext.Stocks
                .FirstOrDefaultAsync(s =>
                    s.TenantId == tenantId &&
                    s.ProductId == productId &&
                    s.WarehouseId == warehouseId,
                    cancellationToken);

            if (stock == null)
            {
                _logger.LogWarning(
                    "Stock record not found for product {ProductId} in warehouse {WarehouseId}",
                    productId, warehouseId);
                return;
            }

            // Calculate total from movements using domain enums
            var totalIn = await _dbContext.StockMovements
                .Where(m =>
                    m.TenantId == tenantId &&
                    m.ProductId == productId &&
                    m.WarehouseId == warehouseId &&
                    (m.MovementType == StockMovementType.Purchase ||
                     m.MovementType == StockMovementType.Transfer ||
                     m.MovementType == StockMovementType.SalesReturn ||
                     m.MovementType == StockMovementType.AdjustmentIncrease))
                .SumAsync(m => m.Quantity, cancellationToken);

            var totalOut = await _dbContext.StockMovements
                .Where(m =>
                    m.TenantId == tenantId &&
                    m.ProductId == productId &&
                    m.WarehouseId == warehouseId &&
                    (m.MovementType == StockMovementType.Sales ||
                     m.MovementType == StockMovementType.PurchaseReturn ||
                     m.MovementType == StockMovementType.Consumption))
                .SumAsync(m => m.Quantity, cancellationToken);

            var calculatedQuantity = totalIn - totalOut;

            if (calculatedQuantity != stock.Quantity)
            {
                stock.AdjustStock(calculatedQuantity);
                await _dbContext.SaveChangesAsync(cancellationToken);

                _logger.LogInformation(
                    "Stock levels recalculated for product {ProductId} in warehouse {WarehouseId}. New: {NewQty}",
                    productId, warehouseId, calculatedQuantity);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to recalculate stock levels for product {ProductId}", productId);
            throw;
        }
    }

    public async Task<bool> ReserveStockAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        decimal quantity,
        string reference,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var stock = await _dbContext.Stocks
                .FirstOrDefaultAsync(s =>
                    s.TenantId == tenantId &&
                    s.ProductId == productId &&
                    s.WarehouseId == warehouseId,
                    cancellationToken);

            if (stock == null)
            {
                _logger.LogWarning(
                    "Stock record not found for reservation. Product {ProductId}, Warehouse {WarehouseId}",
                    productId, warehouseId);
                return false;
            }

            if (stock.AvailableQuantity < quantity)
            {
                _logger.LogWarning(
                    "Insufficient stock for reservation. Product {ProductId}, Available: {Available}, Requested: {Requested}",
                    productId, stock.AvailableQuantity, quantity);
                return false;
            }

            // Use domain method for reservation
            stock.ReserveStock(quantity);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Stock reserved for product {ProductId} in warehouse {WarehouseId}. Quantity: {Qty}, Reference: {Ref}",
                productId, warehouseId, quantity, reference);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reserve stock for product {ProductId}", productId);
            throw;
        }
    }

    public async Task ReleaseReservedStockAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        decimal quantity,
        string reference,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var stock = await _dbContext.Stocks
                .FirstOrDefaultAsync(s =>
                    s.TenantId == tenantId &&
                    s.ProductId == productId &&
                    s.WarehouseId == warehouseId,
                    cancellationToken);

            if (stock != null)
            {
                // Use domain method for releasing reservation
                var releaseQuantity = Math.Min(quantity, stock.ReservedQuantity);
                if (releaseQuantity > 0)
                {
                    stock.ReleaseReservation(releaseQuantity);
                    await _dbContext.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation(
                        "Stock reservation released for product {ProductId} in warehouse {WarehouseId}. Quantity: {Qty}, Reference: {Ref}",
                        productId, warehouseId, releaseQuantity, reference);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to release stock reservation for product {ProductId}", productId);
            throw;
        }
    }

    public async Task CheckLowStockAlertsAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var stock = await _dbContext.Stocks
                .Include(s => s.Product)
                .FirstOrDefaultAsync(s =>
                    s.TenantId == tenantId &&
                    s.ProductId == productId &&
                    s.WarehouseId == warehouseId,
                    cancellationToken);

            if (stock?.Product == null)
            {
                return;
            }

            var availableQuantity = stock.AvailableQuantity;
            var minimumStock = stock.Product.MinimumStock;

            if (availableQuantity <= minimumStock)
            {
                _logger.LogWarning(
                    "Low stock alert: Product {ProductId} ({ProductName}) at {Quantity} units, below minimum {Minimum}",
                    productId, stock.Product.Name, availableQuantity, minimumStock);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check low stock alerts for product {ProductId}", productId);
            throw;
        }
    }

    public async Task UpdateProductAverageCostAsync(
        Guid tenantId,
        int productId,
        decimal purchaseQuantity,
        decimal purchaseCost,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var product = await _dbContext.Products
                .FirstOrDefaultAsync(p =>
                    p.TenantId == tenantId &&
                    p.Id == productId,
                    cancellationToken);

            if (product == null)
            {
                _logger.LogWarning("Product {ProductId} not found for average cost update", productId);
                return;
            }

            // Get total stock quantity
            var totalStock = await _dbContext.Stocks
                .Where(s => s.TenantId == tenantId && s.ProductId == productId)
                .SumAsync(s => s.Quantity, cancellationToken);

            // Calculate weighted average cost
            var currentCostAmount = product.CostPrice?.Amount ?? 0;
            var currentValue = currentCostAmount * (totalStock - purchaseQuantity);
            var purchaseValue = purchaseCost * purchaseQuantity;
            var newAverageCost = totalStock > 0 ? (currentValue + purchaseValue) / totalStock : purchaseCost;

            // Use UpdateProductInfo to update cost price (domain method)
            var currency = product.CostPrice?.Currency ?? product.UnitPrice.Currency;
            var newCostMoney = Money.Create(newAverageCost, currency);
            product.UpdateProductInfo(product.Name, product.Description, product.UnitPrice, newCostMoney, product.VatRate);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Average cost updated for product {ProductId}. Old: {OldCost}, New: {NewCost}",
                productId, currentCostAmount, newAverageCost);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update average cost for product {ProductId}", productId);
            throw;
        }
    }

    public async Task ProcessLotBatchConsumptionAsync(
        Guid tenantId,
        int productId,
        decimal quantity,
        string strategy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var lotsQuery = _dbContext.LotBatches
                .Where(lb =>
                    lb.TenantId == tenantId &&
                    lb.ProductId == productId &&
                    lb.CurrentQuantity > 0 &&
                    !lb.IsQuarantined &&
                    lb.Status == LotBatchStatus.Approved);

            // Apply ordering based on strategy
            var orderedLots = strategy.ToUpperInvariant() switch
            {
                "FEFO" => lotsQuery.OrderBy(lb => lb.ExpiryDate ?? DateTime.MaxValue),
                "FIFO" or _ => lotsQuery.OrderBy(lb => lb.CreatedDate)
            };

            var lots = await orderedLots.ToListAsync(cancellationToken);

            var remainingQuantity = quantity;
            foreach (var lot in lots)
            {
                if (remainingQuantity <= 0) break;

                var consumeQuantity = Math.Min(lot.CurrentQuantity, remainingQuantity);
                lot.Consume(consumeQuantity);
                remainingQuantity -= consumeQuantity;

                _logger.LogDebug(
                    "Consumed {Quantity} from lot {LotNumber} using {Strategy} strategy",
                    consumeQuantity, lot.LotNumber, strategy);
            }

            await _dbContext.SaveChangesAsync(cancellationToken);

            if (remainingQuantity > 0)
            {
                _logger.LogWarning(
                    "Insufficient lot batch quantity for product {ProductId}. Remaining: {Remaining}",
                    productId, remainingQuantity);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process lot batch consumption for product {ProductId}", productId);
            throw;
        }
    }

    public async Task QuarantineExpiredLotBatchesAsync(
        Guid tenantId,
        int lotBatchId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var lotBatch = await _dbContext.LotBatches
                .FirstOrDefaultAsync(lb =>
                    lb.TenantId == tenantId &&
                    lb.Id == lotBatchId,
                    cancellationToken);

            if (lotBatch == null)
            {
                _logger.LogWarning("Lot batch {LotBatchId} not found", lotBatchId);
                return;
            }

            // Use domain method for quarantine
            lotBatch.Quarantine("Expired");
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogWarning(
                "Lot batch {LotBatchId} ({LotNumber}) quarantined due to expiration",
                lotBatchId, lotBatch.LotNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to quarantine lot batch {LotBatchId}", lotBatchId);
            throw;
        }
    }

    public async Task InitiateQualityCheckAsync(
        Guid tenantId,
        int serialNumberId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var serialNumber = await _dbContext.SerialNumbers
                .FirstOrDefaultAsync(sn =>
                    sn.TenantId == tenantId &&
                    sn.Id == serialNumberId,
                    cancellationToken);

            if (serialNumber == null)
            {
                _logger.LogWarning("Serial number {SerialNumberId} not found", serialNumberId);
                return;
            }

            // Use domain method if available for marking as in repair/quality check
            if (serialNumber.Status == SerialNumberStatus.Returned ||
                serialNumber.Status == SerialNumberStatus.Defective)
            {
                serialNumber.MarkInRepair();
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            _logger.LogInformation(
                "Quality check initiated for serial number {SerialNumberId} ({Serial})",
                serialNumberId, serialNumber.Serial);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initiate quality check for serial number {SerialNumberId}", serialNumberId);
            throw;
        }
    }

    public async Task CreateInventoryLossReportAsync(
        Guid tenantId,
        int serialNumberId,
        string serial,
        int productId,
        string? reason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var serialNumber = await _dbContext.SerialNumbers
                .FirstOrDefaultAsync(sn =>
                    sn.TenantId == tenantId &&
                    sn.Id == serialNumberId,
                    cancellationToken);

            if (serialNumber != null)
            {
                // Use domain method for marking as lost
                serialNumber.MarkLost(reason);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            _logger.LogWarning(
                "Inventory loss report created for serial {Serial} (Product: {ProductId}). Reason: {Reason}",
                serial, productId, reason);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create inventory loss report for serial {Serial}", serial);
            throw;
        }
    }

    public async Task ApplyCycleCountAdjustmentsAsync(
        Guid tenantId,
        int cycleCountId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var cycleCount = await _dbContext.CycleCounts
                .Include(cc => cc.Items)
                .FirstOrDefaultAsync(cc =>
                    cc.TenantId == tenantId &&
                    cc.Id == cycleCountId,
                    cancellationToken);

            if (cycleCount == null)
            {
                _logger.LogWarning("Cycle count {CycleCountId} not found for tenant {TenantId}", cycleCountId, tenantId);
                return;
            }

            var adjustmentsApplied = 0;

            foreach (var item in cycleCount.Items.Where(i => i.HasVariance))
            {
                var stock = await _dbContext.Stocks
                    .FirstOrDefaultAsync(s =>
                        s.TenantId == tenantId &&
                        s.ProductId == item.ProductId &&
                        s.WarehouseId == cycleCount.WarehouseId,
                        cancellationToken);

                if (stock != null && item.CountedQuantity.HasValue)
                {
                    // Use domain method for stock adjustment
                    stock.AdjustStock(item.CountedQuantity.Value);
                    adjustmentsApplied++;

                    _logger.LogDebug(
                        "Cycle count adjustment: Product {ProductId}, New: {NewQty}",
                        item.ProductId, item.CountedQuantity.Value);
                }
            }

            // Mark cycle count as processed
            cycleCount.MarkAsProcessed();

            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Cycle count {CycleCountId} adjustments applied. Total adjustments: {Count}",
                cycleCountId, adjustmentsApplied);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to apply cycle count adjustments for cycle count {CycleCountId}", cycleCountId);
            throw;
        }
    }
}
