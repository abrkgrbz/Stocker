using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Application.IntegrationEvents;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Dönemsel sayım planı oluşturulduğunda çalışan event handler.
/// </summary>
public class CycleCountCreatedEventHandler : INotificationHandler<CycleCountCreatedDomainEvent>
{
    private readonly ILogger<CycleCountCreatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryNotificationService _notificationService;

    public CycleCountCreatedEventHandler(
        ILogger<CycleCountCreatedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryNotificationService notificationService)
    {
        _logger = logger;
        _auditService = auditService;
        _notificationService = notificationService;
    }

    public async Task Handle(CycleCountCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Cycle count plan created: {PlanNumber} ({PlanName}), Warehouse: {WarehouseId}, Type: {CountType}, Scheduled: {ScheduledDate}",
            notification.PlanNumber,
            notification.PlanName,
            notification.WarehouseId,
            notification.CountType,
            notification.ScheduledStartDate);

        // Audit log
        await _auditService.LogStockCountEventAsync(
            notification.TenantId,
            notification.CycleCountId,
            notification.PlanNumber,
            "CycleCountCreated",
            details: $"Plan: {notification.PlanName}, Type: {notification.CountType}, Warehouse: {notification.WarehouseId}",
            cancellationToken: cancellationToken);

        // Notify warehouse staff about upcoming cycle count
        await _notificationService.NotifyStockCountScheduledAsync(
            notification.TenantId,
            notification.CycleCountId,
            notification.PlanNumber,
            notification.WarehouseId,
            notification.ScheduledStartDate,
            cancellationToken);
    }
}

/// <summary>
/// Dönemsel sayım başlatıldığında çalışan event handler.
/// </summary>
public class CycleCountStartedEventHandler : INotificationHandler<CycleCountStartedDomainEvent>
{
    private readonly ILogger<CycleCountStartedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IInventoryNotificationService _notificationService;

    public CycleCountStartedEventHandler(
        ILogger<CycleCountStartedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IInventoryNotificationService notificationService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _notificationService = notificationService;
    }

    public async Task Handle(CycleCountStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Cycle count started: {PlanNumber}, Warehouse: {WarehouseId}, Total Items: {TotalItems}, Started: {ActualStartDate}",
            notification.PlanNumber,
            notification.WarehouseId,
            notification.TotalItems,
            notification.ActualStartDate);

        // Audit log
        await _auditService.LogStockCountEventAsync(
            notification.TenantId,
            notification.CycleCountId,
            notification.PlanNumber,
            "CycleCountStarted",
            details: $"Total Items: {notification.TotalItems}, Started: {notification.ActualStartDate}",
            cancellationToken: cancellationToken);

        // Invalidate warehouse stock cache during counting
        await _cacheService.InvalidateWarehouseStockCacheAsync(
            notification.TenantId,
            notification.WarehouseId,
            cancellationToken);

        // Notify management that cycle count has started
        await _notificationService.NotifyStockCountStartedAsync(
            notification.TenantId,
            notification.CycleCountId,
            notification.PlanNumber,
            notification.WarehouseId,
            cancellationToken);
    }
}

/// <summary>
/// Dönemsel sayım tamamlandığında çalışan event handler.
/// </summary>
public class CycleCountCompletedEventHandler : INotificationHandler<CycleCountCompletedDomainEvent>
{
    private readonly ILogger<CycleCountCompletedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IInventoryNotificationService _notificationService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public CycleCountCompletedEventHandler(
        ILogger<CycleCountCompletedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IInventoryNotificationService notificationService,
        IIntegrationEventPublisher integrationEventPublisher)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _notificationService = notificationService;
        _integrationEventPublisher = integrationEventPublisher;
    }

    public async Task Handle(CycleCountCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Cycle count completed: {PlanNumber}, Total: {TotalItems}, Counted: {CountedItems}, Variance: {ItemsWithVariance}, Accuracy: {AccuracyPercent}%",
            notification.PlanNumber,
            notification.TotalItems,
            notification.CountedItems,
            notification.ItemsWithVariance,
            notification.AccuracyPercent);

        // Audit log
        await _auditService.LogStockCountEventAsync(
            notification.TenantId,
            notification.CycleCountId,
            notification.PlanNumber,
            "CycleCountCompleted",
            details: $"Total: {notification.TotalItems}, Counted: {notification.CountedItems}, " +
                    $"Variance Items: {notification.ItemsWithVariance}, Accuracy: {notification.AccuracyPercent}%",
            cancellationToken: cancellationToken);

        // Invalidate analytics cache
        await _cacheService.InvalidateAnalyticsCacheAsync(
            notification.TenantId,
            cancellationToken);

        // Notify management about cycle count completion
        await _notificationService.NotifyStockCountCompletedAsync(
            notification.TenantId,
            notification.CycleCountId,
            notification.PlanNumber,
            notification.ItemsWithVariance,
            notification.AccuracyPercent,
            cancellationToken);

        // Publish integration event for other modules
        await _integrationEventPublisher.PublishAsync(
            new StockCountCompletedIntegrationEvent(
                notification.TenantId,
                notification.CycleCountId,
                notification.PlanNumber,
                notification.WarehouseId,
                notification.ActualEndDate,
                notification.TotalItems,
                notification.ItemsWithVariance,
                0m, // TotalPositiveDifference - to be calculated if needed
                0m), // TotalNegativeDifference - to be calculated if needed
            cancellationToken);
    }
}

