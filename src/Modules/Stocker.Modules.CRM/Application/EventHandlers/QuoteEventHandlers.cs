using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Quote Event Handlers

/// <summary>
/// Handler for quote created events
/// </summary>
public sealed class QuoteCreatedEventHandler : INotificationHandler<QuoteCreatedDomainEvent>
{
    private readonly ILogger<QuoteCreatedEventHandler> _logger;

    public QuoteCreatedEventHandler(ILogger<QuoteCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QuoteCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Quote created: {QuoteId} - {QuoteNumber} ({QuoteName}) for {AccountName}, Total: {TotalAmount:C}",
            notification.QuoteId,
            notification.QuoteNumber,
            notification.QuoteName,
            notification.AccountName ?? "N/A",
            notification.TotalAmount);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for quote sent events
/// </summary>
public sealed class QuoteSentEventHandler : INotificationHandler<QuoteSentDomainEvent>
{
    private readonly ILogger<QuoteSentEventHandler> _logger;

    public QuoteSentEventHandler(ILogger<QuoteSentEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QuoteSentDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Quote sent: {QuoteId} - {QuoteNumber} to {AccountName}",
            notification.QuoteId,
            notification.QuoteNumber,
            notification.AccountName ?? "N/A");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for quote approved events
/// </summary>
public sealed class QuoteApprovedEventHandler : INotificationHandler<QuoteApprovedDomainEvent>
{
    private readonly ILogger<QuoteApprovedEventHandler> _logger;

    public QuoteApprovedEventHandler(ILogger<QuoteApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QuoteApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Quote approved: {QuoteId} - {QuoteNumber} by {ApprovedByName}",
            notification.QuoteId,
            notification.QuoteNumber,
            notification.ApprovedByName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for quote rejected events
/// </summary>
public sealed class QuoteRejectedEventHandler : INotificationHandler<QuoteRejectedDomainEvent>
{
    private readonly ILogger<QuoteRejectedEventHandler> _logger;

    public QuoteRejectedEventHandler(ILogger<QuoteRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QuoteRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Quote rejected: {QuoteId} - {QuoteNumber}, Reason: {RejectionReason}",
            notification.QuoteId,
            notification.QuoteNumber,
            notification.RejectionReason);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for quote accepted events
/// </summary>
public sealed class QuoteAcceptedEventHandler : INotificationHandler<QuoteAcceptedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<QuoteAcceptedEventHandler> _logger;

    public QuoteAcceptedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<QuoteAcceptedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(QuoteAcceptedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Quote accepted: {QuoteId} - {QuoteNumber} by customer",
            notification.QuoteId,
            notification.QuoteNumber);

        await _notificationService.SendQuoteAcceptedAsync(
            notification.TenantId,
            notification.QuoteId,
            notification.QuoteNumber,
            notification.OwnerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for quote expired events
/// </summary>
public sealed class QuoteExpiredEventHandler : INotificationHandler<QuoteExpiredDomainEvent>
{
    private readonly ILogger<QuoteExpiredEventHandler> _logger;

    public QuoteExpiredEventHandler(ILogger<QuoteExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QuoteExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Quote expired: {QuoteId} - {QuoteNumber}",
            notification.QuoteId,
            notification.QuoteNumber);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for quote expiring events
/// </summary>
public sealed class QuoteExpiringEventHandler : INotificationHandler<QuoteExpiringDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<QuoteExpiringEventHandler> _logger;

    public QuoteExpiringEventHandler(
        ICrmNotificationService notificationService,
        ILogger<QuoteExpiringEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(QuoteExpiringDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Quote expiring: {QuoteId} - {QuoteNumber}, Expires: {ExpirationDate}, Days remaining: {DaysRemaining}",
            notification.QuoteId,
            notification.QuoteNumber,
            notification.ExpirationDate,
            notification.DaysRemaining);

        await _notificationService.SendQuoteExpiringSoonAsync(
            notification.TenantId,
            notification.QuoteId,
            notification.QuoteNumber,
            notification.OwnerId,
            notification.ExpirationDate,
            cancellationToken);
    }
}

/// <summary>
/// Handler for quote converted events
/// </summary>
public sealed class QuoteConvertedEventHandler : INotificationHandler<QuoteConvertedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<QuoteConvertedEventHandler> _logger;

    public QuoteConvertedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<QuoteConvertedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(QuoteConvertedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Quote converted: Quote {QuoteId} ({QuoteNumber}) → {ConvertedToType} {ConvertedToId}",
            notification.QuoteId,
            notification.QuoteNumber,
            notification.ConvertedToType,
            notification.ConvertedToId);

        await _notificationService.SendQuoteConvertedAsync(
            notification.TenantId,
            notification.QuoteId,
            notification.QuoteNumber,
            notification.ConvertedToId,
            cancellationToken);
    }
}

#endregion
