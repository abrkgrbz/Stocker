using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

/// <summary>
/// Handler for loyalty program created events
/// </summary>
public sealed class LoyaltyProgramCreatedEventHandler : INotificationHandler<LoyaltyProgramCreatedDomainEvent>
{
    private readonly ILogger<LoyaltyProgramCreatedEventHandler> _logger;

    public LoyaltyProgramCreatedEventHandler(ILogger<LoyaltyProgramCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LoyaltyProgramCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Loyalty program created: {ProgramId} - {Name} ({ProgramType})",
            notification.ProgramId,
            notification.Name,
            notification.ProgramType);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for loyalty membership created events
/// </summary>
public sealed class LoyaltyMembershipCreatedEventHandler : INotificationHandler<LoyaltyMembershipCreatedDomainEvent>
{
    private readonly ILogger<LoyaltyMembershipCreatedEventHandler> _logger;

    public LoyaltyMembershipCreatedEventHandler(ILogger<LoyaltyMembershipCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LoyaltyMembershipCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Loyalty membership created: {MembershipId} - Customer {CustomerId} joined program {ProgramId}, " +
            "Member #: {MemberNumber}",
            notification.MembershipId,
            notification.CustomerId,
            notification.ProgramId,
            notification.MemberNumber);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for loyalty points earned events
/// </summary>
public sealed class LoyaltyPointsEarnedEventHandler : INotificationHandler<LoyaltyPointsEarnedDomainEvent>
{
    private readonly ILogger<LoyaltyPointsEarnedEventHandler> _logger;

    public LoyaltyPointsEarnedEventHandler(ILogger<LoyaltyPointsEarnedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LoyaltyPointsEarnedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Loyalty points earned: Customer {CustomerId} earned {PointsEarned} points ({Source}), " +
            "New balance: {NewBalance}",
            notification.CustomerId,
            notification.PointsEarned,
            notification.Source,
            notification.NewBalance);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for loyalty points redeemed events
/// </summary>
public sealed class LoyaltyPointsRedeemedEventHandler : INotificationHandler<LoyaltyPointsRedeemedDomainEvent>
{
    private readonly ILogger<LoyaltyPointsRedeemedEventHandler> _logger;

    public LoyaltyPointsRedeemedEventHandler(ILogger<LoyaltyPointsRedeemedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LoyaltyPointsRedeemedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Loyalty points redeemed: Customer {CustomerId} redeemed {PointsRedeemed} points ({RedemptionType}), " +
            "New balance: {NewBalance}",
            notification.CustomerId,
            notification.PointsRedeemed,
            notification.RedemptionType,
            notification.NewBalance);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for loyalty tier changed events - sends notification to tenant
/// </summary>
public sealed class LoyaltyTierChangedEventHandler : INotificationHandler<LoyaltyTierChangedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<LoyaltyTierChangedEventHandler> _logger;

    public LoyaltyTierChangedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<LoyaltyTierChangedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LoyaltyTierChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "🎖️ Loyalty tier changed: Customer {CustomerId} ({CustomerName}) - Tier: {OldTier} → {NewTier}",
            notification.CustomerId,
            notification.CustomerName,
            notification.OldTier,
            notification.NewTier);

        await _notificationService.SendLoyaltyTierChangedAsync(
            notification.TenantId,
            notification.CustomerId,
            notification.CustomerName,
            notification.OldTier,
            notification.NewTier,
            cancellationToken);
    }
}

/// <summary>
/// Handler for loyalty points expiring events - sends notification to tenant
/// </summary>
public sealed class LoyaltyPointsExpiringEventHandler : INotificationHandler<LoyaltyPointsExpiringDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<LoyaltyPointsExpiringEventHandler> _logger;

    public LoyaltyPointsExpiringEventHandler(
        ICrmNotificationService notificationService,
        ILogger<LoyaltyPointsExpiringEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(LoyaltyPointsExpiringDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "⚠️ Loyalty points expiring: Customer {CustomerId} ({CustomerName}) has {PointsExpiring} points expiring on {ExpiryDate:d}",
            notification.CustomerId,
            notification.CustomerName,
            notification.PointsExpiring,
            notification.ExpiryDate);

        await _notificationService.SendLoyaltyPointsExpiringAsync(
            notification.TenantId,
            notification.CustomerId,
            notification.CustomerName,
            notification.PointsExpiring,
            notification.ExpiryDate,
            cancellationToken);
    }
}

