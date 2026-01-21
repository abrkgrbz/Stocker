using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Depo oluşturulduğunda çalışan event handler.
/// </summary>
public class WarehouseCreatedEventHandler : INotificationHandler<WarehouseCreatedDomainEvent>
{
    private readonly ILogger<WarehouseCreatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;

    public WarehouseCreatedEventHandler(
        ILogger<WarehouseCreatedEventHandler> logger,
        IInventoryAuditService auditService)
    {
        _logger = logger;
        _auditService = auditService;
    }

    public async Task Handle(WarehouseCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Warehouse created: {WarehouseCode} ({WarehouseName}), Branch: {BranchId}",
            notification.Code,
            notification.Name,
            notification.BranchId);

        // Audit log
        await _auditService.LogWarehouseEventAsync(
            notification.TenantId,
            notification.WarehouseId,
            notification.Code,
            "Created",
            details: $"Name: {notification.Name}, Branch: {notification.BranchId}",
            cancellationToken: cancellationToken);
    }
}

/// <summary>
/// Depo güncellendiğinde çalışan event handler.
/// </summary>
public class WarehouseUpdatedEventHandler : INotificationHandler<WarehouseUpdatedDomainEvent>
{
    private readonly ILogger<WarehouseUpdatedEventHandler> _logger;
    private readonly IInventoryAuditService _auditService;

    public WarehouseUpdatedEventHandler(
        ILogger<WarehouseUpdatedEventHandler> logger,
        IInventoryAuditService auditService)
    {
        _logger = logger;
        _auditService = auditService;
    }

    public async Task Handle(WarehouseUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Warehouse updated: {WarehouseCode} ({WarehouseName}), Manager: {Manager}",
            notification.Code,
            notification.Name,
            notification.Manager ?? "Not assigned");

        // Audit log
        await _auditService.LogWarehouseEventAsync(
            notification.TenantId,
            notification.WarehouseId,
            notification.Code,
            "Updated",
            details: $"Name: {notification.Name}, Manager: {notification.Manager ?? "Not assigned"}",
            cancellationToken: cancellationToken);
    }
}

/// <summary>
/// Depo varsayılan olarak ayarlandığında çalışan event handler.
/// </summary>
public class WarehouseSetAsDefaultEventHandler : INotificationHandler<WarehouseSetAsDefaultDomainEvent>
{
    private readonly ILogger<WarehouseSetAsDefaultEventHandler> _logger;

    public WarehouseSetAsDefaultEventHandler(ILogger<WarehouseSetAsDefaultEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarehouseSetAsDefaultDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Warehouse set as default: {WarehouseCode} ({WarehouseName})",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Depo aktifleştirildiğinde çalışan event handler.
/// </summary>
public class WarehouseActivatedEventHandler : INotificationHandler<WarehouseActivatedDomainEvent>
{
    private readonly ILogger<WarehouseActivatedEventHandler> _logger;

    public WarehouseActivatedEventHandler(ILogger<WarehouseActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarehouseActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Warehouse activated: {WarehouseCode} ({WarehouseName})",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Depo pasifleştirildiğinde çalışan event handler.
/// Depo pasifleştirildiğinde ilişkili stok işlemleri etkilenebilir.
/// </summary>
public class WarehouseDeactivatedEventHandler : INotificationHandler<WarehouseDeactivatedDomainEvent>
{
    private readonly ILogger<WarehouseDeactivatedEventHandler> _logger;

    public WarehouseDeactivatedEventHandler(ILogger<WarehouseDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarehouseDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Warehouse deactivated: {WarehouseCode} ({WarehouseName}). Stock operations may be affected.",
            notification.Code,
            notification.Name);

        // TODO: Aktif stok işlemlerini kontrol et ve uyarı gönder
        // await _stockService.CheckActiveOperationsForWarehouseAsync(notification.WarehouseId, cancellationToken);

        return Task.CompletedTask;
    }
}
