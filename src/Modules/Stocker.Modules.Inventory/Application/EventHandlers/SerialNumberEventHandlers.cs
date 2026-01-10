using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Application.IntegrationEvents;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Seri numarası oluşturulduğunda çalışan event handler.
/// </summary>
public class SerialNumberCreatedEventHandler : INotificationHandler<SerialNumberCreatedDomainEvent>
{
    private readonly ILogger<SerialNumberCreatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public SerialNumberCreatedEventHandler(
        ILogger<SerialNumberCreatedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(SerialNumberCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Serial number created: {Serial}, Product: {ProductId}",
            notification.Serial,
            notification.ProductId);

        // Audit log
        await _auditService.LogSerialNumberEventAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            "Created",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateProductSerialNumbersCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);
    }
}

/// <summary>
/// Seri numarası teslim alındığında çalışan event handler.
/// </summary>
public class SerialNumberReceivedEventHandler : INotificationHandler<SerialNumberReceivedDomainEvent>
{
    private readonly ILogger<SerialNumberReceivedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public SerialNumberReceivedEventHandler(
        ILogger<SerialNumberReceivedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(SerialNumberReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Serial number received: {Serial}, Product: {ProductId}, Warehouse: {WarehouseId}, Date: {ReceivedDate}",
            notification.Serial,
            notification.ProductId,
            notification.WarehouseId,
            notification.ReceivedDate);

        // Audit log
        await _auditService.LogSerialNumberEventAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            "Received",
            details: $"Warehouse: {notification.WarehouseId}, Date: {notification.ReceivedDate:yyyy-MM-dd}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateSerialNumberCacheAsync(
            notification.TenantId,
            notification.SerialNumberId,
            cancellationToken);

        // Only invalidate stock cache if warehouse is specified
        if (notification.WarehouseId.HasValue)
        {
            await _cacheService.InvalidateStockCacheAsync(
                notification.TenantId,
                notification.ProductId,
                notification.WarehouseId.Value,
                cancellationToken);
        }
        else
        {
            await _cacheService.InvalidateProductStockCacheAsync(
                notification.TenantId,
                notification.ProductId,
                cancellationToken);
        }
    }
}

/// <summary>
/// Seri numarası rezerve edildiğinde çalışan event handler.
/// </summary>
public class SerialNumberReservedEventHandler : INotificationHandler<SerialNumberReservedDomainEvent>
{
    private readonly ILogger<SerialNumberReservedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public SerialNumberReservedEventHandler(
        ILogger<SerialNumberReservedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(SerialNumberReservedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Serial number reserved: {Serial}, Product: {ProductId}, Sales Order: {SalesOrderId}",
            notification.Serial,
            notification.ProductId,
            notification.SalesOrderId);

        // Audit log
        await _auditService.LogSerialNumberEventAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            "Reserved",
            details: $"Sales Order: {notification.SalesOrderId}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateSerialNumberCacheAsync(
            notification.TenantId,
            notification.SerialNumberId,
            cancellationToken);
    }
}

/// <summary>
/// Seri numarası rezervasyonu serbest bırakıldığında çalışan event handler.
/// </summary>
public class SerialNumberReservationReleasedEventHandler : INotificationHandler<SerialNumberReservationReleasedDomainEvent>
{
    private readonly ILogger<SerialNumberReservationReleasedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public SerialNumberReservationReleasedEventHandler(
        ILogger<SerialNumberReservationReleasedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(SerialNumberReservationReleasedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Serial number reservation released: {Serial}, Product: {ProductId}",
            notification.Serial,
            notification.ProductId);

        // Audit log
        await _auditService.LogSerialNumberEventAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            "ReservationReleased",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateSerialNumberCacheAsync(
            notification.TenantId,
            notification.SerialNumberId,
            cancellationToken);
    }
}

/// <summary>
/// Seri numarası satıldığında çalışan event handler.
/// </summary>
public class SerialNumberSoldEventHandler : INotificationHandler<SerialNumberSoldDomainEvent>
{
    private readonly ILogger<SerialNumberSoldEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public SerialNumberSoldEventHandler(
        ILogger<SerialNumberSoldEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IIntegrationEventPublisher integrationEventPublisher)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _integrationEventPublisher = integrationEventPublisher;
    }

    public async Task Handle(SerialNumberSoldDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Serial number sold: {Serial}, Product: {ProductId}, Customer: {CustomerId}, Order: {SalesOrderId}, Warranty until: {WarrantyEndDate}",
            notification.Serial,
            notification.ProductId,
            notification.CustomerId,
            notification.SalesOrderId,
            notification.WarrantyEndDate?.ToString("yyyy-MM-dd") ?? "No warranty");

        // Audit log
        await _auditService.LogSerialNumberEventAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            "Sold",
            details: $"Customer: {notification.CustomerId}, Order: {notification.SalesOrderId}, Warranty: {notification.WarrantyEndDate?.ToString("yyyy-MM-dd") ?? "None"}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateSerialNumberCacheAsync(
            notification.TenantId,
            notification.SerialNumberId,
            cancellationToken);

        await _cacheService.InvalidateProductSerialNumbersCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);

        // Publish integration event
        await _integrationEventPublisher.PublishAsync(
            new SerialNumberSoldIntegrationEvent(
                notification.TenantId,
                notification.SerialNumberId,
                notification.Serial,
                notification.ProductId,
                string.Empty, // Product code to be resolved
                notification.CustomerId,
                notification.SalesOrderId,
                notification.SoldDate,
                notification.WarrantyEndDate),
            cancellationToken);
    }
}

