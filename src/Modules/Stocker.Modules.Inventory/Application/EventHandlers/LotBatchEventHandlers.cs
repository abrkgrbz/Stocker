using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Application.IntegrationEvents;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Lot/Parti oluşturulduğunda çalışan event handler.
/// </summary>
public class LotBatchCreatedEventHandler : INotificationHandler<LotBatchCreatedDomainEvent>
{
    private readonly ILogger<LotBatchCreatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public LotBatchCreatedEventHandler(
        ILogger<LotBatchCreatedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(LotBatchCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lot/Batch created: {LotNumber}, Product: {ProductId}, Quantity: {Quantity}, Expiry: {ExpiryDate}",
            notification.LotNumber,
            notification.ProductId,
            notification.InitialQuantity,
            notification.ExpiryDate?.ToString("yyyy-MM-dd") ?? "No expiry");

        // Audit log
        await _auditService.LogLotBatchEventAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            "Created",
            details: $"Initial quantity: {notification.InitialQuantity}, Expiry: {notification.ExpiryDate?.ToString("yyyy-MM-dd") ?? "No expiry"}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateProductLotBatchCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);
    }
}

/// <summary>
/// Lot/Parti teslim alındığında çalışan event handler.
/// </summary>
public class LotBatchReceivedEventHandler : INotificationHandler<LotBatchReceivedDomainEvent>
{
    private readonly ILogger<LotBatchReceivedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public LotBatchReceivedEventHandler(
        ILogger<LotBatchReceivedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(LotBatchReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lot/Batch received: {LotNumber}, Product: {ProductId}, Quantity: {Quantity}, Received: {ReceivedDate}",
            notification.LotNumber,
            notification.ProductId,
            notification.Quantity,
            notification.ReceivedDate);

        // Audit log
        await _auditService.LogLotBatchEventAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            "Received",
            details: $"Quantity: {notification.Quantity}, Received: {notification.ReceivedDate:yyyy-MM-dd}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateLotBatchCacheAsync(
            notification.TenantId,
            notification.LotBatchId,
            cancellationToken);

        await _cacheService.InvalidateProductLotBatchCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);
    }
}

/// <summary>
/// Lot/Parti onaylandığında çalışan event handler.
/// </summary>
public class LotBatchApprovedEventHandler : INotificationHandler<LotBatchApprovedDomainEvent>
{
    private readonly ILogger<LotBatchApprovedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public LotBatchApprovedEventHandler(
        ILogger<LotBatchApprovedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(LotBatchApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lot/Batch approved: {LotNumber}, Product: {ProductId}, Available Quantity: {Quantity}",
            notification.LotNumber,
            notification.ProductId,
            notification.CurrentQuantity);

        // Audit log
        await _auditService.LogLotBatchEventAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            "Approved",
            details: $"Available quantity: {notification.CurrentQuantity}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateLotBatchCacheAsync(
            notification.TenantId,
            notification.LotBatchId,
            cancellationToken);
    }
}

/// <summary>
/// Lot/Parti karantinaya alındığında çalışan event handler.
/// </summary>
public class LotBatchQuarantinedEventHandler : INotificationHandler<LotBatchQuarantinedDomainEvent>
{
    private readonly ILogger<LotBatchQuarantinedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IInventoryNotificationService _notificationService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public LotBatchQuarantinedEventHandler(
        ILogger<LotBatchQuarantinedEventHandler> logger,
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

    public async Task Handle(LotBatchQuarantinedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Lot/Batch quarantined: {LotNumber}, Product: {ProductId}, Reason: {Reason}, Date: {QuarantinedDate}",
            notification.LotNumber,
            notification.ProductId,
            notification.Reason,
            notification.QuarantinedDate);

        // Audit log
        await _auditService.LogLotBatchEventAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            "Quarantined",
            details: $"Reason: {notification.Reason}, Date: {notification.QuarantinedDate:yyyy-MM-dd}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateLotBatchCacheAsync(
            notification.TenantId,
            notification.LotBatchId,
            cancellationToken);

        await _cacheService.InvalidateProductLotBatchCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);

        // Send notification to quality control department
        await _notificationService.SendLotBatchQuarantinedAlertAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            string.Empty, // Product name to be resolved
            notification.Reason,
            cancellationToken);

        // Publish integration event
        await _integrationEventPublisher.PublishAsync(
            new LotBatchQuarantinedIntegrationEvent(
                notification.TenantId,
                notification.LotBatchId,
                notification.LotNumber,
                notification.ProductId,
                string.Empty, // Product code to be resolved
                notification.Reason,
                0), // Quantity to be resolved
            cancellationToken);
    }
}

/// <summary>
/// Lot/Parti karantinadan çıkarıldığında çalışan event handler.
/// </summary>
public class LotBatchReleasedFromQuarantineEventHandler : INotificationHandler<LotBatchReleasedFromQuarantineDomainEvent>
{
    private readonly ILogger<LotBatchReleasedFromQuarantineEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public LotBatchReleasedFromQuarantineEventHandler(
        ILogger<LotBatchReleasedFromQuarantineEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(LotBatchReleasedFromQuarantineDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lot/Batch released from quarantine: {LotNumber}, Product: {ProductId}",
            notification.LotNumber,
            notification.ProductId);

        // Audit log
        await _auditService.LogLotBatchEventAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            "ReleasedFromQuarantine",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateLotBatchCacheAsync(
            notification.TenantId,
            notification.LotBatchId,
            cancellationToken);

        await _cacheService.InvalidateProductLotBatchCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);
    }
}

/// <summary>
/// Lot/Parti reddedildiğinde çalışan event handler.
/// </summary>
public class LotBatchRejectedEventHandler : INotificationHandler<LotBatchRejectedDomainEvent>
{
    private readonly ILogger<LotBatchRejectedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public LotBatchRejectedEventHandler(
        ILogger<LotBatchRejectedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IIntegrationEventPublisher integrationEventPublisher)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _integrationEventPublisher = integrationEventPublisher;
    }

    public async Task Handle(LotBatchRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Lot/Batch rejected: {LotNumber}, Product: {ProductId}, Reason: {Reason}",
            notification.LotNumber,
            notification.ProductId,
            notification.Reason ?? "Not specified");

        // Audit log
        await _auditService.LogLotBatchEventAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            "Rejected",
            details: $"Reason: {notification.Reason ?? "Not specified"}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateLotBatchCacheAsync(
            notification.TenantId,
            notification.LotBatchId,
            cancellationToken);

        await _cacheService.InvalidateProductLotBatchCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);

        // Publish integration event for supplier notification
        await _integrationEventPublisher.PublishAsync(
            new LotBatchRejectedIntegrationEvent(
                notification.TenantId,
                notification.LotBatchId,
                notification.LotNumber,
                notification.ProductId,
                string.Empty, // Product code to be resolved
                notification.Reason,
                0, // Quantity to be resolved
                null), // Supplier ID to be resolved
            cancellationToken);
    }
}

/// <summary>
/// Lot/Parti tüketildiğinde çalışan event handler.
/// </summary>
public class LotBatchConsumedEventHandler : INotificationHandler<LotBatchConsumedDomainEvent>
{
    private readonly ILogger<LotBatchConsumedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public LotBatchConsumedEventHandler(
        ILogger<LotBatchConsumedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(LotBatchConsumedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lot/Batch consumed: {LotNumber}, Product: {ProductId}, Consumed: {ConsumedQuantity}, Remaining: {RemainingQuantity}",
            notification.LotNumber,
            notification.ProductId,
            notification.ConsumedQuantity,
            notification.RemainingQuantity);

        // Audit log
        await _auditService.LogLotBatchEventAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            "Consumed",
            details: $"Consumed: {notification.ConsumedQuantity}, Remaining: {notification.RemainingQuantity}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateLotBatchCacheAsync(
            notification.TenantId,
            notification.LotBatchId,
            cancellationToken);

        await _cacheService.InvalidateProductLotBatchCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);
    }
}

