using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region CurrentAccount Event Handlers

/// <summary>
/// Cari hesap oluşturulduğunda tetiklenen handler
/// </summary>
public class CurrentAccountCreatedEventHandler : INotificationHandler<CurrentAccountCreatedDomainEvent>
{
    private readonly ILogger<CurrentAccountCreatedEventHandler> _logger;

    public CurrentAccountCreatedEventHandler(ILogger<CurrentAccountCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CurrentAccountCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Cari hesap oluşturuldu: {AccountCode} - {AccountName}, Tip: {AccountType}, Kredi Limiti: {CreditLimit}, Tenant: {TenantId}",
            notification.AccountCode,
            notification.AccountName,
            notification.AccountType,
            notification.CreditLimit,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Cari hesap bakiyesi güncellendiğinde tetiklenen handler
/// </summary>
public class CurrentAccountBalanceUpdatedEventHandler : INotificationHandler<CurrentAccountBalanceUpdatedDomainEvent>
{
    private readonly ILogger<CurrentAccountBalanceUpdatedEventHandler> _logger;

    public CurrentAccountBalanceUpdatedEventHandler(ILogger<CurrentAccountBalanceUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CurrentAccountBalanceUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Cari hesap bakiyesi güncellendi: {AccountCode}, Eski: {OldBalance}, Yeni: {NewBalance}, İşlem: {TransactionType}, Tenant: {TenantId}",
            notification.AccountCode,
            notification.OldBalance,
            notification.NewBalance,
            notification.TransactionType,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Cari hesap kredi limiti aşıldığında tetiklenen handler
/// </summary>
public class CurrentAccountCreditLimitExceededEventHandler : INotificationHandler<CurrentAccountCreditLimitExceededDomainEvent>
{
    private readonly ILogger<CurrentAccountCreditLimitExceededEventHandler> _logger;

    public CurrentAccountCreditLimitExceededEventHandler(ILogger<CurrentAccountCreditLimitExceededEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CurrentAccountCreditLimitExceededDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Cari hesap kredi limiti aşıldı: {AccountCode} - {AccountName}, Limit: {CreditLimit}, Bakiye: {CurrentBalance}, Tenant: {TenantId}",
            notification.AccountCode,
            notification.AccountName,
            notification.CreditLimit,
            notification.CurrentBalance,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Cari hesap bloke edildiğinde tetiklenen handler
/// </summary>
public class CurrentAccountBlockedEventHandler : INotificationHandler<CurrentAccountBlockedDomainEvent>
{
    private readonly ILogger<CurrentAccountBlockedEventHandler> _logger;

    public CurrentAccountBlockedEventHandler(ILogger<CurrentAccountBlockedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CurrentAccountBlockedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Cari hesap bloke edildi: {AccountCode} - {AccountName}, Sebep: {BlockReason}, Tenant: {TenantId}",
            notification.AccountCode,
            notification.AccountName,
            notification.BlockReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
