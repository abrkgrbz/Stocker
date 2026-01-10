using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region CustomerContract Event Handlers

/// <summary>
/// Müşteri sözleşmesi oluşturulduğunda tetiklenen handler
/// </summary>
public class CustomerContractCreatedEventHandler : INotificationHandler<CustomerContractCreatedDomainEvent>
{
    private readonly ILogger<CustomerContractCreatedEventHandler> _logger;

    public CustomerContractCreatedEventHandler(ILogger<CustomerContractCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerContractCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Müşteri sözleşmesi oluşturuldu: {ContractNumber}, Müşteri: {CustomerName}, Değer: {ContractValue}, Tenant: {TenantId}",
            notification.ContractNumber,
            notification.CustomerName,
            notification.ContractValue,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Müşteri sözleşmesi aktifleştirildiğinde tetiklenen handler
/// </summary>
public class CustomerContractActivatedEventHandler : INotificationHandler<CustomerContractActivatedDomainEvent>
{
    private readonly ILogger<CustomerContractActivatedEventHandler> _logger;

    public CustomerContractActivatedEventHandler(ILogger<CustomerContractActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerContractActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Müşteri sözleşmesi aktifleştirildi: {ContractNumber}, Tenant: {TenantId}",
            notification.ContractNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Müşteri sözleşmesi yenilendiğinde tetiklenen handler
/// </summary>
public class CustomerContractRenewedEventHandler : INotificationHandler<CustomerContractRenewedDomainEvent>
{
    private readonly ILogger<CustomerContractRenewedEventHandler> _logger;

    public CustomerContractRenewedEventHandler(ILogger<CustomerContractRenewedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerContractRenewedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Müşteri sözleşmesi yenilendi: {ContractNumber}, Yeni Bitiş: {NewEndDate}, Yeni Değer: {NewContractValue}, Tenant: {TenantId}",
            notification.ContractNumber,
            notification.NewEndDate,
            notification.NewContractValue,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Müşteri sözleşmesi sona erdiğinde tetiklenen handler
/// </summary>
public class CustomerContractExpiredEventHandler : INotificationHandler<CustomerContractExpiredDomainEvent>
{
    private readonly ILogger<CustomerContractExpiredEventHandler> _logger;

    public CustomerContractExpiredEventHandler(ILogger<CustomerContractExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerContractExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Müşteri sözleşmesi sona erdi: {ContractNumber}, Tenant: {TenantId}",
            notification.ContractNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Müşteri sözleşmesi feshedildiğinde tetiklenen handler
/// </summary>
public class CustomerContractTerminatedEventHandler : INotificationHandler<CustomerContractTerminatedDomainEvent>
{
    private readonly ILogger<CustomerContractTerminatedEventHandler> _logger;

    public CustomerContractTerminatedEventHandler(ILogger<CustomerContractTerminatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerContractTerminatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Müşteri sözleşmesi feshedildi: {ContractNumber}, Sebep: {TerminationReason}, Tenant: {TenantId}",
            notification.ContractNumber,
            notification.TerminationReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
