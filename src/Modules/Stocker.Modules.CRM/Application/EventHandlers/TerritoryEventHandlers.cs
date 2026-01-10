using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Territory Event Handlers

/// <summary>
/// Handler for territory created events
/// </summary>
public sealed class TerritoryCreatedEventHandler : INotificationHandler<TerritoryCreatedDomainEvent>
{
    private readonly ILogger<TerritoryCreatedEventHandler> _logger;

    public TerritoryCreatedEventHandler(ILogger<TerritoryCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TerritoryCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Territory created: {TerritoryId} - {TerritoryName}, Parent: {ParentTerritoryId}",
            notification.TerritoryId,
            notification.TerritoryName,
            notification.ParentTerritoryId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for territory updated events
/// </summary>
public sealed class TerritoryUpdatedEventHandler : INotificationHandler<TerritoryUpdatedDomainEvent>
{
    private readonly ILogger<TerritoryUpdatedEventHandler> _logger;

    public TerritoryUpdatedEventHandler(ILogger<TerritoryUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TerritoryUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Territory updated: {TerritoryId} - {TerritoryName}",
            notification.TerritoryId,
            notification.TerritoryName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for territory user assigned events
/// </summary>
public sealed class TerritoryUserAssignedEventHandler : INotificationHandler<TerritoryUserAssignedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<TerritoryUserAssignedEventHandler> _logger;

    public TerritoryUserAssignedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<TerritoryUserAssignedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(TerritoryUserAssignedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "User assigned to territory: {TerritoryId} ({TerritoryName}) ← User {AssignedUserId}, Role: {Role}",
            notification.TerritoryId,
            notification.TerritoryName,
            notification.AssignedUserId,
            notification.Role);

        await _notificationService.SendTerritoryUserAssignedAsync(
            notification.TenantId,
            notification.TerritoryId,
            notification.TerritoryName,
            notification.AssignedUserId,
            notification.Role,
            cancellationToken);
    }
}

/// <summary>
/// Handler for territory user removed events
/// </summary>
public sealed class TerritoryUserRemovedEventHandler : INotificationHandler<TerritoryUserRemovedDomainEvent>
{
    private readonly ILogger<TerritoryUserRemovedEventHandler> _logger;

    public TerritoryUserRemovedEventHandler(ILogger<TerritoryUserRemovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TerritoryUserRemovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "User removed from territory: {TerritoryId} ({TerritoryName}), User: {RemovedUserId}",
            notification.TerritoryId,
            notification.TerritoryName,
            notification.RemovedUserId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for territory account added events
/// </summary>
public sealed class TerritoryAccountAddedEventHandler : INotificationHandler<TerritoryAccountAddedDomainEvent>
{
    private readonly ILogger<TerritoryAccountAddedEventHandler> _logger;

    public TerritoryAccountAddedEventHandler(ILogger<TerritoryAccountAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TerritoryAccountAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Account added to territory: {TerritoryId} ({TerritoryName}) ← Account {AccountId} ({AccountName})",
            notification.TerritoryId,
            notification.TerritoryName,
            notification.AccountId,
            notification.AccountName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for territory account removed events
/// </summary>
public sealed class TerritoryAccountRemovedEventHandler : INotificationHandler<TerritoryAccountRemovedDomainEvent>
{
    private readonly ILogger<TerritoryAccountRemovedEventHandler> _logger;

    public TerritoryAccountRemovedEventHandler(ILogger<TerritoryAccountRemovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TerritoryAccountRemovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Account removed from territory: {TerritoryId} ({TerritoryName}), Account: {AccountId} ({AccountName})",
            notification.TerritoryId,
            notification.TerritoryName,
            notification.AccountId,
            notification.AccountName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for territory deactivated events
/// </summary>
public sealed class TerritoryDeactivatedEventHandler : INotificationHandler<TerritoryDeactivatedDomainEvent>
{
    private readonly ILogger<TerritoryDeactivatedEventHandler> _logger;

    public TerritoryDeactivatedEventHandler(ILogger<TerritoryDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TerritoryDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Territory deactivated: {TerritoryId} ({TerritoryName})",
            notification.TerritoryId,
            notification.TerritoryName);

        return Task.CompletedTask;
    }
}

#endregion
