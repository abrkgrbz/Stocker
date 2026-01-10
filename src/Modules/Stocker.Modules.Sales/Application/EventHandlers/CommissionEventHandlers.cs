using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Commission Event Handlers

/// <summary>
/// Komisyon hesaplandığında tetiklenen handler
/// </summary>
public class CommissionCalculatedEventHandler : INotificationHandler<CommissionCalculatedDomainEvent>
{
    private readonly ILogger<CommissionCalculatedEventHandler> _logger;

    public CommissionCalculatedEventHandler(ILogger<CommissionCalculatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CommissionCalculatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Komisyon hesaplandı: {SalesRepName}, Satış: {SaleAmount}, Oran: %{CommissionRate}, Komisyon: {CommissionAmount}, Tenant: {TenantId}",
            notification.SalesRepName,
            notification.SaleAmount,
            notification.CommissionRate,
            notification.CommissionAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Komisyon onaylandığında tetiklenen handler
/// </summary>
public class CommissionApprovedEventHandler : INotificationHandler<CommissionApprovedDomainEvent>
{
    private readonly ILogger<CommissionApprovedEventHandler> _logger;

    public CommissionApprovedEventHandler(ILogger<CommissionApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CommissionApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Komisyon onaylandı: {CommissionAmount}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.CommissionAmount,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Komisyon ödendiğinde tetiklenen handler
/// </summary>
public class CommissionPaidEventHandler : INotificationHandler<CommissionPaidDomainEvent>
{
    private readonly ILogger<CommissionPaidEventHandler> _logger;

    public CommissionPaidEventHandler(ILogger<CommissionPaidEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CommissionPaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Komisyon ödendi: {SalesRepName}, Tutar: {PaidAmount}, Tenant: {TenantId}",
            notification.SalesRepName,
            notification.PaidAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Komisyon iptal edildiğinde tetiklenen handler
/// </summary>
public class CommissionCancelledEventHandler : INotificationHandler<CommissionCancelledDomainEvent>
{
    private readonly ILogger<CommissionCancelledEventHandler> _logger;

    public CommissionCancelledEventHandler(ILogger<CommissionCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CommissionCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Komisyon iptal edildi: Temsilci: {SalesRepId}, Sebep: {CancellationReason}, Tenant: {TenantId}",
            notification.SalesRepId,
            notification.CancellationReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
