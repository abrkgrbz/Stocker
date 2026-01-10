using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Application.IntegrationEvents;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Stok sayımı oluşturulduğunda çalışan event handler.
/// </summary>
public class StockCountCreatedEventHandler : INotificationHandler<StockCountCreatedDomainEvent>
{
    private readonly ILogger<StockCountCreatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public StockCountCreatedEventHandler(
        ILogger<StockCountCreatedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(StockCountCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock count created: {CountNumber}, Warehouse: {WarehouseId}, Type: {CountType}, Items: {ItemCount}",
            notification.CountNumber,
            notification.WarehouseId,
            notification.CountType,
            notification.ItemCount);

        // Audit log
        await _auditService.LogStockCountAsync(
            notification.TenantId,
            notification.StockCountId,
            notification.CountNumber,
            notification.WarehouseId,
            "Created",
            notes: $"Type: {notification.CountType}, Items: {notification.ItemCount}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateWarehouseStockCacheAsync(
            notification.TenantId,
            notification.WarehouseId,
            cancellationToken);
    }
}

/// <summary>
/// Stok sayımı başlatıldığında çalışan event handler.
/// </summary>
public class StockCountStartedEventHandler : INotificationHandler<StockCountStartedDomainEvent>
{
    private readonly ILogger<StockCountStartedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;

    public StockCountStartedEventHandler(
        ILogger<StockCountStartedEventHandler> logger,
        IInventoryAuditService auditService)
    {
        _logger = logger;
        _auditService = auditService;
    }

    public async Task Handle(StockCountStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock count started: {CountNumber}, Started by User: {UserId}, At: {StartedAt}",
            notification.CountNumber,
            notification.CountedByUserId,
            notification.StartedAt);

        // Audit log
        await _auditService.LogStockCountAsync(
            notification.TenantId,
            notification.StockCountId,
            notification.CountNumber,
            notification.WarehouseId,
            "Started",
            performedBy: notification.CountedByUserId.ToString(),
            notes: $"Started at: {notification.StartedAt:yyyy-MM-dd HH:mm:ss}",
            cancellationToken: cancellationToken);
    }
}

/// <summary>
/// Stok sayımı tamamlandığında çalışan event handler.
/// </summary>
public class StockCountCompletedEventHandler : INotificationHandler<StockCountCompletedDomainEvent>
{
    private readonly ILogger<StockCountCompletedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryNotificationService _notificationService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public StockCountCompletedEventHandler(
        ILogger<StockCountCompletedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryNotificationService notificationService,
        IIntegrationEventPublisher integrationEventPublisher)
    {
        _logger = logger;
        _auditService = auditService;
        _notificationService = notificationService;
        _integrationEventPublisher = integrationEventPublisher;
    }

    public async Task Handle(StockCountCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock count completed: {CountNumber}, Total Difference: {TotalDifference}, Items with difference: {ItemsWithDifference}",
            notification.CountNumber,
            notification.TotalDifference,
            notification.ItemsWithDifferenceCount);

        // Audit log
        await _auditService.LogStockCountAsync(
            notification.TenantId,
            notification.StockCountId,
            notification.CountNumber,
            notification.WarehouseId,
            "Completed",
            notes: $"Total difference: {notification.TotalDifference}, Items with discrepancies: {notification.ItemsWithDifferenceCount}",
            cancellationToken: cancellationToken);

        // Send notification to managers
        await _notificationService.SendStockCountCompletedAsync(
            notification.TenantId,
            notification.StockCountId,
            notification.CountNumber,
            notification.WarehouseId,
            string.Empty, // Warehouse name to be resolved
            0, // Total products to be resolved
            notification.ItemsWithDifferenceCount,
            cancellationToken);

        // Publish integration event for other modules
        await _integrationEventPublisher.PublishAsync(
            new StockCountCompletedIntegrationEvent(
                notification.TenantId,
                notification.StockCountId,
                notification.CountNumber,
                notification.WarehouseId,
                DateTime.UtcNow,
                notification.ItemsWithDifferenceCount,
                notification.ItemsWithDifferenceCount,
                notification.TotalDifference > 0 ? notification.TotalDifference : 0,
                notification.TotalDifference < 0 ? Math.Abs(notification.TotalDifference) : 0),
            cancellationToken);
    }
}

/// <summary>
/// Stok sayımı onaylandığında çalışan event handler.
/// </summary>
public class StockCountApprovedEventHandler : INotificationHandler<StockCountApprovedDomainEvent>
{
    private readonly ILogger<StockCountApprovedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryNotificationService _notificationService;

    public StockCountApprovedEventHandler(
        ILogger<StockCountApprovedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryNotificationService notificationService)
    {
        _logger = logger;
        _auditService = auditService;
        _notificationService = notificationService;
    }

    public async Task Handle(StockCountApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock count approved: {CountNumber}, Approved by User: {UserId}, At: {ApprovedAt}",
            notification.CountNumber,
            notification.ApprovedByUserId,
            notification.ApprovedAt);

        // Audit log - using simpler overload without warehouseId
        await _auditService.LogStockCountEventAsync(
            notification.TenantId,
            notification.StockCountId,
            notification.CountNumber,
            "Approved",
            details: $"Approved at: {notification.ApprovedAt:yyyy-MM-dd HH:mm:ss}",
            userId: notification.ApprovedByUserId.ToString(),
            cancellationToken: cancellationToken);

