using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region CreditNote Event Handlers

/// <summary>
/// Alacak dekontu oluşturulduğunda tetiklenen handler
/// </summary>
public class CreditNoteCreatedEventHandler : INotificationHandler<CreditNoteCreatedDomainEvent>
{
    private readonly ILogger<CreditNoteCreatedEventHandler> _logger;

    public CreditNoteCreatedEventHandler(ILogger<CreditNoteCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CreditNoteCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Alacak dekontu oluşturuldu: {CreditNoteNumber}, Müşteri: {CustomerName}, Tutar: {Amount} {Currency}, Sebep: {Reason}, Tenant: {TenantId}",
            notification.CreditNoteNumber,
            notification.CustomerName,
            notification.Amount,
            notification.Currency,
            notification.Reason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Alacak dekontu onaylandığında tetiklenen handler
/// </summary>
public class CreditNoteApprovedEventHandler : INotificationHandler<CreditNoteApprovedDomainEvent>
{
    private readonly ILogger<CreditNoteApprovedEventHandler> _logger;

    public CreditNoteApprovedEventHandler(ILogger<CreditNoteApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CreditNoteApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Alacak dekontu onaylandı: {CreditNoteNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.CreditNoteNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Alacak dekontu uygulandığında tetiklenen handler
/// </summary>
public class CreditNoteAppliedEventHandler : INotificationHandler<CreditNoteAppliedDomainEvent>
{
    private readonly ILogger<CreditNoteAppliedEventHandler> _logger;

    public CreditNoteAppliedEventHandler(ILogger<CreditNoteAppliedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CreditNoteAppliedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Alacak dekontu uygulandı: {CreditNoteNumber}, Tutar: {Amount}, Tenant: {TenantId}",
            notification.CreditNoteNumber,
            notification.Amount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Alacak dekontu iptal edildiğinde tetiklenen handler
/// </summary>
public class CreditNoteCancelledEventHandler : INotificationHandler<CreditNoteCancelledDomainEvent>
{
    private readonly ILogger<CreditNoteCancelledEventHandler> _logger;

    public CreditNoteCancelledEventHandler(ILogger<CreditNoteCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CreditNoteCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Alacak dekontu iptal edildi: {CreditNoteNumber}, Sebep: {CancellationReason}, Tenant: {TenantId}",
            notification.CreditNoteNumber,
            notification.CancellationReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
