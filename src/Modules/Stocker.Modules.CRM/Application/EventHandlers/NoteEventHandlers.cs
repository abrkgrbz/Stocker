using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Note Event Handlers

/// <summary>
/// Handler for note created events
/// </summary>
public sealed class NoteCreatedEventHandler : INotificationHandler<NoteCreatedDomainEvent>
{
    private readonly ILogger<NoteCreatedEventHandler> _logger;

    public NoteCreatedEventHandler(ILogger<NoteCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(NoteCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Note created: {NoteId} for {RelatedEntityType} {RelatedEntityId}",
            notification.NoteId,
            notification.RelatedEntityType,
            notification.RelatedEntityId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for note updated events
/// </summary>
public sealed class NoteUpdatedEventHandler : INotificationHandler<NoteUpdatedDomainEvent>
{
    private readonly ILogger<NoteUpdatedEventHandler> _logger;

    public NoteUpdatedEventHandler(ILogger<NoteUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(NoteUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Note updated: {NoteId} by user {UpdatedById}",
            notification.NoteId,
            notification.UpdatedById);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for note deleted events
/// </summary>
public sealed class NoteDeletedEventHandler : INotificationHandler<NoteDeletedDomainEvent>
{
    private readonly ILogger<NoteDeletedEventHandler> _logger;

    public NoteDeletedEventHandler(ILogger<NoteDeletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(NoteDeletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Note deleted: {NoteId} by user {DeletedById}",
            notification.NoteId,
            notification.DeletedById);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for note pinned events
/// </summary>
public sealed class NotePinnedEventHandler : INotificationHandler<NotePinnedDomainEvent>
{
    private readonly ILogger<NotePinnedEventHandler> _logger;

    public NotePinnedEventHandler(ILogger<NotePinnedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(NotePinnedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Note pinned: {NoteId} for {RelatedEntityType} {RelatedEntityId}",
            notification.NoteId,
            notification.RelatedEntityType,
            notification.RelatedEntityId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for note user mentioned events
/// </summary>
public sealed class NoteUserMentionedEventHandler : INotificationHandler<NoteUserMentionedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<NoteUserMentionedEventHandler> _logger;

    public NoteUserMentionedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<NoteUserMentionedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(NoteUserMentionedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "User mentioned in note: {NoteId}, Mentioned user: {MentionedUserId}, By: {MentionedById}",
            notification.NoteId,
            notification.MentionedUserId,
            notification.MentionedById);

        await _notificationService.SendUserMentionedInNoteAsync(
            notification.TenantId,
            notification.NoteId,
            notification.MentionedUserId,
            notification.MentionedById,
            cancellationToken);
    }
}

#endregion
