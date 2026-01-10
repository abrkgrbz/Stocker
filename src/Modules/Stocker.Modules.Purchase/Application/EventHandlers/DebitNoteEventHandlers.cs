using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region DebitNote Event Handlers

/// <summary>
/// Borç dekontu oluşturulduğunda tetiklenen handler
/// </summary>
public class DebitNoteCreatedEventHandler : INotificationHandler<DebitNoteCreatedDomainEvent>
{
    private readonly ILogger<DebitNoteCreatedEventHandler> _logger;

    public DebitNoteCreatedEventHandler(ILogger<DebitNoteCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DebitNoteCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Borç dekontu oluşturuldu: {DebitNoteNumber}, Tedarikçi: {SupplierName}, Tutar: {Amount} {Currency}, Sebep: {Reason}, Tenant: {TenantId}",
            notification.DebitNoteNumber,
            notification.SupplierName,
            notification.Amount,
            notification.Currency,
            notification.Reason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Borç dekontu onaylandığında tetiklenen handler
/// </summary>
public class DebitNoteApprovedEventHandler : INotificationHandler<DebitNoteApprovedDomainEvent>
{
    private readonly ILogger<DebitNoteApprovedEventHandler> _logger;

    public DebitNoteApprovedEventHandler(ILogger<DebitNoteApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DebitNoteApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Borç dekontu onaylandı: {DebitNoteNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.DebitNoteNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Borç dekontu uygulandığında tetiklenen handler
/// </summary>
public class DebitNoteAppliedEventHandler : INotificationHandler<DebitNoteAppliedDomainEvent>
{
    private readonly ILogger<DebitNoteAppliedEventHandler> _logger;

    public DebitNoteAppliedEventHandler(ILogger<DebitNoteAppliedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DebitNoteAppliedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Borç dekontu uygulandı: {DebitNoteNumber}, Tutar: {Amount}, Tenant: {TenantId}",
            notification.DebitNoteNumber,
            notification.Amount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
