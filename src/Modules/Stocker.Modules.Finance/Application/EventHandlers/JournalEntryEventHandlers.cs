using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region JournalEntry Event Handlers

/// <summary>
/// Yevmiye kaydı oluşturulduğunda tetiklenen handler
/// </summary>
public class JournalEntryCreatedEventHandler : INotificationHandler<JournalEntryCreatedDomainEvent>
{
    private readonly ILogger<JournalEntryCreatedEventHandler> _logger;

    public JournalEntryCreatedEventHandler(ILogger<JournalEntryCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JournalEntryCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Yevmiye kaydı oluşturuldu: {EntryNumber}, Borç: {TotalDebit}, Alacak: {TotalCredit}, Tenant: {TenantId}",
            notification.EntryNumber,
            notification.TotalDebit,
            notification.TotalCredit,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Yevmiye kaydı onaylandığında tetiklenen handler
/// </summary>
public class JournalEntryApprovedEventHandler : INotificationHandler<JournalEntryApprovedDomainEvent>
{
    private readonly ILogger<JournalEntryApprovedEventHandler> _logger;

    public JournalEntryApprovedEventHandler(ILogger<JournalEntryApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JournalEntryApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Yevmiye kaydı onaylandı: {EntryNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.EntryNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Yevmiye kaydı nakledildiğinde tetiklenen handler
/// </summary>
public class JournalEntryPostedEventHandler : INotificationHandler<JournalEntryPostedDomainEvent>
{
    private readonly ILogger<JournalEntryPostedEventHandler> _logger;

    public JournalEntryPostedEventHandler(ILogger<JournalEntryPostedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JournalEntryPostedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Yevmiye kaydı nakledildi: {EntryNumber}, Nakil Tarihi: {PostedAt}, Tenant: {TenantId}",
            notification.EntryNumber,
            notification.PostedAt,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Yevmiye kaydı iptal edildiğinde tetiklenen handler
/// </summary>
public class JournalEntryCancelledEventHandler : INotificationHandler<JournalEntryCancelledDomainEvent>
{
    private readonly ILogger<JournalEntryCancelledEventHandler> _logger;

    public JournalEntryCancelledEventHandler(ILogger<JournalEntryCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JournalEntryCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Yevmiye kaydı iptal edildi: {EntryNumber}, Sebep: {CancellationReason}, Tenant: {TenantId}",
            notification.EntryNumber,
            notification.CancellationReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Yevmiye kaydı tersine çevrildiğinde tetiklenen handler
/// </summary>
public class JournalEntryReversedEventHandler : INotificationHandler<JournalEntryReversedDomainEvent>
{
    private readonly ILogger<JournalEntryReversedEventHandler> _logger;

    public JournalEntryReversedEventHandler(ILogger<JournalEntryReversedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(JournalEntryReversedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Yevmiye kaydı tersine çevrildi: {EntryNumber}, Ters Kayıt: {ReversalEntryNumber}, Tenant: {TenantId}",
            notification.EntryNumber,
            notification.ReversalEntryNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
