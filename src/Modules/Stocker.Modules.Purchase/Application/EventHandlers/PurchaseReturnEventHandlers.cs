using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region PurchaseReturn Event Handlers

/// <summary>
/// Satın alma iadesi oluşturulduğunda tetiklenen handler
/// </summary>
public class PurchaseReturnCreatedEventHandler : INotificationHandler<PurchaseReturnCreatedDomainEvent>
{
    private readonly ILogger<PurchaseReturnCreatedEventHandler> _logger;

    public PurchaseReturnCreatedEventHandler(ILogger<PurchaseReturnCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseReturnCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma iadesi oluşturuldu: {ReturnNumber}, Sebep: {ReturnReason}, Tutar: {TotalAmount}, Tenant: {TenantId}",
            notification.ReturnNumber,
            notification.ReturnReason,
            notification.TotalAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma iadesi onaylandığında tetiklenen handler
/// </summary>
public class PurchaseReturnApprovedEventHandler : INotificationHandler<PurchaseReturnApprovedDomainEvent>
{
    private readonly ILogger<PurchaseReturnApprovedEventHandler> _logger;

    public PurchaseReturnApprovedEventHandler(ILogger<PurchaseReturnApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseReturnApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma iadesi onaylandı: {ReturnNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.ReturnNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma iadesi gönderildiğinde tetiklenen handler
/// </summary>
public class PurchaseReturnShippedEventHandler : INotificationHandler<PurchaseReturnShippedDomainEvent>
{
    private readonly ILogger<PurchaseReturnShippedEventHandler> _logger;

    public PurchaseReturnShippedEventHandler(ILogger<PurchaseReturnShippedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseReturnShippedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma iadesi gönderildi: {ReturnNumber}, Takip No: {TrackingNumber}, Tenant: {TenantId}",
            notification.ReturnNumber,
            notification.TrackingNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma iadesi alındı teyidi geldiğinde tetiklenen handler
/// </summary>
public class PurchaseReturnReceivedBySupplierEventHandler : INotificationHandler<PurchaseReturnReceivedBySupplierDomainEvent>
{
    private readonly ILogger<PurchaseReturnReceivedBySupplierEventHandler> _logger;

    public PurchaseReturnReceivedBySupplierEventHandler(ILogger<PurchaseReturnReceivedBySupplierEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseReturnReceivedBySupplierDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma iadesi tedarikçiye ulaştı: {ReturnNumber}, Teyit No: {ConfirmationNumber}, Tenant: {TenantId}",
            notification.ReturnNumber,
            notification.ConfirmationNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// İade için kredi notu alındığında tetiklenen handler
/// </summary>
public class PurchaseReturnCreditNoteReceivedEventHandler : INotificationHandler<PurchaseReturnCreditNoteReceivedDomainEvent>
{
    private readonly ILogger<PurchaseReturnCreditNoteReceivedEventHandler> _logger;

    public PurchaseReturnCreditNoteReceivedEventHandler(ILogger<PurchaseReturnCreditNoteReceivedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseReturnCreditNoteReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "İade için kredi notu alındı: {ReturnNumber}, Kredi Notu: {CreditNoteId}, Tutar: {CreditAmount}, Tenant: {TenantId}",
            notification.ReturnNumber,
            notification.CreditNoteId,
            notification.CreditAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
