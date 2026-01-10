using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region FixedAsset Event Handlers

/// <summary>
/// Duran varlık oluşturulduğunda tetiklenen handler
/// </summary>
public class FixedAssetCreatedEventHandler : INotificationHandler<FixedAssetCreatedDomainEvent>
{
    private readonly ILogger<FixedAssetCreatedEventHandler> _logger;

    public FixedAssetCreatedEventHandler(ILogger<FixedAssetCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(FixedAssetCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Duran varlık oluşturuldu: {AssetCode} - {AssetName}, Tip: {AssetType}, Maliyet: {AcquisitionCost}, Tenant: {TenantId}",
            notification.AssetCode,
            notification.AssetName,
            notification.AssetType,
            notification.AcquisitionCost,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Duran varlık amortismana tabi tutulduğunda tetiklenen handler
/// </summary>
public class FixedAssetDepreciatedEventHandler : INotificationHandler<FixedAssetDepreciatedDomainEvent>
{
    private readonly ILogger<FixedAssetDepreciatedEventHandler> _logger;

    public FixedAssetDepreciatedEventHandler(ILogger<FixedAssetDepreciatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(FixedAssetDepreciatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Duran varlık amortismana tabi tutuldu: {AssetCode}, Amortisman: {DepreciationAmount}, Defter Değeri: {BookValue}, Tenant: {TenantId}",
            notification.AssetCode,
            notification.DepreciationAmount,
            notification.BookValue,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Duran varlık satıldığında tetiklenen handler
/// </summary>
public class FixedAssetSoldEventHandler : INotificationHandler<FixedAssetSoldDomainEvent>
{
    private readonly ILogger<FixedAssetSoldEventHandler> _logger;

    public FixedAssetSoldEventHandler(ILogger<FixedAssetSoldEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(FixedAssetSoldDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Duran varlık satıldı: {AssetCode}, Satış Fiyatı: {SalePrice}, Kar/Zarar: {GainOrLoss}, Tenant: {TenantId}",
            notification.AssetCode,
            notification.SalePrice,
            notification.GainOrLoss,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Duran varlık hurdaya ayrıldığında tetiklenen handler
/// </summary>
public class FixedAssetDisposedEventHandler : INotificationHandler<FixedAssetDisposedDomainEvent>
{
    private readonly ILogger<FixedAssetDisposedEventHandler> _logger;

    public FixedAssetDisposedEventHandler(ILogger<FixedAssetDisposedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(FixedAssetDisposedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Duran varlık hurdaya ayrıldı: {AssetCode} - {AssetName}, Sebep: {DisposalReason}, Tenant: {TenantId}",
            notification.AssetCode,
            notification.AssetName,
            notification.DisposalReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
