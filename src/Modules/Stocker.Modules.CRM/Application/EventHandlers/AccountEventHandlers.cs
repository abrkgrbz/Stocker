using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Account Event Handlers

/// <summary>
/// Handler for account created events
/// </summary>
public sealed class AccountCreatedEventHandler : INotificationHandler<AccountCreatedDomainEvent>
{
    private readonly ILogger<AccountCreatedEventHandler> _logger;

    public AccountCreatedEventHandler(ILogger<AccountCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Account created: {AccountId} - {AccountName}, Type: {AccountType}, Industry: {Industry}",
            notification.AccountId,
            notification.AccountName,
            notification.AccountType ?? "Not specified",
            notification.Industry ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for account updated events
/// </summary>
public sealed class AccountUpdatedEventHandler : INotificationHandler<AccountUpdatedDomainEvent>
{
    private readonly ILogger<AccountUpdatedEventHandler> _logger;

    public AccountUpdatedEventHandler(ILogger<AccountUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Account updated: {AccountId} - {AccountName}",
            notification.AccountId,
            notification.AccountName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for account assigned events
/// </summary>
public sealed class AccountAssignedEventHandler : INotificationHandler<AccountAssignedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<AccountAssignedEventHandler> _logger;

    public AccountAssignedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<AccountAssignedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(AccountAssignedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Account assigned: {AccountId} ({AccountName}) → User {AssignedToUserId}",
            notification.AccountId,
            notification.AccountName,
            notification.AssignedToUserId);

        await _notificationService.SendAccountAssignedAsync(
            notification.TenantId,
            notification.AccountId,
            notification.AccountName,
            notification.AssignedToUserId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for account status changed events
/// </summary>
public sealed class AccountStatusChangedEventHandler : INotificationHandler<AccountStatusChangedDomainEvent>
{
    private readonly ILogger<AccountStatusChangedEventHandler> _logger;

    public AccountStatusChangedEventHandler(ILogger<AccountStatusChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountStatusChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Account status changed: {AccountId} - {OldStatus} → {NewStatus}",
            notification.AccountId,
            notification.OldStatus,
            notification.NewStatus);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for account type changed events
/// </summary>
public sealed class AccountTypeChangedEventHandler : INotificationHandler<AccountTypeChangedDomainEvent>
{
    private readonly ILogger<AccountTypeChangedEventHandler> _logger;

    public AccountTypeChangedEventHandler(ILogger<AccountTypeChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountTypeChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Account type changed: {AccountId} ({AccountName}) - {OldType} → {NewType}",
            notification.AccountId,
            notification.AccountName,
            notification.OldType ?? "None",
            notification.NewType);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for account merged events
/// </summary>
public sealed class AccountMergedEventHandler : INotificationHandler<AccountMergedDomainEvent>
{
    private readonly ILogger<AccountMergedEventHandler> _logger;

    public AccountMergedEventHandler(ILogger<AccountMergedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountMergedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Account merged: {SourceAccountName} ({SourceAccountId}) → {TargetAccountName} ({TargetAccountId})",
            notification.SourceAccountName,
            notification.SourceAccountId,
            notification.TargetAccountName,
            notification.TargetAccountId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for account revenue updated events
/// </summary>
public sealed class AccountRevenueUpdatedEventHandler : INotificationHandler<AccountRevenueUpdatedDomainEvent>
{
    private readonly ILogger<AccountRevenueUpdatedEventHandler> _logger;

    public AccountRevenueUpdatedEventHandler(ILogger<AccountRevenueUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountRevenueUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Account revenue updated: {AccountId} ({AccountName}) - {OldRevenue:C} → {NewRevenue:C} {Currency}",
            notification.AccountId,
            notification.AccountName,
            notification.OldRevenue,
            notification.NewRevenue,
            notification.Currency);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for account marked as key account events
/// </summary>
public sealed class AccountMarkedAsKeyAccountEventHandler : INotificationHandler<AccountMarkedAsKeyAccountDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<AccountMarkedAsKeyAccountEventHandler> _logger;

    public AccountMarkedAsKeyAccountEventHandler(
        ICrmNotificationService notificationService,
        ILogger<AccountMarkedAsKeyAccountEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(AccountMarkedAsKeyAccountDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Account marked as key account: {AccountId} ({AccountName})",
            notification.AccountId,
            notification.AccountName);

        await _notificationService.SendAccountMarkedAsKeyAccountAsync(
            notification.TenantId,
            notification.AccountId,
            notification.AccountName,
            cancellationToken);
    }
}

/// <summary>
/// Handler for account deactivated events
/// </summary>
public sealed class AccountDeactivatedEventHandler : INotificationHandler<AccountDeactivatedDomainEvent>
{
    private readonly ILogger<AccountDeactivatedEventHandler> _logger;

    public AccountDeactivatedEventHandler(ILogger<AccountDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Account deactivated: {AccountId} ({AccountName}), Reason: {DeactivationReason}",
            notification.AccountId,
            notification.AccountName,
            notification.DeactivationReason ?? "Not specified");

        return Task.CompletedTask;
    }
}

#endregion