        // Send notification to counting team (using 0 for warehouseId as it's not available in this event)
        await _notificationService.SendStockCountApprovedAsync(
            notification.TenantId,
            notification.StockCountId,
            notification.CountNumber,
            0, // WarehouseId not available in this event
            string.Empty, // Warehouse name to be resolved
            notification.ApprovedByUserId.ToString(),
            cancellationToken);
    }
}

/// <summary>
/// Stok sayımı reddedildiğinde çalışan event handler.
/// </summary>
public class StockCountRejectedEventHandler : INotificationHandler<StockCountRejectedDomainEvent>
{
    private readonly ILogger<StockCountRejectedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryNotificationService _notificationService;

    public StockCountRejectedEventHandler(
        ILogger<StockCountRejectedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryNotificationService notificationService)
    {
        _logger = logger;
        _auditService = auditService;
        _notificationService = notificationService;
    }

    public async Task Handle(StockCountRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Stock count rejected: {CountNumber}, Reason: {Reason}",
            notification.CountNumber,
            notification.Reason ?? "Not specified");

        // Audit log - using simpler overload without warehouseId
        await _auditService.LogStockCountEventAsync(
            notification.TenantId,
            notification.StockCountId,
            notification.CountNumber,
            "Rejected",
            details: $"Reason: {notification.Reason ?? "Not specified"}",
            cancellationToken: cancellationToken);

        // Send notification to counting team (using 0 for warehouseId as it's not available in this event)
        await _notificationService.SendStockCountRejectedAsync(
            notification.TenantId,
            notification.StockCountId,
            notification.CountNumber,
            0, // WarehouseId not available in this event
            string.Empty, // Warehouse name to be resolved
            string.Empty, // Rejected by to be resolved
            notification.Reason,
            cancellationToken);
    }
}

/// <summary>
/// Stok sayımı iptal edildiğinde çalışan event handler.
/// </summary>
public class StockCountCancelledEventHandler : INotificationHandler<StockCountCancelledDomainEvent>
{
    private readonly ILogger<StockCountCancelledEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public StockCountCancelledEventHandler(
        ILogger<StockCountCancelledEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(StockCountCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Stock count cancelled: {CountNumber}, Reason: {Reason}, At: {CancelledAt}",
            notification.CountNumber,
            notification.Reason ?? "Not specified",
            notification.CancelledAt);

        // Audit log - using simpler overload without warehouseId
        await _auditService.LogStockCountEventAsync(
            notification.TenantId,
            notification.StockCountId,
            notification.CountNumber,
            "Cancelled",
            details: $"Reason: {notification.Reason ?? "Not specified"}, At: {notification.CancelledAt:yyyy-MM-dd HH:mm:ss}",
            cancellationToken: cancellationToken);

        // Cache invalidation - invalidate analytics since warehouseId is not available
        await _cacheService.InvalidateAnalyticsCacheAsync(
            notification.TenantId,
            cancellationToken);
    }
}

/// <summary>
/// Stok sayımı düzeltme olarak işlendiğinde çalışan event handler.
/// </summary>
public class StockCountAdjustedEventHandler : INotificationHandler<StockCountAdjustedDomainEvent>
{
    private readonly ILogger<StockCountAdjustedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IInventoryNotificationService _notificationService;
    private readonly IInventoryStockService _stockService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public StockCountAdjustedEventHandler(
        ILogger<StockCountAdjustedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IInventoryNotificationService notificationService,
        IInventoryStockService stockService,
        IIntegrationEventPublisher integrationEventPublisher)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _notificationService = notificationService;
        _stockService = stockService;
        _integrationEventPublisher = integrationEventPublisher;
    }

    public async Task Handle(StockCountAdjustedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Stock count adjustments applied: {CountNumber}, Warehouse: {WarehouseId}, Total Difference: {TotalDifference}",
            notification.CountNumber,
            notification.WarehouseId,
            notification.TotalDifference);

        // Apply stock adjustments
        await _stockService.ApplyStockCountAdjustmentsAsync(
            notification.TenantId,
            notification.StockCountId,
            cancellationToken);

        // Audit log
        await _auditService.LogStockCountAsync(
            notification.TenantId,
            notification.StockCountId,
            notification.CountNumber,
            notification.WarehouseId,
            "Adjusted",
            notes: $"Total difference applied: {notification.TotalDifference}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateWarehouseStockCacheAsync(
            notification.TenantId,
            notification.WarehouseId,
            cancellationToken);

        await _cacheService.InvalidateAnalyticsCacheAsync(
            notification.TenantId,
            cancellationToken);

        // Send notification
        await _notificationService.SendStockAdjustmentAppliedAsync(
            notification.TenantId,
            notification.StockCountId,
            notification.CountNumber,
            notification.WarehouseId,
            string.Empty, // Warehouse name to be resolved
            notification.TotalDifference,
            cancellationToken);

        // Publish integration event for Finance module
        await _integrationEventPublisher.PublishAsync(
            new StockAdjustmentsAppliedIntegrationEvent(
                notification.TenantId,
                notification.StockCountId,
                notification.CountNumber,
                notification.WarehouseId,
                notification.TotalDifference,
                notification.TotalDifference > 0 ? notification.TotalDifference : 0,
                notification.TotalDifference < 0 ? Math.Abs(notification.TotalDifference) : 0,
                new List<StockAdjustmentLineItem>()), // Line items to be populated
            cancellationToken);
    }
}
