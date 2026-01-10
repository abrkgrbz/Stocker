using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region ExchangeRate Event Handlers

/// <summary>
/// Döviz kuru güncellendiğinde tetiklenen handler
/// </summary>
public class ExchangeRateUpdatedEventHandler : INotificationHandler<ExchangeRateUpdatedDomainEvent>
{
    private readonly ILogger<ExchangeRateUpdatedEventHandler> _logger;

    public ExchangeRateUpdatedEventHandler(ILogger<ExchangeRateUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ExchangeRateUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Döviz kuru güncellendi: {FromCurrency}/{ToCurrency}, Eski: {OldRate}, Yeni: {NewRate}, Geçerlilik: {EffectiveDate}, Tenant: {TenantId}",
            notification.FromCurrency,
            notification.ToCurrency,
            notification.OldRate,
            notification.NewRate,
            notification.EffectiveDate,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Kur farkı hesaplandığında tetiklenen handler
/// </summary>
public class ExchangeRateDifferenceCalculatedEventHandler : INotificationHandler<ExchangeRateDifferenceCalculatedDomainEvent>
{
    private readonly ILogger<ExchangeRateDifferenceCalculatedEventHandler> _logger;

    public ExchangeRateDifferenceCalculatedEventHandler(ILogger<ExchangeRateDifferenceCalculatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ExchangeRateDifferenceCalculatedDomainEvent notification, CancellationToken cancellationToken)
    {
        var logLevel = notification.GainOrLoss >= 0 ? LogLevel.Information : LogLevel.Warning;

        _logger.Log(logLevel,
            "Kur farkı hesaplandı: {Currency}, Kar/Zarar: {GainOrLoss}, Etkilenen İşlem: {AffectedTransactionCount}, Tenant: {TenantId}",
            notification.Currency,
            notification.GainOrLoss,
            notification.AffectedTransactionCount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
