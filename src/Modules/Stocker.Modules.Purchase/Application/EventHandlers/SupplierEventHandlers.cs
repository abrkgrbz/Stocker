using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region Supplier Event Handlers

/// <summary>
/// Tedarikçi oluşturulduğunda tetiklenen handler
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
            "Tedarikçi oluşturuldu: {SupplierCode} - {SupplierName}, Vergi No: {TaxNumber}, Tenant: {TenantId}",
            notification.SupplierCode,
            notification.SupplierName,
            notification.TaxNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi güncellendiğinde tetiklenen handler
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
            "Tedarikçi güncellendi: {SupplierCode} - {SupplierName}, Tenant: {TenantId}",
            notification.SupplierCode,
            notification.SupplierName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi aktifleştirildiğinde tetiklenen handler
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
            "Tedarikçi aktifleştirildi: {SupplierCode} - {SupplierName}, Tenant: {TenantId}",
            notification.SupplierCode,
            notification.SupplierName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi pasifleştirildiğinde tetiklenen handler
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
            "Tedarikçi pasifleştirildi: {SupplierCode} - {SupplierName}, Sebep: {DeactivationReason}, Tenant: {TenantId}",
            notification.SupplierCode,
            notification.SupplierName,
            notification.DeactivationReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi kara listeye alındığında tetiklenen handler
/// </summary>
public class SupplierBlacklistedEventHandler : INotificationHandler<SupplierBlacklistedDomainEvent>
{
    private readonly ILogger<SupplierBlacklistedEventHandler> _logger;

    public SupplierBlacklistedEventHandler(ILogger<SupplierBlacklistedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierBlacklistedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Tedarikçi kara listeye alındı: {SupplierCode} - {SupplierName}, Sebep: {BlacklistReason}, Tenant: {TenantId}",
            notification.SupplierCode,
            notification.SupplierName,
            notification.BlacklistReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