/// <summary>
/// Seri numarası iade edildiğinde çalışan event handler.
/// </summary>
public class SerialNumberReturnedEventHandler : INotificationHandler<SerialNumberReturnedDomainEvent>
{
    private readonly ILogger<SerialNumberReturnedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IInventoryStockService _stockService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public SerialNumberReturnedEventHandler(
        ILogger<SerialNumberReturnedEventHandler> logger,
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

    public async Task Handle(SerialNumberReturnedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Serial number returned: {Serial}, Product: {ProductId}, Warehouse: {WarehouseId}, Date: {ReturnedDate}",
            notification.Serial,
            notification.ProductId,
            notification.WarehouseId,
            notification.ReturnedDate);

        // Audit log
        await _auditService.LogSerialNumberEventAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            "Returned",
            details: $"Warehouse: {notification.WarehouseId}, Date: {notification.ReturnedDate:yyyy-MM-dd}",
            cancellationToken: cancellationToken);

        // Initiate quality check process
        await _stockService.InitiateQualityCheckAsync(
            notification.TenantId,
            notification.SerialNumberId,
            cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateSerialNumberCacheAsync(
            notification.TenantId,
            notification.SerialNumberId,
            cancellationToken);

        await _cacheService.InvalidateStockCacheAsync(
            notification.TenantId,
            notification.ProductId,
            notification.WarehouseId,
            cancellationToken);

        // Publish integration event
        await _integrationEventPublisher.PublishAsync(
            new SerialNumberReturnedIntegrationEvent(
                notification.TenantId,
                notification.SerialNumberId,
                notification.Serial,
                notification.ProductId,
                string.Empty, // Product code to be resolved
                null, // Customer ID to be resolved
                notification.ReturnedDate,
                null), // Return reason to be resolved
            cancellationToken);
    }
}

/// <summary>
/// Seri numarası arızalı olarak işaretlendiğinde çalışan event handler.
/// </summary>
public class SerialNumberMarkedDefectiveEventHandler : INotificationHandler<SerialNumberMarkedDefectiveDomainEvent>
{
    private readonly ILogger<SerialNumberMarkedDefectiveEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IInventoryNotificationService _notificationService;

    public SerialNumberMarkedDefectiveEventHandler(
        ILogger<SerialNumberMarkedDefectiveEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IInventoryNotificationService notificationService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _notificationService = notificationService;
    }

    public async Task Handle(SerialNumberMarkedDefectiveDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Serial number marked defective: {Serial}, Product: {ProductId}, Reason: {Reason}",
            notification.Serial,
            notification.ProductId,
            notification.Reason ?? "Not specified");

        // Audit log
        await _auditService.LogSerialNumberEventAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            "MarkedDefective",
            details: $"Reason: {notification.Reason ?? "Not specified"}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateSerialNumberCacheAsync(
            notification.TenantId,
            notification.SerialNumberId,
            cancellationToken);

        // Send notification
        await _notificationService.SendSerialNumberDefectiveAlertAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            string.Empty, // Product name to be resolved
            notification.Reason,
            cancellationToken);
    }
}

/// <summary>
/// Seri numarası tamire gönderildiğinde çalışan event handler.
/// </summary>
public class SerialNumberSentToRepairEventHandler : INotificationHandler<SerialNumberSentToRepairDomainEvent>
{
    private readonly ILogger<SerialNumberSentToRepairEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public SerialNumberSentToRepairEventHandler(
        ILogger<SerialNumberSentToRepairEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(SerialNumberSentToRepairDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Serial number sent to repair: {Serial}, Product: {ProductId}",
            notification.Serial,
            notification.ProductId);

        // Audit log
        await _auditService.LogSerialNumberEventAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            "SentToRepair",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateSerialNumberCacheAsync(
            notification.TenantId,
            notification.SerialNumberId,
            cancellationToken);
    }
}

