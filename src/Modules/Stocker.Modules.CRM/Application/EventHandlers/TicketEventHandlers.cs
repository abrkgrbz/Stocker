using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Ticket Event Handlers

/// <summary>
/// Handler for ticket created events
/// </summary>
public sealed class TicketCreatedEventHandler : INotificationHandler<TicketCreatedDomainEvent>
{
    private readonly ILogger<TicketCreatedEventHandler> _logger;

    public TicketCreatedEventHandler(ILogger<TicketCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TicketCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Ticket created: {TicketId} - {TicketNumber}, Subject: {Subject}, Priority: {Priority}",
            notification.TicketId,
            notification.TicketNumber,
            notification.Subject,
            notification.Priority);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for ticket assigned events
/// </summary>
public sealed class TicketAssignedEventHandler : INotificationHandler<TicketAssignedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<TicketAssignedEventHandler> _logger;

    public TicketAssignedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<TicketAssignedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TicketAssignedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Ticket assigned: {TicketId} ({TicketNumber}) → User {AssignedToUserId}",
            notification.TicketId,
            notification.TicketNumber,
            notification.AssignedToUserId);

        await _notificationService.SendTicketAssignedAsync(
            notification.TenantId,
            notification.TicketId,
            notification.TicketNumber,
            notification.Subject,
            notification.AssignedToUserId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for ticket status changed events
/// </summary>
public sealed class TicketStatusChangedEventHandler : INotificationHandler<TicketStatusChangedDomainEvent>
{
    private readonly ILogger<TicketStatusChangedEventHandler> _logger;

    public TicketStatusChangedEventHandler(ILogger<TicketStatusChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TicketStatusChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Ticket status changed: {TicketId} - {OldStatus} → {NewStatus}",
            notification.TicketId,
            notification.OldStatus,
            notification.NewStatus);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for ticket priority changed events
/// </summary>
public sealed class TicketPriorityChangedEventHandler : INotificationHandler<TicketPriorityChangedDomainEvent>
{
    private readonly ILogger<TicketPriorityChangedEventHandler> _logger;

    public TicketPriorityChangedEventHandler(ILogger<TicketPriorityChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TicketPriorityChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Ticket priority changed: {TicketId} - {OldPriority} → {NewPriority}",
            notification.TicketId,
            notification.OldPriority,
            notification.NewPriority);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for ticket escalated events
/// </summary>
public sealed class TicketEscalatedEventHandler : INotificationHandler<TicketEscalatedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<TicketEscalatedEventHandler> _logger;

    public TicketEscalatedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<TicketEscalatedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TicketEscalatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Ticket escalated: {TicketId} ({TicketNumber}) → To User {EscalatedToUserId}, Reason: {EscalationReason}",
            notification.TicketId,
            notification.TicketNumber,
            notification.EscalatedToUserId,
            notification.EscalationReason);

        await _notificationService.SendTicketEscalatedAsync(
            notification.TenantId,
            notification.TicketId,
            notification.TicketNumber,
            notification.Subject,
            notification.EscalatedToUserId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for ticket comment added events
/// </summary>
public sealed class TicketCommentAddedEventHandler : INotificationHandler<TicketCommentAddedDomainEvent>
{
    private readonly ILogger<TicketCommentAddedEventHandler> _logger;

    public TicketCommentAddedEventHandler(ILogger<TicketCommentAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TicketCommentAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Ticket comment added: {TicketId} by user {CommentById}, Public: {IsPublic}",
            notification.TicketId,
            notification.CommentById,
            notification.IsPublic);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for ticket resolved events
/// </summary>
public sealed class TicketResolvedEventHandler : INotificationHandler<TicketResolvedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<TicketResolvedEventHandler> _logger;

    public TicketResolvedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<TicketResolvedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TicketResolvedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Ticket resolved: {TicketId} ({TicketNumber}), Resolution: {Resolution}",
            notification.TicketId,
            notification.TicketNumber,
            notification.Resolution ?? "No resolution provided");

        await _notificationService.SendTicketResolvedAsync(
            notification.TenantId,
            notification.TicketId,
            notification.TicketNumber,
            notification.ResolvedById,
            cancellationToken);
    }
}

/// <summary>
/// Handler for ticket closed events
/// </summary>
public sealed class TicketClosedEventHandler : INotificationHandler<TicketClosedDomainEvent>
{
    private readonly ILogger<TicketClosedEventHandler> _logger;

    public TicketClosedEventHandler(ILogger<TicketClosedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TicketClosedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Ticket closed: {TicketId} ({TicketNumber})",
            notification.TicketId,
            notification.TicketNumber);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for ticket reopened events
/// </summary>
public sealed class TicketReopenedEventHandler : INotificationHandler<TicketReopenedDomainEvent>
{
    private readonly ILogger<TicketReopenedEventHandler> _logger;

    public TicketReopenedEventHandler(ILogger<TicketReopenedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TicketReopenedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Ticket reopened: {TicketId} ({TicketNumber}), Reason: {ReopenReason}",
            notification.TicketId,
            notification.TicketNumber,
            notification.ReopenReason ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for ticket SLA breached events
/// </summary>
public sealed class TicketSlaBreachedEventHandler : INotificationHandler<TicketSlaBreachedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<TicketSlaBreachedEventHandler> _logger;

    public TicketSlaBreachedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<TicketSlaBreachedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TicketSlaBreachedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogError(
            "Ticket SLA breached: {TicketId} ({TicketNumber}), SLA Type: {SlaType}, Breach Duration: {BreachDuration}",
            notification.TicketId,
            notification.TicketNumber,
            notification.SlaType,
            notification.BreachDuration);

        await _notificationService.SendTicketSlaBreachedAsync(
            notification.TenantId,
            notification.TicketId,
            notification.TicketNumber,
            notification.SlaType,
            cancellationToken);
    }
}

/// <summary>
/// Handler for ticket SLA warning events
/// </summary>
public sealed class TicketSlaWarningEventHandler : INotificationHandler<TicketSlaWarningDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<TicketSlaWarningEventHandler> _logger;

    public TicketSlaWarningEventHandler(
        ICrmNotificationService notificationService,
        ILogger<TicketSlaWarningEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TicketSlaWarningDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Ticket SLA warning: {TicketId} ({TicketNumber}), SLA Type: {SlaType}, Minutes remaining: {MinutesRemaining}",
            notification.TicketId,
            notification.TicketNumber,
            notification.SlaType,
            notification.MinutesRemaining);

        await _notificationService.SendTicketSlaWarningAsync(
            notification.TenantId,
            notification.TicketId,
            notification.TicketNumber,
            notification.SlaType,
            notification.MinutesRemaining,
            cancellationToken);
    }
}

#endregion
