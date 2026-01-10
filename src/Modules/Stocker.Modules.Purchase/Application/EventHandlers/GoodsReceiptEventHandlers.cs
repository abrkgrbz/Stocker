using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region GoodsReceipt Event Handlers

/// <summary>
/// Mal kabul belgesi oluşturulduğunda tetiklenen handler
/// </summary>
public class GoodsReceiptCreatedEventHandler : INotificationHandler<GoodsReceiptCreatedDomainEvent>
{
    private readonly ILogger<GoodsReceiptCreatedEventHandler> _logger;

    public GoodsReceiptCreatedEventHandler(ILogger<GoodsReceiptCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(GoodsReceiptCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Mal kabul belgesi oluşturuldu: {ReceiptNumber}, Sipariş: {OrderNumber}, Tenant: {TenantId}",
            notification.ReceiptNumber,
            notification.OrderNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Mal kabul belgesi onaylandığında tetiklenen handler
/// </summary>
public class GoodsReceiptApprovedEventHandler : INotificationHandler<GoodsReceiptApprovedDomainEvent>
{
    private readonly ILogger<GoodsReceiptApprovedEventHandler> _logger;

    public GoodsReceiptApprovedEventHandler(ILogger<GoodsReceiptApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(GoodsReceiptApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Mal kabul belgesi onaylandı: {ReceiptNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.ReceiptNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Kalite kontrolü tamamlandığında tetiklenen handler
/// </summary>
public class QualityInspectionCompletedEventHandler : INotificationHandler<QualityInspectionCompletedDomainEvent>
{
    private readonly ILogger<QualityInspectionCompletedEventHandler> _logger;

    public QualityInspectionCompletedEventHandler(ILogger<QualityInspectionCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(QualityInspectionCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Kalite kontrolü tamamlandı: {ReceiptNumber}, Geçen: {PassedQuantity}, Kalan: {FailedQuantity}, Sonuç: {InspectionResult}, Tenant: {TenantId}",
            notification.ReceiptNumber,
            notification.PassedQuantity,
            notification.FailedQuantity,
            notification.InspectionResult,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Mal kabul uyumsuzluğu tespit edildiğinde tetiklenen handler
/// </summary>
public class GoodsReceiptDiscrepancyFoundEventHandler : INotificationHandler<GoodsReceiptDiscrepancyFoundDomainEvent>
{
    private readonly ILogger<GoodsReceiptDiscrepancyFoundEventHandler> _logger;

    public GoodsReceiptDiscrepancyFoundEventHandler(ILogger<GoodsReceiptDiscrepancyFoundEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(GoodsReceiptDiscrepancyFoundDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Mal kabul uyumsuzluğu: {ReceiptNumber}, Tip: {DiscrepancyType}, Fark: {QuantityDifference}, Tenant: {TenantId}",
            notification.ReceiptNumber,
            notification.DiscrepancyType,
            notification.QuantityDifference,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
