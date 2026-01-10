using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region AccountingPeriod Event Handlers

/// <summary>
/// Muhasebe dönemi açıldığında tetiklenen handler
/// </summary>
public class AccountingPeriodOpenedEventHandler : INotificationHandler<AccountingPeriodOpenedDomainEvent>
{
    private readonly ILogger<AccountingPeriodOpenedEventHandler> _logger;

    public AccountingPeriodOpenedEventHandler(ILogger<AccountingPeriodOpenedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountingPeriodOpenedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Muhasebe dönemi açıldı: {PeriodName}, Başlangıç: {StartDate}, Bitiş: {EndDate}, Tenant: {TenantId}",
            notification.PeriodName,
            notification.StartDate,
            notification.EndDate,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Muhasebe dönemi kapatıldığında tetiklenen handler
/// </summary>
public class AccountingPeriodClosedEventHandler : INotificationHandler<AccountingPeriodClosedDomainEvent>
{
    private readonly ILogger<AccountingPeriodClosedEventHandler> _logger;

    public AccountingPeriodClosedEventHandler(ILogger<AccountingPeriodClosedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountingPeriodClosedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Muhasebe dönemi kapatıldı: {PeriodName}, Kapatan: {ClosedById}, Tenant: {TenantId}",
            notification.PeriodName,
            notification.ClosedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Muhasebe dönemi kilitlendiğinde tetiklenen handler
/// </summary>
public class AccountingPeriodLockedEventHandler : INotificationHandler<AccountingPeriodLockedDomainEvent>
{
    private readonly ILogger<AccountingPeriodLockedEventHandler> _logger;

    public AccountingPeriodLockedEventHandler(ILogger<AccountingPeriodLockedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(AccountingPeriodLockedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Muhasebe dönemi kilitlendi: {PeriodName}, Kilitleyen: {LockedByName}, Tenant: {TenantId}",
            notification.PeriodName,
            notification.LockedByName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Yıl sonu kapanışı yapıldığında tetiklenen handler
/// </summary>
public class YearEndClosingCompletedEventHandler : INotificationHandler<YearEndClosingCompletedDomainEvent>
{
    private readonly ILogger<YearEndClosingCompletedEventHandler> _logger;

    public YearEndClosingCompletedEventHandler(ILogger<YearEndClosingCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(YearEndClosingCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Yıl sonu kapanışı tamamlandı: {FiscalYear}, Net Kar: {NetProfit}, Tenant: {TenantId}",
            notification.FiscalYear,
            notification.NetProfit,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
