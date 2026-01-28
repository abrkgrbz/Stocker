using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Application.Services;
using Stocker.Modules.Inventory.Domain.Events;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Domain.Services;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Stok artırıldığında çalışan event handler.
/// - Minimum stok kontrolü yapar
/// </summary>
public class StockIncreasedEventHandler : INotificationHandler<StockIncreasedDomainEvent>
{
    private readonly ILogger<StockIncreasedEventHandler> _logger;

    public StockIncreasedEventHandler(ILogger<StockIncreasedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(StockIncreasedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock increased: Product {ProductId} in Warehouse {WarehouseId}, " +
            "Quantity: {PreviousQty} → {NewQty} (+{IncreasedQty})",
            notification.ProductId,
            notification.WarehouseId,
            notification.PreviousQuantity,
            notification.NewQuantity,
            notification.IncreasedQuantity);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Stok azaltıldığında çalışan event handler.
/// - Minimum stok kontrolü yapar
/// - Gerekirse yeniden sipariş uyarısı oluşturur
/// </summary>
public class StockDecreasedEventHandler : INotificationHandler<StockDecreasedDomainEvent>
{
    private readonly ILogger<StockDecreasedEventHandler> _logger;
    private readonly IStockLevelService _stockLevelService;

    public StockDecreasedEventHandler(
        ILogger<StockDecreasedEventHandler> logger,
        IStockLevelService stockLevelService)
    {
        _logger = logger;
        _stockLevelService = stockLevelService;
    }

    public async Task Handle(StockDecreasedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock decreased: Product {ProductId} in Warehouse {WarehouseId}, " +
            "Quantity: {PreviousQty} → {NewQty} (-{DecreasedQty})",
            notification.ProductId,
            notification.WarehouseId,
            notification.PreviousQuantity,
            notification.NewQuantity,
            notification.DecreasedQuantity);

        // Stok seviyesi kontrolü yap
        await _stockLevelService.CheckProductStockLevelAsync(
            notification.ProductId,
            notification.WarehouseId,
            cancellationToken);
    }
}

/// <summary>
/// Stok düzeltildiğinde çalışan event handler.
/// </summary>
public class StockAdjustedEventHandler : INotificationHandler<StockAdjustedDomainEvent>
{
    private readonly ILogger<StockAdjustedEventHandler> _logger;
    private readonly IStockLevelService _stockLevelService;

    public StockAdjustedEventHandler(
        ILogger<StockAdjustedEventHandler> logger,
        IStockLevelService stockLevelService)
    {
        _logger = logger;
        _stockLevelService = stockLevelService;
    }

    public async Task Handle(StockAdjustedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock adjusted: Product {ProductId} in Warehouse {WarehouseId}, " +
            "Quantity: {PreviousQty} → {NewQty} (Variance: {Variance})",
            notification.ProductId,
            notification.WarehouseId,
            notification.PreviousQuantity,
            notification.NewQuantity,
            notification.Variance);

        // Stok seviyesi kontrolü yap
        await _stockLevelService.CheckProductStockLevelAsync(
            notification.ProductId,
            notification.WarehouseId,
            cancellationToken);
    }
}

/// <summary>
/// Stok lokasyonu değiştiğinde çalışan event handler.
/// - Eski lokasyonun kapasitesini azaltır
/// - Yeni lokasyonun kapasitesini artırır
/// </summary>
public class StockLocationChangedEventHandler : INotificationHandler<StockLocationChangedDomainEvent>
{
    private readonly ILogger<StockLocationChangedEventHandler> _logger;
    private readonly ILocationRepository _locationRepository;

    public StockLocationChangedEventHandler(
        ILogger<StockLocationChangedEventHandler> logger,
        ILocationRepository locationRepository)
    {
        _logger = logger;
        _locationRepository = locationRepository;
    }

    public async Task Handle(StockLocationChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock location changed: Stock {StockId}, Product {ProductId}, " +
            "Location: {PreviousLocationId} → {NewLocationId}, Quantity: {Quantity}",
            notification.StockId,
            notification.ProductId,
            notification.PreviousLocationId,
            notification.NewLocationId,
            notification.Quantity);