/// <summary>
/// Seri numarası tamiri tamamlandığında çalışan event handler.
/// </summary>
public class SerialNumberRepairCompletedEventHandler : INotificationHandler<SerialNumberRepairCompletedDomainEvent>
{
    private readonly ILogger<SerialNumberRepairCompletedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;

    public SerialNumberRepairCompletedEventHandler(
        ILogger<SerialNumberRepairCompletedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
    }

    public async Task Handle(SerialNumberRepairCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Serial number repair completed: {Serial}, Product: {ProductId}",
            notification.Serial,
            notification.ProductId);

        // Audit log
        await _auditService.LogSerialNumberEventAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            "RepairCompleted",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateSerialNumberCacheAsync(
            notification.TenantId,
            notification.SerialNumberId,
            cancellationToken);
    }
}

/// <summary>
/// Seri numarası hurda olarak işaretlendiğinde çalışan event handler.
/// </summary>
public class SerialNumberScrappedEventHandler : INotificationHandler<SerialNumberScrappedDomainEvent>
{
    private readonly ILogger<SerialNumberScrappedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public SerialNumberScrappedEventHandler(
        ILogger<SerialNumberScrappedEventHandler> logger,
        IInventoryAuditService auditService,
        IInventoryCacheService cacheService,
        IIntegrationEventPublisher integrationEventPublisher)
    {
        _logger = logger;
        _auditService = auditService;
        _cacheService = cacheService;
        _integrationEventPublisher = integrationEventPublisher;
    }

    public async Task Handle(SerialNumberScrappedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Serial number scrapped: {Serial}, Product: {ProductId}, Reason: {Reason}",
            notification.Serial,
            notification.ProductId,
            notification.Reason ?? "Not specified");

        // Audit log
        await _auditService.LogSerialNumberEventAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            "Scrapped",
            details: $"Reason: {notification.Reason ?? "Not specified"}",
            cancellationToken: cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateSerialNumberCacheAsync(
            notification.TenantId,
            notification.SerialNumberId,
            cancellationToken);

        await _cacheService.InvalidateProductSerialNumbersCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);

        // Publish integration event for Finance module (asset write-off)
        await _integrationEventPublisher.PublishAsync(
            new SerialNumberScrappedIntegrationEvent(
                notification.TenantId,
                notification.SerialNumberId,
                notification.Serial,
                notification.ProductId,
                string.Empty, // Product code to be resolved
                notification.Reason,
                null), // Book value to be calculated
            cancellationToken);
    }
}

/// <summary>
/// Seri numarası kayıp olarak işaretlendiğinde çalışan event handler.
/// </summary>
public class SerialNumberLostEventHandler : INotificationHandler<SerialNumberLostDomainEvent>
{
    private readonly ILogger<SerialNumberLostEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;
    private readonly IInventoryCacheService _cacheService;
    private readonly IInventoryNotificationService _notificationService;
    private readonly IInventoryStockService _stockService;
    private readonly IIntegrationEventPublisher _integrationEventPublisher;

    public SerialNumberLostEventHandler(
        ILogger<SerialNumberLostEventHandler> logger,
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

    public async Task Handle(SerialNumberLostDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Serial number marked as lost: {Serial}, Product: {ProductId}, Reason: {Reason}",
            notification.Serial,
            notification.ProductId,
            notification.Reason ?? "Not specified");

        // Audit log
        await _auditService.LogSerialNumberEventAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            "Lost",
            details: $"Reason: {notification.Reason ?? "Not specified"}",
            cancellationToken: cancellationToken);

        // Create inventory loss report
        await _stockService.CreateInventoryLossReportAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            notification.Reason,
            cancellationToken);

        // Cache invalidation
        await _cacheService.InvalidateSerialNumberCacheAsync(
            notification.TenantId,
            notification.SerialNumberId,
            cancellationToken);

        await _cacheService.InvalidateProductSerialNumbersCacheAsync(
            notification.TenantId,
            notification.ProductId,
            cancellationToken);

        // Send notification
        await _notificationService.SendSerialNumberLostAlertAsync(
            notification.TenantId,
            notification.SerialNumberId,
            notification.Serial,
            notification.ProductId,
            string.Empty, // Product name to be resolved
            notification.Reason,
            cancellationToken);

        // Publish integration event
        await _integrationEventPublisher.PublishAsync(
            new SerialNumberLostIntegrationEvent(
                notification.TenantId,
                notification.SerialNumberId,
                notification.Serial,
                notification.ProductId,
                string.Empty, // Product code to be resolved
                notification.Reason,
                null), // Book value to be calculated
            cancellationToken);
    }
}
