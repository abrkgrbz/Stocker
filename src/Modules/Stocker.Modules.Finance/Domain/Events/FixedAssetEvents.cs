using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region FixedAsset Events

/// <summary>
/// Duran varlık oluşturulduğunda tetiklenen event
/// </summary>
public sealed record FixedAssetCreatedDomainEvent(
    int FixedAssetId,
    Guid TenantId,
    string AssetCode,
    string AssetName,
    string AssetType,
    decimal AcquisitionCost,
    DateTime AcquisitionDate) : DomainEvent;

/// <summary>
/// Duran varlık amortismana tabi tutulduğunda tetiklenen event
/// </summary>
public sealed record FixedAssetDepreciatedDomainEvent(
    int FixedAssetId,
    Guid TenantId,
    string AssetCode,
    string AssetName,
    decimal DepreciationAmount,
    decimal AccumulatedDepreciation,
    decimal BookValue) : DomainEvent;

/// <summary>
/// Duran varlık satıldığında tetiklenen event
/// </summary>
public sealed record FixedAssetSoldDomainEvent(
    int FixedAssetId,
    Guid TenantId,
    string AssetCode,
    string AssetName,
    decimal SalePrice,
    decimal BookValue,
    decimal GainOrLoss,
    DateTime SoldAt) : DomainEvent;

/// <summary>
/// Duran varlık hurdaya ayrıldığında tetiklenen event
/// </summary>
public sealed record FixedAssetDisposedDomainEvent(
    int FixedAssetId,
    Guid TenantId,
    string AssetCode,
    string AssetName,
    string DisposalReason,
    DateTime DisposedAt) : DomainEvent;

#endregion
