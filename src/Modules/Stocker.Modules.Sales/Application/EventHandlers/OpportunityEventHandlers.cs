using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Events;

namespace Stocker.Modules.Sales.Application.EventHandlers;

#region Opportunity Event Handlers

/// <summary>
/// Satış fırsatı oluşturulduğunda tetiklenen handler
/// </summary>
public class OpportunityCreatedEventHandler : INotificationHandler<OpportunityCreatedDomainEvent>
{
    private readonly ILogger<OpportunityCreatedEventHandler> _logger;

    public OpportunityCreatedEventHandler(ILogger<OpportunityCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OpportunityCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış fırsatı oluşturuldu: {OpportunityName}, Müşteri: {CustomerName}, Tahmini Değer: {EstimatedValue}, Tenant: {TenantId}",
            notification.OpportunityName,
            notification.CustomerName,
            notification.EstimatedValue,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış fırsatı aşaması değiştiğinde tetiklenen handler
/// </summary>
public class OpportunityStageChangedEventHandler : INotificationHandler<OpportunityStageChangedDomainEvent>
{
    private readonly ILogger<OpportunityStageChangedEventHandler> _logger;

    public OpportunityStageChangedEventHandler(ILogger<OpportunityStageChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OpportunityStageChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış fırsatı aşaması değişti: {OpportunityName}, {OldStage} -> {NewStage}, Tenant: {TenantId}",
            notification.OpportunityName,
            notification.OldStage,
            notification.NewStage,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış fırsatı kazanıldığında tetiklenen handler
/// </summary>
public class OpportunityWonEventHandler : INotificationHandler<OpportunityWonDomainEvent>
{
    private readonly ILogger<OpportunityWonEventHandler> _logger;

    public OpportunityWonEventHandler(ILogger<OpportunityWonEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OpportunityWonDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış fırsatı kazanıldı: {OpportunityName}, Değer: {FinalValue}, Sipariş: {SalesOrderId}, Tenant: {TenantId}",
            notification.OpportunityName,
            notification.FinalValue,
            notification.SalesOrderId,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış fırsatı kaybedildiğinde tetiklenen handler
/// </summary>
public class OpportunityLostEventHandler : INotificationHandler<OpportunityLostDomainEvent>
{
    private readonly ILogger<OpportunityLostEventHandler> _logger;

    public OpportunityLostEventHandler(ILogger<OpportunityLostEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OpportunityLostDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satış fırsatı kaybedildi: {OpportunityName}, Sebep: {LostReason}, Rakip: {CompetitorName}, Tenant: {TenantId}",
            notification.OpportunityName,
            notification.LostReason,
            notification.CompetitorName,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satış fırsatı değeri güncellendiğinde tetiklenen handler
/// </summary>
public class OpportunityValueUpdatedEventHandler : INotificationHandler<OpportunityValueUpdatedDomainEvent>
{
    private readonly ILogger<OpportunityValueUpdatedEventHandler> _logger;

    public OpportunityValueUpdatedEventHandler(ILogger<OpportunityValueUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(OpportunityValueUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satış fırsatı değeri güncellendi: {OpportunityName}, Eski: {OldValue}, Yeni: {NewValue}, Tenant: {TenantId}",
            notification.OpportunityName,
            notification.OldValue,
            notification.NewValue,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
