using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.Shared.Contracts.Inventory;

namespace Stocker.Modules.Inventory.Application.Services;

/// <summary>
/// Implementation of IInventoryService for cross-module inventory operations
/// Provides stock management capabilities for Sales and CRM modules
/// </summary>
public class InventoryService : IInventoryService
{
    private readonly IInventoryUnitOfWork _unitOfWork;
    private readonly ILogger<InventoryService> _logger;

    public InventoryService(
        IInventoryUnitOfWork unitOfWork,
        ILogger<InventoryService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<bool> HasSufficientStockAsync(Guid productId, Guid tenantId, decimal quantity, CancellationToken cancellationToken = default)
    {
        try
        {
            var availableStock = await GetAvailableStockAsync(productId, tenantId, cancellationToken);
            return availableStock >= quantity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking stock for product {ProductId}", productId);
            return false;
        }
    }

    public async Task<decimal> GetAvailableStockAsync(Guid productId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Find product by code (using GUID as string code lookup)
            var product = await _unitOfWork.Products.GetByCodeAsync(productId.ToString(), cancellationToken);

            if (product == null)
            {
                _logger.LogWarning("Product not found: {ProductId}", productId);
                return 0;
            }

            // Get total stock across all warehouses
            var totalStock = await _unitOfWork.Stocks.GetTotalQuantityByProductAsync(product.Id, cancellationToken);

            // Get total reserved quantity across all warehouses
            var stocks = await _unitOfWork.Stocks.GetByProductAsync(product.Id, cancellationToken);
            decimal totalReserved = 0;

            foreach (var stock in stocks)
            {
                totalReserved += await _unitOfWork.StockReservations.GetTotalReservedQuantityAsync(
                    product.Id, stock.WarehouseId, cancellationToken);
            }

            var availableStock = totalStock - totalReserved;

            _logger.LogDebug(
                "Stock check for product {ProductId}: Total={Total}, Reserved={Reserved}, Available={Available}",
                productId, totalStock, totalReserved, availableStock);

            return Math.Max(0, availableStock);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting available stock for product {ProductId}", productId);
            return 0;
        }
    }

