using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region SupplierEvaluation Event Handlers

/// <summary>
/// Tedarikçi değerlendirmesi oluşturulduğunda tetiklenen handler
/// </summary>
public class SupplierEvaluationCreatedEventHandler : INotificationHandler<SupplierEvaluationCreatedDomainEvent>
{
    private readonly ILogger<SupplierEvaluationCreatedEventHandler> _logger;

    public SupplierEvaluationCreatedEventHandler(ILogger<SupplierEvaluationCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierEvaluationCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Tedarikçi değerlendirmesi oluşturuldu: {SupplierName}, Dönem: {EvaluationPeriod}, Puan: {OverallScore}, Tenant: {TenantId}",
            notification.SupplierName,
            notification.EvaluationPeriod,
            notification.OverallScore,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi performans puanı güncellendiğinde tetiklenen handler
/// </summary>
public class SupplierPerformanceScoreUpdatedEventHandler : INotificationHandler<SupplierPerformanceScoreUpdatedDomainEvent>
{
    private readonly ILogger<SupplierPerformanceScoreUpdatedEventHandler> _logger;

    public SupplierPerformanceScoreUpdatedEventHandler(ILogger<SupplierPerformanceScoreUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierPerformanceScoreUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Tedarikçi performans puanı güncellendi: {SupplierName}, Eski: {OldScore}, Yeni: {NewScore}, Kategori: {ScoreCategory}, Tenant: {TenantId}",
            notification.SupplierName,
            notification.OldScore,
            notification.NewScore,
            notification.ScoreCategory,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi uyarı aldığında tetiklenen handler
/// </summary>
public class SupplierWarningIssuedEventHandler : INotificationHandler<SupplierWarningIssuedDomainEvent>
{
    private readonly ILogger<SupplierWarningIssuedEventHandler> _logger;

    public SupplierWarningIssuedEventHandler(ILogger<SupplierWarningIssuedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierWarningIssuedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Tedarikçiye uyarı verildi: {SupplierName}, Tip: {WarningType}, Açıklama: {WarningDescription}, Tenant: {TenantId}",
            notification.SupplierName,
            notification.WarningType,
            notification.WarningDescription,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Tedarikçi tercihli statüsü kazandığında tetiklenen handler
/// </summary>
public class SupplierPreferredStatusGrantedEventHandler : INotificationHandler<SupplierPreferredStatusGrantedDomainEvent>
{
    private readonly ILogger<SupplierPreferredStatusGrantedEventHandler> _logger;

    public SupplierPreferredStatusGrantedEventHandler(ILogger<SupplierPreferredStatusGrantedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SupplierPreferredStatusGrantedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Tedarikçi tercihli statü kazandı: {SupplierName}, Sebep: {Reason}, Tenant: {TenantId}",
            notification.SupplierName,
            notification.Reason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