/// <summary>
/// Lot/Parti tamamen tükendiğinde çalışan event handler.
/// </summary>
public class LotBatchExhaustedEventHandler : INotificationHandler<LotBatchExhaustedDomainEvent>
{
    private readonly ILogger<LotBatchExhaustedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public LotBatchExhaustedEventHandler(
        ILogger<LotBatchExhaustedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(LotBatchExhaustedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Lot/Batch exhausted: {LotNumber}, Product: {ProductId}",
            notification.LotNumber,
            notification.ProductId);

        // Audit log
        await _auditService.LogLotBatchEventAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            "Exhausted",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateLotBatchCacheAsync(
            notification.TenantId,
            notification.LotBatchId,
            cancellationToken);

        await _cacheService.InvalidateProductLotBatchCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);
    }
}

/// <summary>
/// Lot/Parti son kullanma tarihi yaklaştığında çalışan event handler.
/// </summary>
public class LotBatchExpiringEventHandler : INotificationHandler<LotBatchExpiringDomainEvent>
{
    private readonly ILogger<LotBatchExpiringEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryNotificationService _notificationService;

    public LotBatchExpiringEventHandler(
        ILogger<LotBatchExpiringEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryNotificationService notificationService)
    {
        _logger = logger;
        _auditService = auditService;
        _notificationService = notificationService;
    }

    public async Task Handle(LotBatchExpiringDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Lot/Batch expiring soon: {LotNumber}, Product: {ProductId}, Expiry: {ExpiryDate}, Days until expiry: {DaysUntilExpiry}",
            notification.LotNumber,
            notification.ProductId,
            notification.ExpiryDate,
            notification.DaysUntilExpiry);

        // Audit log
        await _auditService.LogLotBatchEventAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            "ExpiringWarning",
            details: $"Expiry: {notification.ExpiryDate:yyyy-MM-dd}, Days until expiry: {notification.DaysUntilExpiry}",
            cancellationToken: cancellationToken);

        // Send expiry warning notification
        await _notificationService.SendLotBatchExpiringAlertAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            string.Empty, // Product name to be resolved
            notification.ExpiryDate,
            notification.DaysUntilExpiry,
            0, // Remaining quantity to be resolved
            cancellationToken);
    }
}

/// <summary>
/// Lot/Parti son kullanma tarihi geçtiğinde çalışan event handler.
/// </summary>
public class LotBatchExpiredEventHandler : INotificationHandler<LotBatchExpiredDomainEvent>
{
    private readonly ILogger<LotBatchExpiredEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IInventoryNotificationService _notificationService;
    private readonly IInventoryStockService _stockService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public LotBatchExpiredEventHandler(
        ILogger<LotBatchExpiredEventHandler> logger,
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

    public async Task Handle(LotBatchExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Lot/Batch expired: {LotNumber}, Product: {ProductId}, Expiry: {ExpiryDate}, Remaining Quantity: {RemainingQuantity}",
            notification.LotNumber,
            notification.ProductId,
            notification.ExpiryDate,
            notification.RemainingQuantity);

        // Audit log
        await _auditService.LogLotBatchEventAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            "Expired",
            details: $"Expiry: {notification.ExpiryDate:yyyy-MM-dd}, Remaining quantity: {notification.RemainingQuantity}",
            cancellationToken: cancellationToken);

        // Quarantine expired lot automatically
        await _stockService.QuarantineExpiredLotBatchesAsync(
            notification.TenantId,
            notification.LotBatchId,
            cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateLotBatchCacheAsync(
            notification.TenantId,
            notification.LotBatchId,
            cancellationToken);

        await _cacheService.InvalidateProductLotBatchCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);

        // Send expired notification
        await _notificationService.SendLotBatchExpiredAlertAsync(
            notification.TenantId,
            notification.LotBatchId,
            notification.LotNumber,
            notification.ProductId,
            string.Empty, // Product name to be resolved
            notification.ExpiryDate,
            notification.RemainingQuantity,
            cancellationToken);

        // Publish integration event for Finance module (inventory write-off)
        await _integrationEventPublisher.PublishAsync(
            new LotBatchExpiredIntegrationEvent(
                notification.TenantId,
                notification.LotBatchId,
                notification.LotNumber,
                notification.ProductId,
                string.Empty, // Product code to be resolved
                notification.ExpiryDate,
                notification.RemainingQuantity,
                0), // Estimated value to be calculated
            cancellationToken);
    }
}
