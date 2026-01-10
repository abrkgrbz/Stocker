using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Depo oluşturulduğunda çalışan event handler.
/// </summary>
public class WarehouseCreatedEventHandler : INotificationHandler<WarehouseCreatedDomainEvent>
{
    private readonly ILogger<WarehouseCreatedEventHandler> _logger;

    public WarehouseCreatedEventHandler(ILogger<WarehouseCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarehouseCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Warehouse created: {WarehouseCode} ({WarehouseName}), Branch: {BranchId}",
            notification.Code,
            notification.Name,
            notification.BranchId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Depo güncellendiğinde çalışan event handler.
/// </summary>
public class WarehouseUpdatedEventHandler : INotificationHandler<WarehouseUpdatedDomainEvent>
{
    private readonly ILogger<WarehouseUpdatedEventHandler> _logger;

    public WarehouseUpdatedEventHandler(ILogger<WarehouseUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(WarehouseUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Warehouse updated: {WarehouseCode} ({WarehouseName}), Manager: {Manager}",
            notification.Code,
            notification.Name,
            notification.Manager ?? "Not assigned");

        return Task.CompletedTask;
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
