using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region PurchaseBudget Event Handlers

/// <summary>
/// Satın alma bütçesi oluşturulduğunda tetiklenen handler
/// </summary>
public class PurchaseBudgetCreatedEventHandler : INotificationHandler<PurchaseBudgetCreatedDomainEvent>
{
    private readonly ILogger<PurchaseBudgetCreatedEventHandler> _logger;

    public PurchaseBudgetCreatedEventHandler(ILogger<PurchaseBudgetCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseBudgetCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma bütçesi oluşturuldu: {BudgetName}, Yıl: {FiscalYear}, Tutar: {AllocatedAmount} {Currency}, Tenant: {TenantId}",
            notification.BudgetName,
            notification.FiscalYear,
            notification.AllocatedAmount,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma bütçesi onaylandığında tetiklenen handler
/// </summary>
public class PurchaseBudgetApprovedEventHandler : INotificationHandler<PurchaseBudgetApprovedDomainEvent>
{
    private readonly ILogger<PurchaseBudgetApprovedEventHandler> _logger;

    public PurchaseBudgetApprovedEventHandler(ILogger<PurchaseBudgetApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseBudgetApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Satın alma bütçesi onaylandı: {BudgetName}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.BudgetName,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma bütçesi aşıldığında tetiklenen handler
/// </summary>
public class PurchaseBudgetExceededEventHandler : INotificationHandler<PurchaseBudgetExceededDomainEvent>
{
    private readonly ILogger<PurchaseBudgetExceededEventHandler> _logger;

    public PurchaseBudgetExceededEventHandler(ILogger<PurchaseBudgetExceededEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseBudgetExceededDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satın alma bütçesi aşıldı: {BudgetName}, Bütçe: {BudgetAmount}, Gerçekleşen: {ActualAmount}, Aşım: {ExceededAmount}, Tenant: {TenantId}",
            notification.BudgetName,
            notification.BudgetAmount,
            notification.ActualAmount,
            notification.ExceededAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Satın alma bütçesi eşik değerine ulaştığında tetiklenen handler
/// </summary>
public class PurchaseBudgetThresholdReachedEventHandler : INotificationHandler<PurchaseBudgetThresholdReachedDomainEvent>
{
    private readonly ILogger<PurchaseBudgetThresholdReachedEventHandler> _logger;

    public PurchaseBudgetThresholdReachedEventHandler(ILogger<PurchaseBudgetThresholdReachedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PurchaseBudgetThresholdReachedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Satın alma bütçesi eşiğe ulaştı: {BudgetName}, Eşik: %{ThresholdPercentage}, Kullanım: %{CurrentUsagePercentage}, Tenant: {TenantId}",
            notification.BudgetName,
            notification.ThresholdPercentage,
            notification.CurrentUsagePercentage,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
