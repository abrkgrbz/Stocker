using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Infrastructure.Metrics;
using Stocker.Modules.Inventory.Domain.Events;
using Stocker.SignalR.Services;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Ürün oluşturulduğunda çalışan event handler.
/// </summary>
public class ProductCreatedEventHandler : INotificationHandler<ProductCreatedDomainEvent>
{
    private readonly ILogger<ProductCreatedEventHandler> _logger;
    private readonly IDomainEventMonitorService? _monitorService;

    public ProductCreatedEventHandler(
        ILogger<ProductCreatedEventHandler> logger,
        IDomainEventMonitorService? monitorService = null)
    {
        _logger = logger;
        _monitorService = monitorService;
    }

    public async Task Handle(ProductCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        using var timer = DomainEventMetrics.StartHandlingTimer("Inventory", "ProductCreated", nameof(ProductCreatedEventHandler));
        DomainEventMetrics.IncrementInProgress("Inventory");

        try
        {
            _logger.LogInformation(
                "Product created: {ProductCode} ({ProductName}), Type: {ProductType}, " +
                "Category: {CategoryId}, UnitPrice: {UnitPrice}",
                notification.Code,
                notification.Name,
                notification.ProductType,
                notification.CategoryId,
                notification.UnitPrice);

            // Record Prometheus metric
            DomainEventMetrics.RecordEventRaised("Inventory", "ProductCreated", "Product", notification.TenantId.ToString());

            // Broadcast to monitoring clients
            if (_monitorService != null)
            {
                await _monitorService.BroadcastDomainEventAsync(new DomainEventInfo(
                    EventType: "ProductCreated",
                    Module: "Inventory",
                    EntityType: "Product",
                    EntityId: notification.ProductId.ToString(),
                    TenantId: notification.TenantId,
                    Summary: $"Ürün oluşturuldu: {notification.Code} - {notification.Name}",
                    Metadata: new Dictionary<string, object>
                    {
                        ["productCode"] = notification.Code,
                        ["productName"] = notification.Name,
                        ["productType"] = notification.ProductType,
                        ["unitPrice"] = notification.UnitPrice
                    }), cancellationToken);
            }

            DomainEventMetrics.RecordEventHandled("Inventory", "ProductCreated", nameof(ProductCreatedEventHandler));
        }
        catch (Exception ex)
        {
            DomainEventMetrics.RecordEventFailed("Inventory", "ProductCreated", nameof(ProductCreatedEventHandler), ex.GetType().Name);
            throw;
        }
        finally
        {
            DomainEventMetrics.DecrementInProgress("Inventory");
        }
    }
}

/// <summary>
/// Ürün güncellendiğinde çalışan event handler.
/// </summary>
public class ProductUpdatedEventHandler : INotificationHandler<ProductUpdatedDomainEvent>
{
    private readonly ILogger<ProductUpdatedEventHandler> _logger;
    private readonly IDomainEventMonitorService? _monitorService;

    public ProductUpdatedEventHandler(
        ILogger<ProductUpdatedEventHandler> logger,
        IDomainEventMonitorService? monitorService = null)
    {
        _logger = logger;
        _monitorService = monitorService;
    }

    public async Task Handle(ProductUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        using var timer = DomainEventMetrics.StartHandlingTimer("Inventory", "ProductUpdated", nameof(ProductUpdatedEventHandler));
        DomainEventMetrics.IncrementInProgress("Inventory");

        try
        {
            _logger.LogInformation(
                "Product updated: {ProductCode} ({ProductName}), CostPrice: {CostPrice}, UnitPrice: {UnitPrice}",
                notification.Code,
                notification.Name,
                notification.CostPrice,
                notification.UnitPrice);

            DomainEventMetrics.RecordEventRaised("Inventory", "ProductUpdated", "Product", notification.TenantId.ToString());

            if (_monitorService != null)
            {
                await _monitorService.BroadcastDomainEventAsync(new DomainEventInfo(
                    EventType: "ProductUpdated",
                    Module: "Inventory",
                    EntityType: "Product",
                    EntityId: notification.ProductId.ToString(),
                    TenantId: notification.TenantId,
                    Summary: $"Ürün güncellendi: {notification.Code} - {notification.Name}",
                    Metadata: new Dictionary<string, object>
                    {
                        ["productCode"] = notification.Code,
                        ["productName"] = notification.Name,
                        ["costPrice"] = notification.CostPrice,
                        ["unitPrice"] = notification.UnitPrice
                    }), cancellationToken);
            }

            DomainEventMetrics.RecordEventHandled("Inventory", "ProductUpdated", nameof(ProductUpdatedEventHandler));
        }
        catch (Exception ex)
        {
            DomainEventMetrics.RecordEventFailed("Inventory", "ProductUpdated", nameof(ProductUpdatedEventHandler), ex.GetType().Name);
            throw;
        }
        finally
        {
            DomainEventMetrics.DecrementInProgress("Inventory");
        }
    }
}

/// <summary>
/// Ürün aktifleştirildiğinde çalışan event handler.
/// </summary>
public class ProductActivatedEventHandler : INotificationHandler<ProductActivatedDomainEvent>
{
    private readonly ILogger<ProductActivatedEventHandler> _logger;
    private readonly IDomainEventMonitorService? _monitorService;

    public ProductActivatedEventHandler(
        ILogger<ProductActivatedEventHandler> logger,
        IDomainEventMonitorService? monitorService = null)
    {
        _logger = logger;
        _monitorService = monitorService;
    }

