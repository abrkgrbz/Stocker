using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region Account Event Handlers

/// <summary>
/// Hesap oluşturulduğunda tetiklenen handler
/// </summary>
public class AccountCreatedEventHandler : INotificationHandler<AccountCreatedDomainEvent>
{
    private readonly ILogger<AccountCreatedEventHandler> _logger;

    public AccountCreatedEventHandler(ILogger<AccountCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Hesap oluşturuldu: {AccountCode} - {AccountName}, Tip: {AccountType}, Tenant: {TenantId}",
            notification.AccountCode,
            notification.AccountName,
            notification.AccountType,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Hesap güncellendiğinde tetiklenen handler
/// </summary>
public class AccountUpdatedEventHandler : INotificationHandler<AccountUpdatedDomainEvent>
{
    private readonly ILogger<AccountUpdatedEventHandler> _logger;

    public AccountUpdatedEventHandler(ILogger<AccountUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Hesap güncellendi: {AccountCode} - {AccountName}, Tenant: {TenantId}",
            notification.AccountCode,
            notification.AccountName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Hesap aktifleştirildiğinde tetiklenen handler
/// </summary>
public class AccountActivatedEventHandler : INotificationHandler<AccountActivatedDomainEvent>
{
    private readonly ILogger<AccountActivatedEventHandler> _logger;

    public AccountActivatedEventHandler(ILogger<AccountActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Hesap aktifleştirildi: {AccountCode} - {AccountName}, Tenant: {TenantId}",
            notification.AccountCode,
            notification.AccountName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Hesap pasifleştirildiğinde tetiklenen handler
/// </summary>
public class AccountDeactivatedEventHandler : INotificationHandler<AccountDeactivatedDomainEvent>
{
    private readonly ILogger<AccountDeactivatedEventHandler> _logger;

    public AccountDeactivatedEventHandler(ILogger<AccountDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Hesap pasifleştirildi: {AccountCode} - {AccountName}, Tenant: {TenantId}",
            notification.AccountCode,
            notification.AccountName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
