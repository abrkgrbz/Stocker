using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region CallLog Event Handlers

/// <summary>
/// Handler for call log created events
/// </summary>
public sealed class CallLogCreatedEventHandler : INotificationHandler<CallLogCreatedDomainEvent>
{
    private readonly ILogger<CallLogCreatedEventHandler> _logger;

    public CallLogCreatedEventHandler(ILogger<CallLogCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CallLogCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Call log created: {CallLogId} - {CallNumber}, Direction: {Direction}, Type: {CallType}",
            notification.CallLogId,
            notification.CallNumber,
            notification.Direction,
            notification.CallType);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for call started events
/// </summary>
public sealed class CallStartedEventHandler : INotificationHandler<CallStartedDomainEvent>
{
    private readonly ILogger<CallStartedEventHandler> _logger;

    public CallStartedEventHandler(ILogger<CallStartedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CallStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Call started: {CallNumber}, {Direction}: {CallerNumber} → {CalledNumber}",
            notification.CallNumber,
            notification.Direction,
            notification.CallerNumber,
            notification.CalledNumber);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for call ended events
/// </summary>
public sealed class CallEndedEventHandler : INotificationHandler<CallEndedDomainEvent>
{
    private readonly ILogger<CallEndedEventHandler> _logger;

    public CallEndedEventHandler(ILogger<CallEndedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CallEndedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Call ended: {CallNumber}, Status: {Status}, Duration: {DurationSeconds}s, Outcome: {Outcome}",
            notification.CallNumber,
            notification.Status,
            notification.DurationSeconds,
            notification.Outcome ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for call missed events
/// </summary>
public sealed class CallMissedEventHandler : INotificationHandler<CallMissedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<CallMissedEventHandler> _logger;

    public CallMissedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<CallMissedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(CallMissedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Call missed: {CallNumber} from {CallerNumber}, Customer: {CustomerName}",
            notification.CallNumber,
            notification.CallerNumber,
            notification.CustomerName ?? "Unknown");

        if (notification.AssignedToUserId.HasValue)
        {
            await _notificationService.SendCallMissedAsync(
                notification.TenantId,
                notification.CallLogId,
                notification.CallNumber,
                notification.CallerNumber,
                notification.CustomerName,
                notification.AssignedToUserId.Value,
                cancellationToken);
        }
    }
}

/// <summary>
/// Handler for call transferred events
/// </summary>
public sealed class CallTransferredEventHandler : INotificationHandler<CallTransferredDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<CallTransferredEventHandler> _logger;

    public CallTransferredEventHandler(
        ICrmNotificationService notificationService,
        ILogger<CallTransferredEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(CallTransferredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Call transferred: {CallNumber}, From user {FromUserId} → To user {ToUserId}",
            notification.CallNumber,
            notification.TransferredFromUserId,
            notification.TransferredToUserId);

        await _notificationService.SendCallTransferredAsync(
            notification.TenantId,
            notification.CallLogId,
            notification.CallNumber,
            notification.TransferredToUserId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for call recording available events
/// </summary>
public sealed class CallRecordingAvailableEventHandler : INotificationHandler<CallRecordingAvailableDomainEvent>
{
    private readonly ILogger<CallRecordingAvailableEventHandler> _logger;

    public CallRecordingAvailableEventHandler(ILogger<CallRecordingAvailableEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CallRecordingAvailableDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Call recording available: {CallNumber}, Duration: {DurationSeconds}s",
            notification.CallNumber,
            notification.DurationSeconds);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for call scheduled events
/// </summary>
public sealed class CallScheduledEventHandler : INotificationHandler<CallScheduledDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<CallScheduledEventHandler> _logger;

    public CallScheduledEventHandler(
        ICrmNotificationService notificationService,
        ILogger<CallScheduledEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(CallScheduledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Call scheduled: {CallNumber}, Time: {ScheduledTime}, Customer: {CustomerName}",
            notification.CallNumber,
            notification.ScheduledTime,
            notification.CustomerName ?? "Unknown");

        await _notificationService.SendCallScheduledAsync(
            notification.TenantId,
            notification.CallLogId,
            notification.CallNumber,
            notification.ScheduledTime,
            notification.CustomerName,
            notification.AssignedToUserId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for call outcome set events
/// </summary>
public sealed class CallOutcomeSetEventHandler : INotificationHandler<CallOutcomeSetDomainEvent>
{
    private readonly ILogger<CallOutcomeSetEventHandler> _logger;

    public CallOutcomeSetEventHandler(ILogger<CallOutcomeSetEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CallOutcomeSetDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Call outcome set: {CallNumber}, Outcome: {Outcome}, Follow-up: {FollowUpDate}",
            notification.CallNumber,
            notification.Outcome,
            notification.FollowUpDate?.ToString("yyyy-MM-dd") ?? "None");

        return Task.CompletedTask;
    }
}

#endregion
