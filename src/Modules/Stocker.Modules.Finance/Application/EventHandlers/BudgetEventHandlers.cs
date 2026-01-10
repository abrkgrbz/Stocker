using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region Budget Event Handlers

/// <summary>
/// Bütçe oluşturulduğunda tetiklenen handler
/// </summary>
public class BudgetCreatedEventHandler : INotificationHandler<BudgetCreatedDomainEvent>
{
    private readonly ILogger<BudgetCreatedEventHandler> _logger;

    public BudgetCreatedEventHandler(ILogger<BudgetCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BudgetCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Bütçe oluşturuldu: {BudgetName}, Yıl: {FiscalYear}, Tutar: {TotalAmount} {Currency}, Tenant: {TenantId}",
            notification.BudgetName,
            notification.FiscalYear,
            notification.TotalAmount,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Bütçe onaylandığında tetiklenen handler
/// </summary>
public class BudgetApprovedEventHandler : INotificationHandler<BudgetApprovedDomainEvent>
{
    private readonly ILogger<BudgetApprovedEventHandler> _logger;

    public BudgetApprovedEventHandler(ILogger<BudgetApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BudgetApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Bütçe onaylandı: {BudgetName}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.BudgetName,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Bütçe aşıldığında tetiklenen handler
/// </summary>
public class BudgetExceededEventHandler : INotificationHandler<BudgetExceededDomainEvent>
{
    private readonly ILogger<BudgetExceededEventHandler> _logger;

    public BudgetExceededEventHandler(ILogger<BudgetExceededEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BudgetExceededDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Bütçe aşıldı: {BudgetName}, Bütçe: {BudgetAmount}, Gerçekleşen: {ActualAmount}, Aşım: {ExceededAmount}, Tenant: {TenantId}",
            notification.BudgetName,
            notification.BudgetAmount,
            notification.ActualAmount,
            notification.ExceededAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Bütçe revize edildiğinde tetiklenen handler
/// </summary>
public class BudgetRevisedEventHandler : INotificationHandler<BudgetRevisedDomainEvent>
{
    private readonly ILogger<BudgetRevisedEventHandler> _logger;

    public BudgetRevisedEventHandler(ILogger<BudgetRevisedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BudgetRevisedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Bütçe revize edildi: {BudgetName}, Eski: {OldAmount}, Yeni: {NewAmount}, Sebep: {RevisionReason}, Tenant: {TenantId}",
            notification.BudgetName,
            notification.OldAmount,
            notification.NewAmount,
            notification.RevisionReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
