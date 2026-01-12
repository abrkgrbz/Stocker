using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.Shared.Events.Sales;

namespace Stocker.Modules.Inventory.Infrastructure.EventConsumers;

/// <summary>
/// Inventory module consumer for SalesOrderCreatedEvent from Sales module
/// Reserves inventory for sales orders and updates stock availability
/// </summary>
public class SalesOrderCreatedEventConsumer : IConsumer<SalesOrderCreatedEvent>
{
    private readonly IInventoryUnitOfWork _unitOfWork;
    private readonly ILogger<SalesOrderCreatedEventConsumer> _logger;

    public SalesOrderCreatedEventConsumer(
        IInventoryUnitOfWork unitOfWork,
        ILogger<SalesOrderCreatedEventConsumer> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<SalesOrderCreatedEvent> context)
    {
        var @event = context.Message;

        _logger.LogInformation(
            "Inventory module processing SalesOrderCreatedEvent: OrderId={OrderId}, OrderNumber={OrderNumber}, Items={ItemCount}, TenantId={TenantId}",
            @event.OrderId,
            @event.OrderNumber,
            @event.Items.Count,
            @event.TenantId);

        try
        {
            // Get default warehouse for reservations
            var defaultWarehouse = await _unitOfWork.Warehouses.GetDefaultWarehouseAsync(context.CancellationToken);
            if (defaultWarehouse == null)
            {
                var warehouses = await _unitOfWork.Warehouses.GetActiveWarehousesAsync(context.CancellationToken);
                defaultWarehouse = warehouses.FirstOrDefault();
            }

            if (defaultWarehouse == null)
            {
                _logger.LogWarning(
                    "No active warehouse found for sales order {OrderNumber} stock reservation. Skipping reservation.",
                    @event.OrderNumber);
                return;
            }

            var reservedItems = new List<(string ProductName, decimal Quantity, bool Success, string Reason)>();

            foreach (var orderItem in @event.Items)
            {
                try
                {
                    // Skip items without product reference
                    if (!orderItem.ProductId.HasValue)
                    {
                        _logger.LogDebug(
                            "Skipping non-inventory item in order {OrderNumber}: {ProductName}",
                            @event.OrderNumber, orderItem.ProductName);
                        continue;
                    }

                    // Find product by code first, then by ID
                    var product = await _unitOfWork.Products.GetByCodeAsync(
                        orderItem.ProductCode, context.CancellationToken);

                    if (product == null)
                    {
                        // Try searching by name
                        var products = await _unitOfWork.Products.SearchAsync(
                            orderItem.ProductName, context.CancellationToken);
                        product = products.FirstOrDefault();
                    }

                    if (product == null)
                    {
                        _logger.LogWarning(
                            "Product not found for order {OrderNumber}: ProductCode={ProductCode}, Name={ProductName}",
                            @event.OrderNumber, orderItem.ProductCode, orderItem.ProductName);

                        reservedItems.Add((orderItem.ProductName, orderItem.Quantity, false, "Product not found in inventory"));
                        continue;
                    }

                    // Check available stock
                    var availableStock = await _unitOfWork.Stocks.GetTotalAvailableQuantityAsync(
                        product.Id, defaultWarehouse.Id, context.CancellationToken);

                    var reservedStock = await _unitOfWork.StockReservations.GetTotalReservedQuantityAsync(
                        product.Id, defaultWarehouse.Id, context.CancellationToken);

                    var netAvailable = availableStock - reservedStock;

                    if (netAvailable < orderItem.Quantity)
                    {
                        _logger.LogWarning(
                            "Insufficient stock for order {OrderNumber}, product {ProductCode}: Required={Required}, Available={Available}",
                            @event.OrderNumber, product.Code, orderItem.Quantity, netAvailable);

                        reservedItems.Add((product.Name, orderItem.Quantity, false,
                            $"Insufficient stock: {netAvailable:N2} available, {orderItem.Quantity:N2} required"));

                        // Continue with other products - don't fail the entire operation
                        continue;
                    }

                    // Generate reservation number
                    var reservationNumber = await _unitOfWork.StockReservations.GenerateReservationNumberAsync(context.CancellationToken);

                    // Create stock reservation for the sales order
                    var reservation = new StockReservation(
                        reservationNumber,
                        product.Id,
                        defaultWarehouse.Id,
                        orderItem.Quantity,
                        ReservationType.SalesOrder,
                        0, // System user
                        DateTime.UtcNow.AddDays(30) // 30 days expiration for sales order reservations
                    );

                    reservation.SetReference("SalesOrder", @event.OrderNumber, @event.OrderId);
                    reservation.SetNotes($"Auto-reserved for sales order {@event.OrderNumber} - Customer: {@event.CustomerName}");

                    await _unitOfWork.StockReservations.AddAsync(reservation, context.CancellationToken);

                    _logger.LogInformation(
                        "Created stock reservation {ReservationNumber} for order {OrderNumber}: Product={ProductName}, Quantity={Quantity}",
                        reservationNumber, @event.OrderNumber, product.Name, orderItem.Quantity);

                    reservedItems.Add((product.Name, orderItem.Quantity, true, "Reserved successfully"));
                }
                catch (Exception itemEx)
                {
                    _logger.LogError(itemEx,
                        "Error processing item {ProductCode} for order {OrderNumber}",
                        orderItem.ProductCode, @event.OrderNumber);

                    reservedItems.Add((orderItem.ProductName, orderItem.Quantity, false, itemEx.Message));
                }
            }

            await _unitOfWork.SaveChangesAsync(context.CancellationToken);

            // Log summary
            var successCount = reservedItems.Count(p => p.Success);
            var failCount = reservedItems.Count(p => !p.Success);

            _logger.LogInformation(
                "Completed stock reservation for order {OrderNumber}: {SuccessCount} products reserved, {FailCount} failed",
                @event.OrderNumber, successCount, failCount);

            // Log individual results for debugging
            foreach (var result in reservedItems)
            {
                if (result.Success)
                {
                    _logger.LogDebug("Reserved {Quantity} x {ProductName}: {Reason}",
                        result.Quantity, result.ProductName, result.Reason);
                }
                else
                {
                    _logger.LogWarning("Failed to reserve {Quantity} x {ProductName}: {Reason}",
                        result.Quantity, result.ProductName, result.Reason);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing SalesOrderCreatedEvent for order {OrderNumber}", @event.OrderNumber);
            throw; // Re-throw to trigger MassTransit retry
        }
    }
}
