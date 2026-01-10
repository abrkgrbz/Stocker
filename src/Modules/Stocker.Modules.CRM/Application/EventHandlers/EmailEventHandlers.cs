using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Email Event Handlers

/// <summary>
/// Handler for email sent events
/// </summary>
public sealed class EmailSentEventHandler : INotificationHandler<EmailSentDomainEvent>
{
    private readonly ILogger<EmailSentEventHandler> _logger;

    public EmailSentEventHandler(ILogger<EmailSentEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmailSentDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Email sent: {EmailId} - Subject: {Subject}, To: {ToAddress}",
            notification.EmailId,
            notification.Subject,
            notification.ToAddress);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for email received events
/// </summary>
public sealed class EmailReceivedEventHandler : INotificationHandler<EmailReceivedDomainEvent>
{
    private readonly ILogger<EmailReceivedEventHandler> _logger;

    public EmailReceivedEventHandler(ILogger<EmailReceivedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmailReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Email received: {EmailId} - Subject: {Subject}, From: {FromAddress}",
            notification.EmailId,
            notification.Subject,
            notification.FromAddress);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for email opened events
/// </summary>
public sealed class EmailOpenedEventHandler : INotificationHandler<EmailOpenedDomainEvent>
{
    private readonly ILogger<EmailOpenedEventHandler> _logger;

    public EmailOpenedEventHandler(ILogger<EmailOpenedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmailOpenedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Email opened: {EmailId} - Subject: {Subject}, To: {ToAddress}, Opened at: {OpenedAt}",
            notification.EmailId,
            notification.Subject,
            notification.ToAddress,
            notification.OpenedAt);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for email link clicked events
/// </summary>
public sealed class EmailLinkClickedEventHandler : INotificationHandler<EmailLinkClickedDomainEvent>
{
    private readonly ILogger<EmailLinkClickedEventHandler> _logger;

    public EmailLinkClickedEventHandler(ILogger<EmailLinkClickedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmailLinkClickedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Email link clicked: {EmailId} - Subject: {Subject}, Link: {ClickedLink}",
            notification.EmailId,
            notification.Subject,
            notification.ClickedLink);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for email bounced events
/// </summary>
public sealed class EmailBouncedEventHandler : INotificationHandler<EmailBouncedDomainEvent>
{
    private readonly ILogger<EmailBouncedEventHandler> _logger;

    public EmailBouncedEventHandler(ILogger<EmailBouncedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmailBouncedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Email bounced: {EmailId} - Subject: {Subject}, To: {ToAddress}, Type: {BounceType}, Reason: {BounceReason}",
            notification.EmailId,
            notification.Subject,
            notification.ToAddress,
            notification.BounceType,
            notification.BounceReason);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for email scheduled events
/// </summary>
public sealed class EmailScheduledEventHandler : INotificationHandler<EmailScheduledDomainEvent>
{
    private readonly ILogger<EmailScheduledEventHandler> _logger;

    public EmailScheduledEventHandler(ILogger<EmailScheduledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmailScheduledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Email scheduled: {EmailId} - Subject: {Subject}, To: {ToAddress}, Send time: {ScheduledSendTime}",
            notification.EmailId,
            notification.Subject,
            notification.ToAddress,
            notification.ScheduledSendTime);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for email unsubscribed events
/// </summary>
public sealed class EmailUnsubscribedEventHandler : INotificationHandler<EmailUnsubscribedDomainEvent>
{
    private readonly ILogger<EmailUnsubscribedEventHandler> _logger;

    public EmailUnsubscribedEventHandler(ILogger<EmailUnsubscribedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(EmailUnsubscribedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Email unsubscribed: {EmailAddress}, Contact: {ContactId}",
            notification.EmailAddress,
            notification.ContactId);

        return Task.CompletedTask;
    }
}

#endregion
