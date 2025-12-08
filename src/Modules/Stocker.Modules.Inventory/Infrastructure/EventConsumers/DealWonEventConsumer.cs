using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Shared.Events.CRM;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Inventory.Infrastructure.EventConsumers;

/// <summary>
/// Inventory module consumer for DealWonEvent from CRM
/// Reserves inventory for won deals and updates product availability forecasts
/// </summary>
public class DealWonEventConsumer : IConsumer<DealWonEvent>
{
    private readonly IProductRepository _productRepository;
    private readonly IStockRepository _stockRepository;
    private readonly IStockReservationRepository _reservationRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DealWonEventConsumer> _logger;

    public DealWonEventConsumer(
        IProductRepository productRepository,
        IStockRepository stockRepository,
        IStockReservationRepository reservationRepository,
        IWarehouseRepository warehouseRepository,
        IUnitOfWork unitOfWork,
        ILogger<DealWonEventConsumer> logger)
    {
        _productRepository = productRepository;
        _stockRepository = stockRepository;
        _reservationRepository = reservationRepository;
        _warehouseRepository = warehouseRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<DealWonEvent> context)
    {
        var @event = context.Message;

        _logger.LogInformation(
            "Inventory module processing DealWonEvent: DealId={DealId}, CustomerId={CustomerId}, Products={ProductCount}, TenantId={TenantId}",
            @event.DealId,
            @event.CustomerId,
            @event.Products.Count,
            @event.TenantId);

        try
        {
            // Get default warehouse for reservations
            var defaultWarehouse = await _warehouseRepository.GetDefaultWarehouseAsync(context.CancellationToken);
            if (defaultWarehouse == null)
            {
                var warehouses = await _warehouseRepository.GetActiveWarehousesAsync(context.CancellationToken);
                defaultWarehouse = warehouses.FirstOrDefault();
            }

            if (defaultWarehouse == null)
            {
                _logger.LogError("No active warehouse found for deal {DealId} stock reservation", @event.DealId);
                return;
            }

            var reservedProducts = new List<(string ProductName, decimal Quantity, bool Success, string Reason)>();

            foreach (var dealProduct in @event.Products)
            {
                try
                {
                    // Find product by code/ID
                    var product = await _productRepository.GetByCodeAsync(
                        dealProduct.ProductId.ToString(), context.CancellationToken);

                    if (product == null)
                    {
                        // Try searching by name
                        var products = await _productRepository.SearchAsync(
                            dealProduct.ProductName, context.CancellationToken);
                        product = products.FirstOrDefault();
                    }

                    if (product == null)
                    {
                        _logger.LogWarning(
                            "Product not found for deal {DealId}: ProductId={ProductId}, Name={ProductName}",
                            @event.DealId, dealProduct.ProductId, dealProduct.ProductName);

                        reservedProducts.Add((dealProduct.ProductName, dealProduct.Quantity, false, "Product not found"));
                        continue;
                    }

                    // Check available stock
                    var availableStock = await _stockRepository.GetTotalAvailableQuantityAsync(
                        product.Id, defaultWarehouse.Id, context.CancellationToken);

                    var reservedStock = await _reservationRepository.GetTotalReservedQuantityAsync(
                        product.Id, defaultWarehouse.Id, context.CancellationToken);

                    var netAvailable = availableStock - reservedStock;

                    if (netAvailable < dealProduct.Quantity)
                    {
                        _logger.LogWarning(
                            "Insufficient stock for deal {DealId}, product {ProductId}: Required={Required}, Available={Available}",
                            @event.DealId, product.Id, dealProduct.Quantity, netAvailable);

                        reservedProducts.Add((product.Name, dealProduct.Quantity, false,
                            $"Insufficient stock: {netAvailable:N2} available, {dealProduct.Quantity:N2} required"));

                        // Don't fail the entire operation, continue with other products
                        continue;
                    }

                    // Generate reservation number
                    var reservationNumber = await _reservationRepository.GenerateReservationNumberAsync(context.CancellationToken);

                    // Create soft reservation for the deal
                    var reservation = new StockReservation(
                        reservationNumber,
                        product.Id,
                        defaultWarehouse.Id,
                        dealProduct.Quantity,
                        ReservationType.SalesOrder,
                        0, // System user
                        DateTime.UtcNow.AddDays(14) // 14 days expiration for deal reservations
                    );

                    reservation.SetReference("CRM-Deal", @event.DealId.ToString(), @event.DealId);
                    reservation.SetNotes($"Auto-reserved for won deal {@event.DealId} - Customer: {@event.CustomerId}");

                    await _reservationRepository.AddAsync(reservation, context.CancellationToken);

                    _logger.LogInformation(
                        "Created stock reservation {ReservationNumber} for deal {DealId}: Product={ProductName}, Quantity={Quantity}",
                        reservationNumber, @event.DealId, product.Name, dealProduct.Quantity);

                    reservedProducts.Add((product.Name, dealProduct.Quantity, true, "Reserved successfully"));
                }
                catch (Exception productEx)
                {
                    _logger.LogError(productEx,
                        "Error processing product {ProductId} for deal {DealId}",
                        dealProduct.ProductId, @event.DealId);

                    reservedProducts.Add((dealProduct.ProductName, dealProduct.Quantity, false, productEx.Message));
                }
            }

            await _unitOfWork.SaveChangesAsync(context.CancellationToken);

            // Log summary
            var successCount = reservedProducts.Count(p => p.Success);
            var failCount = reservedProducts.Count(p => !p.Success);

            _logger.LogInformation(
                "Completed stock reservation for deal {DealId}: {SuccessCount} products reserved, {FailCount} failed",
                @event.DealId, successCount, failCount);

            // Log individual results
            foreach (var result in reservedProducts)
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
            _logger.LogError(ex, "Error processing DealWonEvent for deal {DealId}", @event.DealId);
            throw; // Re-throw to trigger MassTransit retry
        }
    }
}
