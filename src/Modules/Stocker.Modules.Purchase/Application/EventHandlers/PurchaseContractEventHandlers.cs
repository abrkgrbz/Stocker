using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region PurchaseContract Event Handlers

/// <summary>
/// Satın alma sözleşmesi oluşturulduğunda tetiklenen handler
/// </summary>
public class PurchaseContractCreatedEventHandler : INotificationHandler<PurchaseContractCreatedDomainEvent>
{
    private readonly ILogger<PurchaseContractCreatedEventHandler> _logger;

    public PurchaseContractCreatedEventHandler(ILogger<PurchaseContractCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseContractCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma sözleşmesi oluşturuldu: {ContractNumber}, Tedarikçi: {SupplierName}, Değer: {ContractValue}, Tenant: {TenantId}",
            notification.ContractNumber,
            notification.SupplierName,
            notification.ContractValue,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma sözleşmesi aktifleştirildiğinde tetiklenen handler
/// </summary>
public class PurchaseContractActivatedEventHandler : INotificationHandler<PurchaseContractActivatedDomainEvent>
{
    private readonly ILogger<PurchaseContractActivatedEventHandler> _logger;

    public PurchaseContractActivatedEventHandler(ILogger<PurchaseContractActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseContractActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma sözleşmesi aktifleştirildi: {ContractNumber}, Tenant: {TenantId}",
            notification.ContractNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma sözleşmesi yenilendiğinde tetiklenen handler
/// </summary>
public class PurchaseContractRenewedEventHandler : INotificationHandler<PurchaseContractRenewedDomainEvent>
{
    private readonly ILogger<PurchaseContractRenewedEventHandler> _logger;

    public PurchaseContractRenewedEventHandler(ILogger<PurchaseContractRenewedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseContractRenewedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma sözleşmesi yenilendi: {ContractNumber}, Yeni Bitiş: {NewEndDate}, Yeni Değer: {NewContractValue}, Tenant: {TenantId}",
            notification.ContractNumber,
            notification.NewEndDate,
            notification.NewContractValue,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma sözleşmesi sona erdiğinde tetiklenen handler
/// </summary>
public class PurchaseContractExpiredEventHandler : INotificationHandler<PurchaseContractExpiredDomainEvent>
{
    private readonly ILogger<PurchaseContractExpiredEventHandler> _logger;

    public PurchaseContractExpiredEventHandler(ILogger<PurchaseContractExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseContractExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satın alma sözleşmesi sona erdi: {ContractNumber}, Tenant: {TenantId}",
            notification.ContractNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma sözleşmesi feshedildiğinde tetiklenen handler
/// </summary>
public class PurchaseContractTerminatedEventHandler : INotificationHandler<PurchaseContractTerminatedDomainEvent>
{
    private readonly ILogger<PurchaseContractTerminatedEventHandler> _logger;

    public PurchaseContractTerminatedEventHandler(ILogger<PurchaseContractTerminatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseContractTerminatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satın alma sözleşmesi feshedildi: {ContractNumber}, Sebep: {TerminationReason}, Tenant: {TenantId}",
            notification.ContractNumber,
            notification.TerminationReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
