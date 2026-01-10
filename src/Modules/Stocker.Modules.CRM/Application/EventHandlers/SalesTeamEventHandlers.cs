using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Sales Team Event Handlers

/// <summary>
/// Handler for sales team created events
/// </summary>
public sealed class SalesTeamCreatedEventHandler : INotificationHandler<SalesTeamCreatedDomainEvent>
{
    private readonly ILogger<SalesTeamCreatedEventHandler> _logger;

    public SalesTeamCreatedEventHandler(ILogger<SalesTeamCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesTeamCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sales team created: {TeamId} - {TeamName}, Manager: {ManagerId}",
            notification.TeamId,
            notification.TeamName,
            notification.ManagerId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for sales team updated events
/// </summary>
public sealed class SalesTeamUpdatedEventHandler : INotificationHandler<SalesTeamUpdatedDomainEvent>
{
    private readonly ILogger<SalesTeamUpdatedEventHandler> _logger;

    public SalesTeamUpdatedEventHandler(ILogger<SalesTeamUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesTeamUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sales team updated: {TeamId} - {TeamName}",
            notification.TeamId,
            notification.TeamName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for sales team member added events
/// </summary>
public sealed class SalesTeamMemberAddedEventHandler : INotificationHandler<SalesTeamMemberAddedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<SalesTeamMemberAddedEventHandler> _logger;

    public SalesTeamMemberAddedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<SalesTeamMemberAddedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(SalesTeamMemberAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Member added to sales team: {TeamId} ({TeamName}) ← Member {MemberId}, Role: {Role}",
            notification.TeamId,
            notification.TeamName,
            notification.MemberId,
            notification.Role);

        await _notificationService.SendSalesTeamMemberAddedAsync(
            notification.TenantId,
            notification.TeamId,
            notification.TeamName,
            notification.MemberId,
            notification.Role,
            cancellationToken);
    }
}

/// <summary>
/// Handler for sales team member removed events
/// </summary>
public sealed class SalesTeamMemberRemovedEventHandler : INotificationHandler<SalesTeamMemberRemovedDomainEvent>
{
    private readonly ILogger<SalesTeamMemberRemovedEventHandler> _logger;

    public SalesTeamMemberRemovedEventHandler(ILogger<SalesTeamMemberRemovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesTeamMemberRemovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Member removed from sales team: {TeamId} ({TeamName}), Member: {MemberId}",
            notification.TeamId,
            notification.TeamName,
            notification.MemberId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for sales team manager changed events
/// </summary>
public sealed class SalesTeamManagerChangedEventHandler : INotificationHandler<SalesTeamManagerChangedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<SalesTeamManagerChangedEventHandler> _logger;

    public SalesTeamManagerChangedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<SalesTeamManagerChangedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(SalesTeamManagerChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sales team manager changed: {TeamId} ({TeamName}), {OldManagerId} → {NewManagerId}",
            notification.TeamId,
            notification.TeamName,
            notification.OldManagerId,
            notification.NewManagerId);

        await _notificationService.SendSalesTeamManagerChangedAsync(
            notification.TenantId,
            notification.TeamId,
            notification.TeamName,
            notification.NewManagerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for sales team quota set events
/// </summary>
public sealed class SalesTeamQuotaSetEventHandler : INotificationHandler<SalesTeamQuotaSetDomainEvent>
{
    private readonly ILogger<SalesTeamQuotaSetEventHandler> _logger;

    public SalesTeamQuotaSetEventHandler(ILogger<SalesTeamQuotaSetEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesTeamQuotaSetDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sales team quota set: {TeamId} ({TeamName}), Quota: {QuotaAmount:C} {Currency}, Period: {Period}",
            notification.TeamId,
            notification.TeamName,
            notification.QuotaAmount,
            notification.Currency,
            notification.Period);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for sales team quota reached events
/// </summary>
public sealed class SalesTeamQuotaReachedEventHandler : INotificationHandler<SalesTeamQuotaReachedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<SalesTeamQuotaReachedEventHandler> _logger;

    public SalesTeamQuotaReachedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<SalesTeamQuotaReachedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(SalesTeamQuotaReachedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sales team quota reached: {TeamId} ({TeamName}), Achieved: {AchievedAmount:C}/{QuotaAmount:C} {Currency}",
            notification.TeamId,
            notification.TeamName,
            notification.AchievedAmount,
            notification.QuotaAmount,
            notification.Currency);

        await _notificationService.SendSalesTeamQuotaReachedAsync(
            notification.TenantId,
            notification.TeamId,
            notification.TeamName,
            notification.QuotaAmount,
            notification.AchievedAmount,
            cancellationToken);
    }
}

/// <summary>
/// Handler for sales team deactivated events
/// </summary>
public sealed class SalesTeamDeactivatedEventHandler : INotificationHandler<SalesTeamDeactivatedDomainEvent>
{
    private readonly ILogger<SalesTeamDeactivatedEventHandler> _logger;

    public SalesTeamDeactivatedEventHandler(ILogger<SalesTeamDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesTeamDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Sales team deactivated: {TeamId} ({TeamName})",
            notification.TeamId,
            notification.TeamName);

        return Task.CompletedTask;
    }
}

#endregion