    public async Task Handle(ProductActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        using var timer = DomainEventMetrics.StartHandlingTimer("Inventory", "ProductActivated", nameof(ProductActivatedEventHandler));

        try
        {
            _logger.LogInformation(
                "Product activated: {ProductCode} ({ProductName})",
                notification.Code,
                notification.Name);

            DomainEventMetrics.RecordEventRaised("Inventory", "ProductActivated", "Product", notification.TenantId.ToString());

            if (_monitorService != null)
            {
                await _monitorService.BroadcastDomainEventAsync(new DomainEventInfo(
                    EventType: "ProductActivated",
                    Module: "Inventory",
                    EntityType: "Product",
                    EntityId: notification.ProductId.ToString(),
                    TenantId: notification.TenantId,
                    Summary: $"Ürün aktifleştirildi: {notification.Code} - {notification.Name}"), cancellationToken);
            }

            DomainEventMetrics.RecordEventHandled("Inventory", "ProductActivated", nameof(ProductActivatedEventHandler));
        }
        catch (Exception ex)
        {
            DomainEventMetrics.RecordEventFailed("Inventory", "ProductActivated", nameof(ProductActivatedEventHandler), ex.GetType().Name);
            throw;
        }
    }
}

/// <summary>
/// Ürün pasifleştirildiğinde çalışan event handler.
/// </summary>
public class ProductDeactivatedEventHandler : INotificationHandler<ProductDeactivatedDomainEvent>
{
    private readonly ILogger<ProductDeactivatedEventHandler> _logger;
    private readonly IDomainEventMonitorService? _monitorService;

    public ProductDeactivatedEventHandler(
        ILogger<ProductDeactivatedEventHandler> logger,
        IDomainEventMonitorService? monitorService = null)
    {
        _logger = logger;
        _monitorService = monitorService;
    }

    public async Task Handle(ProductDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        using var timer = DomainEventMetrics.StartHandlingTimer("Inventory", "ProductDeactivated", nameof(ProductDeactivatedEventHandler));

        try
        {
            _logger.LogWarning(
                "Product deactivated: {ProductCode} ({ProductName}), By: {DeactivatedBy}, Reason: {Reason}",
                notification.Code,
                notification.Name,
                notification.DeactivatedBy,
                notification.Reason ?? "Not specified");

            DomainEventMetrics.RecordEventRaised("Inventory", "ProductDeactivated", "Product", notification.TenantId.ToString());

            if (_monitorService != null)
            {
                await _monitorService.BroadcastDomainEventAsync(new DomainEventInfo(
                    EventType: "ProductDeactivated",
                    Module: "Inventory",
                    EntityType: "Product",
                    EntityId: notification.ProductId.ToString(),
                    TenantId: notification.TenantId,
                    Summary: $"Ürün pasifleştirildi: {notification.Code} - {notification.Name}",
                    Metadata: new Dictionary<string, object>
                    {
                        ["deactivatedBy"] = notification.DeactivatedBy,
                        ["reason"] = notification.Reason ?? "Belirtilmedi"
                    }), cancellationToken);
            }

            DomainEventMetrics.RecordEventHandled("Inventory", "ProductDeactivated", nameof(ProductDeactivatedEventHandler));
        }
        catch (Exception ex)
        {
            DomainEventMetrics.RecordEventFailed("Inventory", "ProductDeactivated", nameof(ProductDeactivatedEventHandler), ex.GetType().Name);
            throw;
        }
    }
}

/// <summary>
/// Ürün stok seviyeleri değiştirildiğinde çalışan event handler.
/// </summary>
public class ProductStockLevelsChangedEventHandler : INotificationHandler<ProductStockLevelsChangedDomainEvent>
{
    private readonly ILogger<ProductStockLevelsChangedEventHandler> _logger;
    private readonly IDomainEventMonitorService? _monitorService;

    public ProductStockLevelsChangedEventHandler(
        ILogger<ProductStockLevelsChangedEventHandler> logger,
        IDomainEventMonitorService? monitorService = null)
    {
        _logger = logger;
        _monitorService = monitorService;
    }

    public async Task Handle(ProductStockLevelsChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        using var timer = DomainEventMetrics.StartHandlingTimer("Inventory", "ProductStockLevelsChanged", nameof(ProductStockLevelsChangedEventHandler));

        try
        {
            _logger.LogInformation(
                "Product stock levels changed: {ProductCode}, Min: {MinimumStock}, Max: {MaximumStock}, " +
                "ReorderPoint: {ReorderPoint}, ReorderQty: {ReorderQuantity}",
                notification.Code,
                notification.MinimumStock,
                notification.MaximumStock,
                notification.ReorderPoint,
                notification.ReorderQuantity);

            DomainEventMetrics.RecordEventRaised("Inventory", "ProductStockLevelsChanged", "Product", notification.TenantId.ToString());

            if (_monitorService != null)
            {
                await _monitorService.BroadcastDomainEventAsync(new DomainEventInfo(
                    EventType: "ProductStockLevelsChanged",
                    Module: "Inventory",
                    EntityType: "Product",
                    EntityId: notification.ProductId.ToString(),
                    TenantId: notification.TenantId,
                    Summary: $"Stok seviyeleri değişti: {notification.Code}",
                    Metadata: new Dictionary<string, object>
                    {
                        ["minimumStock"] = notification.MinimumStock,
                        ["maximumStock"] = notification.MaximumStock,
                        ["reorderPoint"] = notification.ReorderPoint,
                        ["reorderQuantity"] = notification.ReorderQuantity
                    }), cancellationToken);
            }

            DomainEventMetrics.RecordEventHandled("Inventory", "ProductStockLevelsChanged", nameof(ProductStockLevelsChangedEventHandler));
        }
        catch (Exception ex)
        {
            DomainEventMetrics.RecordEventFailed("Inventory", "ProductStockLevelsChanged", nameof(ProductStockLevelsChangedEventHandler), ex.GetType().Name);
            throw;
        }
    }
}
