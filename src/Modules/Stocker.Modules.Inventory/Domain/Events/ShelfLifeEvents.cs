using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region ShelfLife Events

/// <summary>
/// Raf ömrü tanımlandığında tetiklenen event.
/// </summary>
public sealed record ShelfLifeDefinedDomainEvent(
    int ShelfLifeId,
    Guid TenantId,
    int ProductId,
    int ShelfLifeDays,
    int WarningDays) : DomainEvent;

/// <summary>
/// Raf ömrü güncellendiğinde tetiklenen event.
/// </summary>
public sealed record ShelfLifeUpdatedDomainEvent(
    int ShelfLifeId,
    Guid TenantId,
    int ProductId,
    int OldShelfLifeDays,
    int NewShelfLifeDays) : DomainEvent;

/// <summary>
/// Raf ömrü uyarısı tetiklendiğinde event.
/// </summary>
public sealed record ShelfLifeWarningTriggeredDomainEvent(
    int ShelfLifeId,
    Guid TenantId,
    int ProductId,
    string ProductName,
    int DaysRemaining,
    decimal AffectedQuantity,
    string? LotNumber) : DomainEvent;

/// <summary>
/// Raf ömrü dolduğunda tetiklenen event.
/// </summary>
public sealed record ShelfLifeExpiredDomainEvent(
    int ShelfLifeId,
    Guid TenantId,
    int ProductId,
    string ProductName,
    decimal ExpiredQuantity,
    string? LotNumber,
    DateTime ExpiryDate) : DomainEvent;

/// <summary>
/// Süresi dolan ürün imha edildiğinde tetiklenen event.
/// </summary>
public sealed record ExpiredProductDisposedDomainEvent(
    int ShelfLifeId,
    Guid TenantId,
    int ProductId,
    decimal DisposedQuantity,
    string DisposalMethod,
    int DisposedById) : DomainEvent;

#endregion
