using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Lot/Parti oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record LotBatchCreatedDomainEvent(
    int LotBatchId,
    Guid TenantId,
    string LotNumber,
    int ProductId,
    decimal InitialQuantity,
    DateTime? ExpiryDate) : DomainEvent;

/// <summary>
/// Lot/Parti teslim alındığında tetiklenen event.
/// </summary>
public sealed record LotBatchReceivedDomainEvent(
    int LotBatchId,
    Guid TenantId,
    string LotNumber,
    int ProductId,
    decimal Quantity,
    DateTime ReceivedDate) : DomainEvent;

/// <summary>
/// Lot/Parti onaylandığında (kalite kontrolden geçtiğinde) tetiklenen event.
/// </summary>
public sealed record LotBatchApprovedDomainEvent(
    int LotBatchId,
    Guid TenantId,
    string LotNumber,
    int ProductId,
    decimal CurrentQuantity) : DomainEvent;

/// <summary>
/// Lot/Parti karantinaya alındığında tetiklenen event.
/// </summary>
public sealed record LotBatchQuarantinedDomainEvent(
    int LotBatchId,
    Guid TenantId,
    string LotNumber,
    int ProductId,
    string Reason,
    DateTime QuarantinedDate) : DomainEvent;

/// <summary>
/// Lot/Parti karantinadan çıkarıldığında tetiklenen event.
/// </summary>
public sealed record LotBatchReleasedFromQuarantineDomainEvent(
    int LotBatchId,
    Guid TenantId,
    string LotNumber,
    int ProductId) : DomainEvent;

/// <summary>
/// Lot/Parti reddedildiğinde tetiklenen event.
/// </summary>
public sealed record LotBatchRejectedDomainEvent(
    int LotBatchId,
    Guid TenantId,
    string LotNumber,
    int ProductId,
    string? Reason) : DomainEvent;

/// <summary>
/// Lot/Parti tüketildiğinde (stoktan düşüldüğünde) tetiklenen event.
/// </summary>
public sealed record LotBatchConsumedDomainEvent(
    int LotBatchId,
    Guid TenantId,
    string LotNumber,
    int ProductId,
    decimal ConsumedQuantity,
    decimal RemainingQuantity) : DomainEvent;

/// <summary>
/// Lot/Parti tamamen tükendiğinde tetiklenen event.
/// </summary>
public sealed record LotBatchExhaustedDomainEvent(
    int LotBatchId,
    Guid TenantId,
    string LotNumber,
    int ProductId) : DomainEvent;

/// <summary>
/// Lot/Parti son kullanma tarihi yaklaştığında tetiklenen event.
/// </summary>
public sealed record LotBatchExpiringDomainEvent(
    int LotBatchId,
    Guid TenantId,
    string LotNumber,
    int ProductId,
    DateTime ExpiryDate,
    int DaysUntilExpiry) : DomainEvent;

/// <summary>
/// Lot/Parti son kullanma tarihi geçtiğinde tetiklenen event.
/// </summary>
public sealed record LotBatchExpiredDomainEvent(
    int LotBatchId,
    Guid TenantId,
    string LotNumber,
    int ProductId,
    DateTime ExpiryDate,
    decimal RemainingQuantity) : DomainEvent;