        // Eski lokasyonun kapasitesini azalt
        if (notification.PreviousLocationId.HasValue)
        {
            var previousLocation = await _locationRepository.GetByIdAsync(notification.PreviousLocationId.Value, cancellationToken);
            if (previousLocation != null)
            {
                previousLocation.DecreaseUsedCapacity(notification.Quantity);
                _logger.LogDebug(
                    "Decreased capacity of location {LocationId} by {Quantity}",
                    notification.PreviousLocationId.Value,
                    notification.Quantity);
            }
        }

        // Yeni lokasyonun kapasitesini artır
        if (notification.NewLocationId.HasValue)
        {
            var newLocation = await _locationRepository.GetByIdAsync(notification.NewLocationId.Value, cancellationToken);
            if (newLocation != null)
            {
                newLocation.IncreaseUsedCapacity(notification.Quantity);
                _logger.LogDebug(
                    "Increased capacity of location {LocationId} by {Quantity}",
                    notification.NewLocationId.Value,
                    notification.Quantity);
            }
        }
    }
}

/// <summary>
/// Stok minimum seviyenin altına düştüğünde çalışan event handler.
/// - Bildirim gönderir
/// - Yeniden sipariş önerisi oluşturabilir
/// </summary>
public class StockBelowMinimumEventHandler : INotificationHandler<StockBelowMinimumDomainEvent>
{
    private readonly ILogger<StockBelowMinimumEventHandler> _logger;
    private readonly IInventoryNotificationService _notificationService;

    public StockBelowMinimumEventHandler(
        ILogger<StockBelowMinimumEventHandler> logger,
        IInventoryNotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task Handle(StockBelowMinimumDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "STOCK ALERT - Below minimum: Product {ProductCode} ({ProductName}) in Warehouse {WarehouseName}, " +
            "Current: {CurrentQty}, Minimum: {MinimumStock}, Reorder Point: {ReorderPoint}",
            notification.ProductCode,
            notification.ProductName,
            notification.WarehouseName,
            notification.CurrentQuantity,
            notification.MinimumStock,
            notification.ReorderPoint);

        // Bildirim gönder
        await _notificationService.SendLowStockAlertAsync(
            notification.TenantId,
            notification.ProductId,
            notification.ProductName,
            notification.ProductCode,
            notification.WarehouseId,
            notification.WarehouseName,
            notification.CurrentQuantity,
            notification.MinimumStock,
            cancellationToken);
    }
}

/// <summary>
/// Stok son kullanma tarihi yaklaştığında çalışan event handler.
/// </summary>
public class StockExpiringEventHandler : INotificationHandler<StockExpiringDomainEvent>
{
    private readonly ILogger<StockExpiringEventHandler> _logger;
    private readonly IStockAlertNotificationService _stockAlertNotificationService;

    public StockExpiringEventHandler(
        ILogger<StockExpiringEventHandler> logger,
        IStockAlertNotificationService stockAlertNotificationService)
    {
        _logger = logger;
        _stockAlertNotificationService = stockAlertNotificationService;
    }

    public async Task Handle(StockExpiringDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "STOCK ALERT - Expiring soon: Product {ProductCode} ({ProductName}), " +
            "Lot: {LotNumber}, Quantity: {Quantity}, Expires: {ExpiryDate} ({DaysUntilExpiry} days)",
            notification.ProductCode,
            notification.ProductName,
            notification.LotNumber,
            notification.Quantity,
            notification.ExpiryDate,
            notification.DaysUntilExpiry);

        // Son kullanma tarihi bildirimi gönder
        var alert = new ExpiringStockAlertDto
        {
            TenantId = notification.TenantId.ToString(),
            LotBatchId = notification.StockId,
            LotNumber = notification.LotNumber ?? "N/A",
            ProductId = notification.ProductId,
            ProductCode = notification.ProductCode,
            ProductName = notification.ProductName,
            Quantity = notification.Quantity,
            ExpiryDate = notification.ExpiryDate,
            DaysUntilExpiry = notification.DaysUntilExpiry,
            Severity = notification.DaysUntilExpiry <= 7 ? StockAlertSeverity.Critical : StockAlertSeverity.Warning
        };
        await _stockAlertNotificationService.NotifyExpiringStockAsync(alert, cancellationToken);
    }
}
