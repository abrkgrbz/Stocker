using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region SocialMediaProfile Event Handlers

/// <summary>
/// Handler for social media profile added events
/// </summary>
public sealed class SocialMediaProfileAddedEventHandler : INotificationHandler<SocialMediaProfileAddedDomainEvent>
{
    private readonly ILogger<SocialMediaProfileAddedEventHandler> _logger;

    public SocialMediaProfileAddedEventHandler(ILogger<SocialMediaProfileAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SocialMediaProfileAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Social media profile added: {Platform} - {Username}",
            notification.Platform,
            notification.Username ?? notification.ProfileUrl);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for social media profile verified events
/// </summary>
public sealed class SocialMediaProfileVerifiedEventHandler : INotificationHandler<SocialMediaProfileVerifiedDomainEvent>
{
    private readonly ILogger<SocialMediaProfileVerifiedEventHandler> _logger;

    public SocialMediaProfileVerifiedEventHandler(ILogger<SocialMediaProfileVerifiedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SocialMediaProfileVerifiedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Social media profile verified: {Platform} - {Username}",
            notification.Platform,
            notification.Username ?? "Unknown");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for social media metrics updated events
/// </summary>
public sealed class SocialMediaMetricsUpdatedEventHandler : INotificationHandler<SocialMediaMetricsUpdatedDomainEvent>
{
    private readonly ILogger<SocialMediaMetricsUpdatedEventHandler> _logger;

    public SocialMediaMetricsUpdatedEventHandler(ILogger<SocialMediaMetricsUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SocialMediaMetricsUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Social media metrics updated: {Platform} - {Username}, Followers: {Followers}, Engagement: {Engagement}%",
            notification.Platform,
            notification.Username ?? "Unknown",
            notification.FollowerCount ?? 0,
            notification.EngagementRate?.ToString("F2") ?? "Unknown");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for social media interaction tracked events
/// </summary>
public sealed class SocialMediaInteractionTrackedEventHandler : INotificationHandler<SocialMediaInteractionTrackedDomainEvent>
{
    private readonly ILogger<SocialMediaInteractionTrackedEventHandler> _logger;

    public SocialMediaInteractionTrackedEventHandler(ILogger<SocialMediaInteractionTrackedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SocialMediaInteractionTrackedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Social media interaction tracked: {Platform} - {InteractionType}",
            notification.Platform,
            notification.InteractionType);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for social media mention detected events
/// </summary>
public sealed class SocialMediaMentionDetectedEventHandler : INotificationHandler<SocialMediaMentionDetectedDomainEvent>
{
    private readonly ILogger<SocialMediaMentionDetectedEventHandler> _logger;

    public SocialMediaMentionDetectedEventHandler(ILogger<SocialMediaMentionDetectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SocialMediaMentionDetectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Social media mention detected: {Platform} - {MentionType}, Sentiment: {Sentiment}",
            notification.Platform,
            notification.MentionType,
            notification.Sentiment ?? "Unknown");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for social media profile linked events
/// </summary>
public sealed class SocialMediaProfileLinkedEventHandler : INotificationHandler<SocialMediaProfileLinkedDomainEvent>
{
    private readonly ILogger<SocialMediaProfileLinkedEventHandler> _logger;

    public SocialMediaProfileLinkedEventHandler(ILogger<SocialMediaProfileLinkedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SocialMediaProfileLinkedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Social media profile linked: {Platform} - {Username} → {EntityType} {EntityId}",
            notification.Platform,
            notification.Username ?? "Unknown",
            notification.EntityType,
            notification.EntityId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for social media profile inactive events
/// </summary>
public sealed class SocialMediaProfileInactiveEventHandler : INotificationHandler<SocialMediaProfileInactiveDomainEvent>
{
    private readonly ILogger<SocialMediaProfileInactiveEventHandler> _logger;

    public SocialMediaProfileInactiveEventHandler(ILogger<SocialMediaProfileInactiveEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SocialMediaProfileInactiveDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Social media profile inactive: {Platform} - {Username}, Days inactive: {DaysInactive}",
            notification.Platform,
            notification.Username ?? "Unknown",
            notification.DaysInactive);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for social media profile removed events
/// </summary>
public sealed class SocialMediaProfileRemovedEventHandler : INotificationHandler<SocialMediaProfileRemovedDomainEvent>
{
    private readonly ILogger<SocialMediaProfileRemovedEventHandler> _logger;

    public SocialMediaProfileRemovedEventHandler(ILogger<SocialMediaProfileRemovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SocialMediaProfileRemovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Social media profile removed: {Platform} - {Username}",
            notification.Platform,
            notification.Username ?? "Unknown");

        return Task.CompletedTask;
    }
}

#endregion