/// <summary>
/// Dönemsel sayım onaylandığında çalışan event handler.
/// </summary>
public class CycleCountApprovedEventHandler : INotificationHandler<CycleCountApprovedDomainEvent>
{
    private readonly ILogger<CycleCountApprovedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryNotificationService _notificationService;

    public CycleCountApprovedEventHandler(
        ILogger<CycleCountApprovedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryNotificationService notificationService)
    {
        _logger = logger;
        _auditService = auditService;
        _notificationService = notificationService;
    }

    public async Task Handle(CycleCountApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Cycle count approved: {PlanNumber}, Approved by: {ApprovedBy}, At: {ApprovedDate}",
            notification.PlanNumber,
            notification.ApprovedBy,
            notification.ApprovedDate);

        // Audit log
        await _auditService.LogStockCountEventAsync(
            notification.TenantId,
            notification.CycleCountId,
            notification.PlanNumber,
            "CycleCountApproved",
            details: $"Approved by: {notification.ApprovedBy}",
            userId: notification.ApprovedBy,
            cancellationToken: cancellationToken);

        // Notify relevant parties about approval
        await _notificationService.NotifyStockCountApprovedAsync(
            notification.TenantId,
            notification.CycleCountId,
            notification.PlanNumber,
            notification.ApprovedBy,
            cancellationToken);
    }
}

/// <summary>
/// Dönemsel sayım iptal edildiğinde çalışan event handler.
/// </summary>
public class CycleCountCancelledEventHandler : INotificationHandler<CycleCountCancelledDomainEvent>
{
    private readonly ILogger<CycleCountCancelledEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IInventoryNotificationService _notificationService;

    public CycleCountCancelledEventHandler(
        ILogger<CycleCountCancelledEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IInventoryNotificationService notificationService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _notificationService = notificationService;
    }

    public async Task Handle(CycleCountCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Cycle count cancelled: {PlanNumber}, Reason: {Reason}",
            notification.PlanNumber,
            notification.Reason);

        // Audit log
        await _auditService.LogStockCountEventAsync(
            notification.TenantId,
            notification.CycleCountId,
            notification.PlanNumber,
            "CycleCountCancelled",
            details: $"Reason: {notification.Reason}",
            cancellationToken: cancellationToken);

        // Invalidate any cached cycle count data
        await _cacheService.InvalidateAnalyticsCacheAsync(
            notification.TenantId,
            cancellationToken);

        // Notify relevant parties about cancellation
        await _notificationService.NotifyStockCountCancelledAsync(
            notification.TenantId,
            notification.CycleCountId,
            notification.PlanNumber,
            notification.Reason,
            cancellationToken);
    }
}

/// <summary>
/// Dönemsel sayım işlendiğinde çalışan event handler.
/// </summary>
public class CycleCountProcessedEventHandler : INotificationHandler<CycleCountProcessedDomainEvent>
{
    private readonly ILogger<CycleCountProcessedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IInventoryStockService _stockService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public CycleCountProcessedEventHandler(
        ILogger<CycleCountProcessedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IInventoryStockService stockService,
        IIntegrationEventPublisher integrationEventPublisher)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _stockService = stockService;
        _integrationEventPublisher = integrationEventPublisher;
    }

    public async Task Handle(CycleCountProcessedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Cycle count processed: {PlanNumber}, Warehouse: {WarehouseId}, Items with variance adjusted: {ItemsWithVariance}",
            notification.PlanNumber,
            notification.WarehouseId,
            notification.ItemsWithVariance);

        // Audit log
        await _auditService.LogStockCountEventAsync(
            notification.TenantId,
            notification.CycleCountId,
            notification.PlanNumber,
            "CycleCountProcessed",
            details: $"Warehouse: {notification.WarehouseId}, Variance Items: {notification.ItemsWithVariance}",
            cancellationToken: cancellationToken);

        // Apply stock adjustments from cycle count
        await _stockService.ApplyCycleCountAdjustmentsAsync(
            notification.TenantId,
            notification.CycleCountId,
            cancellationToken);

        // Invalidate warehouse stock cache
        await _cacheService.InvalidateWarehouseStockCacheAsync(
            notification.TenantId,
            notification.WarehouseId,
            cancellationToken);

        // Invalidate analytics cache
        await _cacheService.InvalidateAnalyticsCacheAsync(
            notification.TenantId,
            cancellationToken);

        // Publish integration event for other modules (e.g., accounting for inventory valuation)
        await _integrationEventPublisher.PublishAsync(
            new StockAdjustedIntegrationEvent(
                notification.TenantId,
                notification.WarehouseId,
                0, // ProductId not applicable for cycle count
                0, // OldQuantity not applicable
                0, // NewQuantity not applicable
                "CycleCountAdjustment",
                $"Cycle count {notification.PlanNumber} processed with {notification.ItemsWithVariance} variance items"),
            cancellationToken);
    }
}
