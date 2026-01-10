using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region SalesReturn Event Handlers

/// <summary>
/// Satış iadesi oluşturulduğunda tetiklenen handler
/// </summary>
public class SalesReturnCreatedEventHandler : INotificationHandler<SalesReturnCreatedDomainEvent>
{
    private readonly ILogger<SalesReturnCreatedEventHandler> _logger;

    public SalesReturnCreatedEventHandler(ILogger<SalesReturnCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesReturnCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış iadesi oluşturuldu: {ReturnNumber}, Sebep: {ReturnReason}, Tutar: {TotalAmount}, Tenant: {TenantId}",
            notification.ReturnNumber,
            notification.ReturnReason,
            notification.TotalAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış iadesi onaylandığında tetiklenen handler
/// </summary>
public class SalesReturnApprovedEventHandler : INotificationHandler<SalesReturnApprovedDomainEvent>
{
    private readonly ILogger<SalesReturnApprovedEventHandler> _logger;

    public SalesReturnApprovedEventHandler(ILogger<SalesReturnApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesReturnApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış iadesi onaylandı: {ReturnNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.ReturnNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış iadesi teslim alındığında tetiklenen handler
/// </summary>
public class SalesReturnReceivedEventHandler : INotificationHandler<SalesReturnReceivedDomainEvent>
{
    private readonly ILogger<SalesReturnReceivedEventHandler> _logger;

    public SalesReturnReceivedEventHandler(ILogger<SalesReturnReceivedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesReturnReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış iadesi teslim alındı: {ReturnNumber}, Teslim Alan: {ReceivedBy}, Tenant: {TenantId}",
            notification.ReturnNumber,
            notification.ReceivedBy,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış iadesi için iade yapıldığında tetiklenen handler
/// </summary>
public class SalesReturnRefundedEventHandler : INotificationHandler<SalesReturnRefundedDomainEvent>
{
    private readonly ILogger<SalesReturnRefundedEventHandler> _logger;

    public SalesReturnRefundedEventHandler(ILogger<SalesReturnRefundedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesReturnRefundedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış iadesi için iade yapıldı: {ReturnNumber}, Kredi Notu: {CreditNoteId}, Tutar: {RefundAmount}, Tenant: {TenantId}",
            notification.ReturnNumber,
            notification.CreditNoteId,
            notification.RefundAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış iadesi reddedildiğinde tetiklenen handler
/// </summary>
public class SalesReturnRejectedEventHandler : INotificationHandler<SalesReturnRejectedDomainEvent>
{
    private readonly ILogger<SalesReturnRejectedEventHandler> _logger;

    public SalesReturnRejectedEventHandler(ILogger<SalesReturnRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesReturnRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satış iadesi reddedildi: {ReturnNumber}, Sebep: {RejectionReason}, Tenant: {TenantId}",
            notification.ReturnNumber,
            notification.RejectionReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
