using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region Invoice Event Handlers

/// <summary>
/// Fatura onaylandığında tetiklenen handler
/// </summary>
public class InvoiceApprovedEventHandler : INotificationHandler<InvoiceApprovedDomainEvent>
{
    private readonly ILogger<InvoiceApprovedEventHandler> _logger;

    public InvoiceApprovedEventHandler(ILogger<InvoiceApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InvoiceApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Fatura onaylandı: {InvoiceNumber}, Onaylayan: {ApprovedByUserId}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.ApprovedByUserId,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Fatura GİB'e gönderildiğinde tetiklenen handler
/// </summary>
public class InvoiceSentToGibEventHandler : INotificationHandler<InvoiceSentToGibDomainEvent>
{
    private readonly ILogger<InvoiceSentToGibEventHandler> _logger;

    public InvoiceSentToGibEventHandler(ILogger<InvoiceSentToGibEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InvoiceSentToGibDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Fatura GİB'e gönderildi: {InvoiceNumber}, UUID: {GibUuid}, Zarf: {GibEnvelopeId}, Alıcı: {ReceiverAlias}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.GibUuid,
            notification.GibEnvelopeId,
            notification.ReceiverAlias,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Fatura GİB tarafından kabul edildiğinde tetiklenen handler
/// </summary>
public class InvoiceAcceptedByGibEventHandler : INotificationHandler<InvoiceAcceptedByGibDomainEvent>
{
    private readonly ILogger<InvoiceAcceptedByGibEventHandler> _logger;

    public InvoiceAcceptedByGibEventHandler(ILogger<InvoiceAcceptedByGibEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InvoiceAcceptedByGibDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Fatura GİB tarafından kabul edildi: {InvoiceNumber}, UUID: {GibUuid}, Durum: {StatusCode} - {StatusDescription}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.GibUuid,
            notification.StatusCode,
            notification.StatusDescription,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Fatura GİB tarafından reddedildiğinde tetiklenen handler
/// </summary>
public class InvoiceRejectedByGibEventHandler : INotificationHandler<InvoiceRejectedByGibDomainEvent>
{
    private readonly ILogger<InvoiceRejectedByGibEventHandler> _logger;

    public InvoiceRejectedByGibEventHandler(ILogger<InvoiceRejectedByGibEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(InvoiceRejectedByGibDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Fatura GİB tarafından reddedildi: {InvoiceNumber}, UUID: {GibUuid}, Kod: {RejectionCode}, Sebep: {RejectionReason}, Tenant: {TenantId}",
            notification.InvoiceNumber,
            notification.GibUuid,
            notification.RejectionCode,
            notification.RejectionReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
