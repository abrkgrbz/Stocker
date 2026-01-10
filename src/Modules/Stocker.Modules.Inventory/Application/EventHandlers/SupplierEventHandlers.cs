using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Tedarikçi oluşturulduğunda çalışan event handler.
/// </summary>
public class SupplierCreatedEventHandler : INotificationHandler<SupplierCreatedDomainEvent>
{
    private readonly ILogger<SupplierCreatedEventHandler> _logger;

    public SupplierCreatedEventHandler(ILogger<SupplierCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Supplier created: {SupplierCode} ({SupplierName})",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi güncellendiğinde çalışan event handler.
/// </summary>
public class SupplierUpdatedEventHandler : INotificationHandler<SupplierUpdatedDomainEvent>
{
    private readonly ILogger<SupplierUpdatedEventHandler> _logger;

    public SupplierUpdatedEventHandler(ILogger<SupplierUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Supplier updated: {SupplierCode} ({SupplierName}), Tax: {TaxNumber}",
            notification.Code,
            notification.Name,
            notification.TaxNumber ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi kredi bilgileri değiştirildiğinde çalışan event handler.
/// </summary>
public class SupplierCreditInfoChangedEventHandler : INotificationHandler<SupplierCreditInfoChangedDomainEvent>
{
    private readonly ILogger<SupplierCreditInfoChangedEventHandler> _logger;

    public SupplierCreditInfoChangedEventHandler(ILogger<SupplierCreditInfoChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierCreditInfoChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Supplier credit info changed: {SupplierCode}, Credit Limit: {CreditLimit}, Payment Term: {PaymentTerm} days",
            notification.Code,
            notification.CreditLimit,
            notification.PaymentTerm);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi aktifleştirildiğinde çalışan event handler.
/// </summary>
public class SupplierActivatedEventHandler : INotificationHandler<SupplierActivatedDomainEvent>
{
    private readonly ILogger<SupplierActivatedEventHandler> _logger;

    public SupplierActivatedEventHandler(ILogger<SupplierActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Supplier activated: {SupplierCode} ({SupplierName})",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi pasifleştirildiğinde çalışan event handler.
/// Tedarikçi pasifleştirildiğinde satınalma süreçleri etkilenebilir.
/// </summary>
public class SupplierDeactivatedEventHandler : INotificationHandler<SupplierDeactivatedDomainEvent>
{
    private readonly ILogger<SupplierDeactivatedEventHandler> _logger;

    public SupplierDeactivatedEventHandler(ILogger<SupplierDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Supplier deactivated: {SupplierCode} ({SupplierName}). Purchase operations may be affected.",
            notification.Code,
            notification.Name);

        // TODO: Aktif satınalma siparişlerini kontrol et ve uyarı gönder
        // await _purchaseService.CheckActiveOrdersForSupplierAsync(notification.SupplierId, cancellationToken);

        return Task.CompletedTask;
    }
}
