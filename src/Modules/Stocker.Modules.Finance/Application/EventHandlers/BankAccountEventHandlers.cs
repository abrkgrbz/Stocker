using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region BankAccount Event Handlers

/// <summary>
/// Banka hesabı oluşturulduğunda tetiklenen handler
/// </summary>
public class BankAccountCreatedEventHandler : INotificationHandler<BankAccountCreatedDomainEvent>
{
    private readonly ILogger<BankAccountCreatedEventHandler> _logger;

    public BankAccountCreatedEventHandler(ILogger<BankAccountCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BankAccountCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Banka hesabı oluşturuldu: {AccountNumber}, Banka: {BankName}, Açılış Bakiyesi: {OpeningBalance} {Currency}, Tenant: {TenantId}",
            notification.AccountNumber,
            notification.BankName,
            notification.OpeningBalance,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Banka hesabı güncellendiğinde tetiklenen handler
/// </summary>
public class BankAccountUpdatedEventHandler : INotificationHandler<BankAccountUpdatedDomainEvent>
{
    private readonly ILogger<BankAccountUpdatedEventHandler> _logger;

    public BankAccountUpdatedEventHandler(ILogger<BankAccountUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BankAccountUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Banka hesabı güncellendi: {AccountNumber}, Banka: {BankName}, Tenant: {TenantId}",
            notification.AccountNumber,
            notification.BankName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Banka hesabı kapatıldığında tetiklenen handler
/// </summary>
public class BankAccountClosedEventHandler : INotificationHandler<BankAccountClosedDomainEvent>
{
    private readonly ILogger<BankAccountClosedEventHandler> _logger;

    public BankAccountClosedEventHandler(ILogger<BankAccountClosedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BankAccountClosedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Banka hesabı kapatıldı: {AccountNumber}, Sebep: {ClosureReason}, Tenant: {TenantId}",
            notification.AccountNumber,
            notification.ClosureReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Banka hesabına para yatırıldığında tetiklenen handler
/// </summary>
public class BankDepositMadeEventHandler : INotificationHandler<BankDepositMadeDomainEvent>
{
    private readonly ILogger<BankDepositMadeEventHandler> _logger;

    public BankDepositMadeEventHandler(ILogger<BankDepositMadeEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BankDepositMadeDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Banka hesabına para yatırıldı: {AccountNumber}, Tutar: {Amount} {Currency}, Yeni Bakiye: {NewBalance}, Tenant: {TenantId}",
            notification.AccountNumber,
            notification.Amount,
            notification.Currency,
            notification.NewBalance,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Banka hesabından para çekildiğinde tetiklenen handler
/// </summary>
public class BankWithdrawalMadeEventHandler : INotificationHandler<BankWithdrawalMadeDomainEvent>
{
    private readonly ILogger<BankWithdrawalMadeEventHandler> _logger;

    public BankWithdrawalMadeEventHandler(ILogger<BankWithdrawalMadeEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BankWithdrawalMadeDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Banka hesabından para çekildi: {AccountNumber}, Tutar: {Amount} {Currency}, Yeni Bakiye: {NewBalance}, Tenant: {TenantId}",
            notification.AccountNumber,
            notification.Amount,
            notification.Currency,
            notification.NewBalance,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
