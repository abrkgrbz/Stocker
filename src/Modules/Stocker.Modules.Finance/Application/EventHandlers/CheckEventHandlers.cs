using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region Check Event Handlers

/// <summary>
/// Çek oluşturulduğunda tetiklenen handler
/// </summary>
public class CheckCreatedEventHandler : INotificationHandler<CheckCreatedDomainEvent>
{
    private readonly ILogger<CheckCreatedEventHandler> _logger;

    public CheckCreatedEventHandler(ILogger<CheckCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CheckCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Çek oluşturuldu: {CheckNumber}, Tip: {CheckType}, Tutar: {Amount} {Currency}, Keşideci: {DrawerName}, Tenant: {TenantId}",
            notification.CheckNumber,
            notification.CheckType,
            notification.Amount,
            notification.Currency,
            notification.DrawerName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Çek tahsil edildiğinde tetiklenen handler
/// </summary>
public class CheckCollectedEventHandler : INotificationHandler<CheckCollectedDomainEvent>
{
    private readonly ILogger<CheckCollectedEventHandler> _logger;

    public CheckCollectedEventHandler(ILogger<CheckCollectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CheckCollectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Çek tahsil edildi: {CheckNumber}, Tutar: {Amount}, Banka Hesabı: {BankAccountId}, Tenant: {TenantId}",
            notification.CheckNumber,
            notification.Amount,
            notification.BankAccountId,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Çek karşılıksız çıktığında tetiklenen handler
/// </summary>
public class CheckBouncedEventHandler : INotificationHandler<CheckBouncedDomainEvent>
{
    private readonly ILogger<CheckBouncedEventHandler> _logger;

    public CheckBouncedEventHandler(ILogger<CheckBouncedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CheckBouncedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Çek karşılıksız çıktı: {CheckNumber}, Keşideci: {DrawerName}, Tutar: {Amount}, Sebep: {BounceReason}, Tenant: {TenantId}",
            notification.CheckNumber,
            notification.DrawerName,
            notification.Amount,
            notification.BounceReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Çek ciro edildiğinde tetiklenen handler
/// </summary>
public class CheckEndorsedEventHandler : INotificationHandler<CheckEndorsedDomainEvent>
{
    private readonly ILogger<CheckEndorsedEventHandler> _logger;

    public CheckEndorsedEventHandler(ILogger<CheckEndorsedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CheckEndorsedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Çek ciro edildi: {CheckNumber}, Ciro Edilen: {EndorsedTo}, Tenant: {TenantId}",
            notification.CheckNumber,
            notification.EndorsedTo,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