    public async Task<bool> ReserveStockAsync(Guid orderId, Guid tenantId, IEnumerable<StockReservationDto> reservations, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Reserving stock for order {OrderId} with {Count} items", orderId, reservations.Count());

            // Get default warehouse
            var defaultWarehouse = await _unitOfWork.Warehouses.GetDefaultWarehouseAsync(cancellationToken);
            if (defaultWarehouse == null)
            {
                var warehouses = await _unitOfWork.Warehouses.GetActiveWarehousesAsync(cancellationToken);
                defaultWarehouse = warehouses.FirstOrDefault();
            }

            if (defaultWarehouse == null)
            {
                _logger.LogError("No active warehouse found for stock reservation");
                return false;
            }

            var reservationsList = reservations.ToList();
            var createdReservations = new List<StockReservation>();

            foreach (var item in reservationsList)
            {
                // Find product by code
                var product = await _unitOfWork.Products.GetByCodeAsync(item.ProductId.ToString(), cancellationToken);

                if (product == null)
                {
                    _logger.LogWarning("Product not found for reservation: {ProductId}", item.ProductId);
                    continue;
                }

                // Check available stock
                var availableStock = await _unitOfWork.Stocks.GetTotalAvailableQuantityAsync(
                    product.Id, defaultWarehouse.Id, cancellationToken);

                var reservedStock = await _unitOfWork.StockReservations.GetTotalReservedQuantityAsync(
                    product.Id, defaultWarehouse.Id, cancellationToken);

                var netAvailable = availableStock - reservedStock;

                if (netAvailable < item.Quantity)
                {
                    _logger.LogWarning(
                        "Insufficient stock for product {ProductId}: Required={Required}, Available={Available}",
                        item.ProductId, item.Quantity, netAvailable);

                    // Rollback created reservations
                    foreach (var created in createdReservations)
                    {
                        created.Cancel("Insufficient stock for batch reservation");
                    }

                    return false;
                }

                // Generate reservation number
                var reservationNumber = await _unitOfWork.StockReservations.GenerateReservationNumberAsync(cancellationToken);

                // Create reservation
                var reservation = new StockReservation(
                    reservationNumber,
                    product.Id,
                    defaultWarehouse.Id,
                    item.Quantity,
                    ReservationType.SalesOrder,
                    0, // System user
                    DateTime.UtcNow.AddDays(7) // 7 days expiration
                );

                reservation.SetReference("SalesOrder", orderId.ToString(), orderId);
                reservation.SetNotes($"Auto-reserved for order {orderId}");

                await _unitOfWork.StockReservations.AddAsync(reservation, cancellationToken);
                createdReservations.Add(reservation);

                _logger.LogInformation(
                    "Created reservation {ReservationNumber} for product {ProductId}, quantity {Quantity}",
                    reservationNumber, product.Id, item.Quantity);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Successfully reserved stock for order {OrderId}: {Count} reservations created",
                orderId, createdReservations.Count);

            return createdReservations.Count > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reserving stock for order {OrderId}", orderId);
            return false;
        }
    }

    public async Task<bool> ReleaseReservedStockAsync(Guid orderId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Releasing reserved stock for order {OrderId}", orderId);

            // Find all reservations for this order using reference lookup
            var orderReservations = await _unitOfWork.StockReservations.GetByReferenceAsync(
                ReservationType.SalesOrder, orderId, cancellationToken);

            var activeReservations = orderReservations
                .Where(r => r.Status == ReservationStatus.Active || r.Status == ReservationStatus.PartiallyFulfilled)
                .ToList();

            if (!activeReservations.Any())
            {
                _logger.LogWarning("No active reservations found for order {OrderId}", orderId);
                return true; // No reservations to release is not an error
            }

            foreach (var reservation in activeReservations)
            {
                reservation.Cancel($"Order {orderId} cancelled");

                _logger.LogInformation(
                    "Cancelled reservation {ReservationNumber} for order {OrderId}",
                    reservation.ReservationNumber, orderId);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Successfully released {Count} reservations for order {OrderId}",
                activeReservations.Count, orderId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error releasing stock for order {OrderId}", orderId);
            return false;
        }
    }

    public async Task<ProductDto?> GetProductByIdAsync(Guid productId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var product = await _unitOfWork.Products.GetByCodeAsync(productId.ToString(), cancellationToken);

            if (product == null)
            {
                return null;
            }

            // Get available stock
            var totalStock = await _unitOfWork.Stocks.GetTotalQuantityByProductAsync(product.Id, cancellationToken);

            return new ProductDto
            {
                Id = productId,
                TenantId = tenantId,
                ProductCode = product.Code,
                ProductName = product.Name,
                Description = product.Description,
                UnitPrice = product.UnitPrice?.Amount ?? 0,
                Currency = product.UnitPrice?.Currency ?? "TRY",
                AvailableStock = totalStock,
                Unit = product.Unit ?? "Adet",
                IsActive = product.IsActive
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting product {ProductId}", productId);
            return null;
        }
    }

    public async Task<IEnumerable<ProductDto>> GetActiveProductsAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var products = await _unitOfWork.Products.GetActiveProductsAsync(cancellationToken);
            var result = new List<ProductDto>();

            foreach (var product in products)
            {
                var totalStock = await _unitOfWork.Stocks.GetTotalQuantityByProductAsync(product.Id, cancellationToken);

                result.Add(new ProductDto
                {
                    Id = Guid.NewGuid(), // Generate ID for cross-module reference
                    TenantId = tenantId,
                    ProductCode = product.Code,
                    ProductName = product.Name,
                    Description = product.Description,
                    UnitPrice = product.UnitPrice?.Amount ?? 0,
                    Currency = product.UnitPrice?.Currency ?? "TRY",
                    AvailableStock = totalStock,
                    Unit = product.Unit ?? "Adet",
                    IsActive = product.IsActive
                });
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active products for tenant {TenantId}", tenantId);
            return Enumerable.Empty<ProductDto>();
        }
    }
}
