using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region SalesTarget Event Handlers

/// <summary>
/// Satış hedefi oluşturulduğunda tetiklenen handler
/// </summary>
public class SalesTargetCreatedEventHandler : INotificationHandler<SalesTargetCreatedDomainEvent>
{
    private readonly ILogger<SalesTargetCreatedEventHandler> _logger;

    public SalesTargetCreatedEventHandler(ILogger<SalesTargetCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesTargetCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış hedefi oluşturuldu: {TargetName}, Temsilci: {SalesRepName}, Hedef: {TargetAmount}, Dönem: {Period}, Tenant: {TenantId}",
            notification.TargetName,
            notification.SalesRepName,
            notification.TargetAmount,
            notification.Period,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış hedefi ilerleme güncellendiğinde tetiklenen handler
/// </summary>
public class SalesTargetProgressUpdatedEventHandler : INotificationHandler<SalesTargetProgressUpdatedDomainEvent>
{
    private readonly ILogger<SalesTargetProgressUpdatedEventHandler> _logger;

    public SalesTargetProgressUpdatedEventHandler(ILogger<SalesTargetProgressUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesTargetProgressUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış hedefi ilerledi: {TargetName}, Hedef: {TargetAmount}, Gerçekleşen: {AchievedAmount}, İlerleme: %{ProgressPercentage}, Tenant: {TenantId}",
            notification.TargetName,
            notification.TargetAmount,
            notification.AchievedAmount,
            notification.ProgressPercentage,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış hedefi ulaşıldığında tetiklenen handler
/// </summary>
public class SalesTargetAchievedEventHandler : INotificationHandler<SalesTargetAchievedDomainEvent>
{
    private readonly ILogger<SalesTargetAchievedEventHandler> _logger;

    public SalesTargetAchievedEventHandler(ILogger<SalesTargetAchievedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesTargetAchievedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış hedefine ulaşıldı: {TargetName}, Temsilci: {SalesRepName}, Hedef: {TargetAmount}, Gerçekleşen: {AchievedAmount}, Tenant: {TenantId}",
            notification.TargetName,
            notification.SalesRepName,
            notification.TargetAmount,
            notification.AchievedAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış hedefi kaçırıldığında tetiklenen handler
/// </summary>
public class SalesTargetMissedEventHandler : INotificationHandler<SalesTargetMissedDomainEvent>
{
    private readonly ILogger<SalesTargetMissedEventHandler> _logger;

    public SalesTargetMissedEventHandler(ILogger<SalesTargetMissedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalesTargetMissedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satış hedefi kaçırıldı: {TargetName}, Hedef: {TargetAmount}, Gerçekleşen: {AchievedAmount}, Eksik: {ShortfallAmount}, Tenant: {TenantId}",
            notification.TargetName,
            notification.TargetAmount,
            notification.AchievedAmount,
            notification.ShortfallAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
