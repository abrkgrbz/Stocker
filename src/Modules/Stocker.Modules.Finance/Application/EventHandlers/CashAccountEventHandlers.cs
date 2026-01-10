using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region CashAccount Event Handlers

/// <summary>
/// Kasa hesabı oluşturulduğunda tetiklenen handler
/// </summary>
public class CashAccountCreatedEventHandler : INotificationHandler<CashAccountCreatedDomainEvent>
{
    private readonly ILogger<CashAccountCreatedEventHandler> _logger;

    public CashAccountCreatedEventHandler(ILogger<CashAccountCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CashAccountCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Kasa hesabı oluşturuldu: {AccountCode} - {AccountName}, Açılış: {OpeningBalance} {Currency}, Tenant: {TenantId}",
            notification.AccountCode,
            notification.AccountName,
            notification.OpeningBalance,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Kasaya para girişi yapıldığında tetiklenen handler
/// </summary>
public class CashReceivedEventHandler : INotificationHandler<CashReceivedDomainEvent>
{
    private readonly ILogger<CashReceivedEventHandler> _logger;

    public CashReceivedEventHandler(ILogger<CashReceivedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CashReceivedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Kasaya para girişi: {AccountCode}, Tutar: {Amount} {Currency}, Yeni Bakiye: {NewBalance}, Tenant: {TenantId}",
            notification.AccountCode,
            notification.Amount,
            notification.Currency,
            notification.NewBalance,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Kasadan para çıkışı yapıldığında tetiklenen handler
/// </summary>
public class CashPaidEventHandler : INotificationHandler<CashPaidDomainEvent>
{
    private readonly ILogger<CashPaidEventHandler> _logger;

    public CashPaidEventHandler(ILogger<CashPaidEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CashPaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Kasadan para çıkışı: {AccountCode}, Tutar: {Amount} {Currency}, Yeni Bakiye: {NewBalance}, Tenant: {TenantId}",
            notification.AccountCode,
            notification.Amount,
            notification.Currency,
            notification.NewBalance,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Kasa sayımı yapıldığında tetiklenen handler
/// </summary>
public class CashCountedEventHandler : INotificationHandler<CashCountedDomainEvent>
{
    private readonly ILogger<CashCountedEventHandler> _logger;

    public CashCountedEventHandler(ILogger<CashCountedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CashCountedDomainEvent notification, CancellationToken cancellationToken)
    {
        if (notification.Difference != 0)
        {
            _logger.LogWarning(
                "Kasa sayımında fark tespit edildi: {AccountCode}, Sistem: {SystemBalance}, Fiili: {ActualBalance}, Fark: {Difference}, Tenant: {TenantId}",
                notification.AccountCode,
                notification.SystemBalance,
                notification.ActualBalance,
                notification.Difference,
                notification.TenantId);
        }
        else
        {
            _logger.LogInformation(
                "Kasa sayımı tamamlandı: {AccountCode}, Bakiye: {ActualBalance}, Tenant: {TenantId}",
                notification.AccountCode,
                notification.ActualBalance,
                notification.TenantId);
        }

        return Task.CompletedTask;
    }
}

#endregion
