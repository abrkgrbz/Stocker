using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

/// <summary>
/// Handler for campaign created events
/// </summary>
public sealed class CampaignCreatedEventHandler : INotificationHandler<CampaignCreatedDomainEvent>
{
    private readonly ILogger<CampaignCreatedEventHandler> _logger;

    public CampaignCreatedEventHandler(ILogger<CampaignCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CampaignCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Campaign created: {CampaignId} - {Name} ({CampaignType}), Start: {StartDate:d}, End: {EndDate:d}",
            notification.CampaignId,
            notification.Name,
            notification.CampaignType,
            notification.StartDate,
            notification.EndDate);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for campaign launched events - sends notification to tenant
/// </summary>
public sealed class CampaignLaunchedEventHandler : INotificationHandler<CampaignLaunchedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<CampaignLaunchedEventHandler> _logger;

    public CampaignLaunchedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<CampaignLaunchedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(CampaignLaunchedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "🚀 Campaign launched: {CampaignId} - {Name}, Target members: {TargetMemberCount}",
            notification.CampaignId,
            notification.Name,
            notification.TargetMemberCount);

        // Send notification to tenant about campaign launch
        await _notificationService.SendCampaignLaunchedAsync(
            notification.TenantId,
            notification.CampaignId,
            notification.Name,
            notification.TargetMemberCount,
            cancellationToken);
    }
}

/// <summary>
/// Handler for campaign completed events
/// </summary>
public sealed class CampaignCompletedEventHandler : INotificationHandler<CampaignCompletedDomainEvent>
{
    private readonly ILogger<CampaignCompletedEventHandler> _logger;

    public CampaignCompletedEventHandler(ILogger<CampaignCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CampaignCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Campaign completed: {CampaignId} - {Name}, Members: {TotalMembers}, " +
            "Conversions: {ConversionsCount}, Revenue: {TotalRevenue}",
            notification.CampaignId,
            notification.Name,
            notification.TotalMembers,
            notification.ConversionsCount,
            notification.TotalRevenue);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for campaign cancelled events
/// </summary>
public sealed class CampaignCancelledEventHandler : INotificationHandler<CampaignCancelledDomainEvent>
{
    private readonly ILogger<CampaignCancelledEventHandler> _logger;

    public CampaignCancelledEventHandler(ILogger<CampaignCancelledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CampaignCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Campaign cancelled: {CampaignId} - {Name}, Reason: {Reason}",
            notification.CampaignId,
            notification.Name,
            notification.Reason ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for campaign member added events
/// </summary>
public sealed class CampaignMemberAddedEventHandler : INotificationHandler<CampaignMemberAddedDomainEvent>
{
    private readonly ILogger<CampaignMemberAddedEventHandler> _logger;

    public CampaignMemberAddedEventHandler(ILogger<CampaignMemberAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CampaignMemberAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogDebug(
            "Member added to campaign: Campaign {CampaignId}, Member {MemberId} ({MemberType})",
            notification.CampaignId,
            notification.MemberId,
            notification.MemberType);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for campaign member responded events
/// </summary>
public sealed class CampaignMemberRespondedEventHandler : INotificationHandler<CampaignMemberRespondedDomainEvent>
{
    private readonly ILogger<CampaignMemberRespondedEventHandler> _logger;

    public CampaignMemberRespondedEventHandler(ILogger<CampaignMemberRespondedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CampaignMemberRespondedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Campaign member responded: Campaign {CampaignId}, Member {MemberId}, Status: {ResponseStatus}",
            notification.CampaignId,
            notification.MemberId,
            notification.ResponseStatus);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for campaign budget updated events
/// </summary>
public sealed class CampaignBudgetUpdatedEventHandler : INotificationHandler<CampaignBudgetUpdatedDomainEvent>
{
    private readonly ILogger<CampaignBudgetUpdatedEventHandler> _logger;

    public CampaignBudgetUpdatedEventHandler(ILogger<CampaignBudgetUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CampaignBudgetUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Campaign budget updated: {CampaignId} - Budget: {OldBudget} → {NewBudget}",
            notification.CampaignId,
            notification.OldBudget,
            notification.NewBudget);

        return Task.CompletedTask;
    }
}
