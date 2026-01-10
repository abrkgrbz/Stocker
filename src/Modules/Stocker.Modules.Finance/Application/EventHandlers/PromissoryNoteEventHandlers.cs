using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region PromissoryNote Event Handlers

/// <summary>
/// Senet oluşturulduğunda tetiklenen handler
/// </summary>
public class PromissoryNoteCreatedEventHandler : INotificationHandler<PromissoryNoteCreatedDomainEvent>
{
    private readonly ILogger<PromissoryNoteCreatedEventHandler> _logger;

    public PromissoryNoteCreatedEventHandler(ILogger<PromissoryNoteCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PromissoryNoteCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Senet oluşturuldu: {NoteNumber}, Tip: {NoteType}, Tutar: {Amount} {Currency}, Borçlu: {DebtorName}, Tenant: {TenantId}",
            notification.NoteNumber,
            notification.NoteType,
            notification.Amount,
            notification.Currency,
            notification.DebtorName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Senet tahsil edildiğinde tetiklenen handler
/// </summary>
public class PromissoryNoteCollectedEventHandler : INotificationHandler<PromissoryNoteCollectedDomainEvent>
{
    private readonly ILogger<PromissoryNoteCollectedEventHandler> _logger;

    public PromissoryNoteCollectedEventHandler(ILogger<PromissoryNoteCollectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PromissoryNoteCollectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Senet tahsil edildi: {NoteNumber}, Tutar: {Amount}, Tenant: {TenantId}",
            notification.NoteNumber,
            notification.Amount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Senet protesto edildiğinde tetiklenen handler
/// </summary>
public class PromissoryNoteProtestedEventHandler : INotificationHandler<PromissoryNoteProtestedDomainEvent>
{
    private readonly ILogger<PromissoryNoteProtestedEventHandler> _logger;

    public PromissoryNoteProtestedEventHandler(ILogger<PromissoryNoteProtestedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PromissoryNoteProtestedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Senet protesto edildi: {NoteNumber}, Borçlu: {DebtorName}, Tutar: {Amount}, Sebep: {ProtestReason}, Tenant: {TenantId}",
            notification.NoteNumber,
            notification.DebtorName,
            notification.Amount,
            notification.ProtestReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Senet ciro edildiğinde tetiklenen handler
/// </summary>
public class PromissoryNoteEndorsedEventHandler : INotificationHandler<PromissoryNoteEndorsedDomainEvent>
{
    private readonly ILogger<PromissoryNoteEndorsedEventHandler> _logger;

    public PromissoryNoteEndorsedEventHandler(ILogger<PromissoryNoteEndorsedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PromissoryNoteEndorsedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Senet ciro edildi: {NoteNumber}, Ciro Edilen: {EndorsedTo}, Tenant: {TenantId}",
            notification.NoteNumber,
            notification.EndorsedTo,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
