using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Referral Event Handlers

/// <summary>
/// Handler for referral created events
/// </summary>
public sealed class ReferralCreatedEventHandler : INotificationHandler<ReferralCreatedDomainEvent>
{
    private readonly ILogger<ReferralCreatedEventHandler> _logger;

    public ReferralCreatedEventHandler(ILogger<ReferralCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReferralCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Referral created: {ReferralId} - Code: {ReferralCode}, Referrer: {ReferrerName}, Email: {ReferredEmail}",
            notification.ReferralId,
            notification.ReferralCode,
            notification.ReferrerName,
            notification.ReferredEmail ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for referral link clicked events
/// </summary>
public sealed class ReferralLinkClickedEventHandler : INotificationHandler<ReferralLinkClickedDomainEvent>
{
    private readonly ILogger<ReferralLinkClickedEventHandler> _logger;

    public ReferralLinkClickedEventHandler(ILogger<ReferralLinkClickedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReferralLinkClickedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Referral link clicked: {ReferralId} - Code: {ReferralCode}, IP: {ClickedByIp}",
            notification.ReferralId,
            notification.ReferralCode,
            notification.ClickedByIp);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for referral converted events
/// </summary>
public sealed class ReferralConvertedEventHandler : INotificationHandler<ReferralConvertedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<ReferralConvertedEventHandler> _logger;

    public ReferralConvertedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<ReferralConvertedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ReferralConvertedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Referral converted: {ReferralId} - Code: {ReferralCode}, Referrer: {ReferrerName}, New Customer: {NewCustomerName}",
            notification.ReferralId,
            notification.ReferralCode,
            notification.ReferrerName,
            notification.NewCustomerName);

        await _notificationService.SendReferralConvertedAsync(
            notification.TenantId,
            notification.ReferralId,
            notification.ReferralCode,
            notification.ReferrerId,
            notification.NewCustomerName,
            cancellationToken);
    }
}

/// <summary>
/// Handler for referral reward earned events
/// </summary>
public sealed class ReferralRewardEarnedEventHandler : INotificationHandler<ReferralRewardEarnedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<ReferralRewardEarnedEventHandler> _logger;

    public ReferralRewardEarnedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<ReferralRewardEarnedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ReferralRewardEarnedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Referral reward earned: {ReferralId}, Referrer: {ReferrerName}, Type: {RewardType}, Amount: {RewardAmount}",
            notification.ReferralId,
            notification.ReferrerName,
            notification.RewardType,
            notification.RewardAmount);

        await _notificationService.SendReferralRewardEarnedAsync(
            notification.TenantId,
            notification.ReferralId,
            notification.ReferrerId,
            notification.RewardType,
            notification.RewardAmount,
            cancellationToken);
    }
}

/// <summary>
/// Handler for referral reward claimed events
/// </summary>
public sealed class ReferralRewardClaimedEventHandler : INotificationHandler<ReferralRewardClaimedDomainEvent>
{
    private readonly ILogger<ReferralRewardClaimedEventHandler> _logger;

    public ReferralRewardClaimedEventHandler(ILogger<ReferralRewardClaimedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReferralRewardClaimedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Referral reward claimed: {ReferralId}, Referrer: {ReferrerName}, Type: {RewardType}, Amount: {RewardAmount}",
            notification.ReferralId,
            notification.ReferrerName,
            notification.RewardType,
            notification.RewardAmount);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for referral expired events
/// </summary>
public sealed class ReferralExpiredEventHandler : INotificationHandler<ReferralExpiredDomainEvent>
{
    private readonly ILogger<ReferralExpiredEventHandler> _logger;

    public ReferralExpiredEventHandler(ILogger<ReferralExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ReferralExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Referral expired: {ReferralId} - Code: {ReferralCode}",
            notification.ReferralId,
            notification.ReferralCode);

        return Task.CompletedTask;
    }
}

#endregion
