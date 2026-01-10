using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region PriceList Events

/// <summary>
/// Fiyat listesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record PriceListCreatedDomainEvent(
    int PriceListId,
    Guid TenantId,
    string PriceListName,
    int SupplierId,
    string SupplierName,
    string Currency,
    DateTime ValidFrom,
    DateTime ValidTo) : DomainEvent;

/// <summary>
/// Fiyat listesi güncellendiğinde tetiklenen event
/// </summary>
public sealed record PriceListUpdatedDomainEvent(
    int PriceListId,
    Guid TenantId,
    string PriceListName,
    int UpdatedItemCount) : DomainEvent;

/// <summary>
/// Fiyat listesi aktifleştirildiğinde tetiklenen event
/// </summary>
public sealed record PriceListActivatedDomainEvent(
    int PriceListId,
    Guid TenantId,
    string PriceListName,
    DateTime ActivatedAt) : DomainEvent;

/// <summary>
/// Fiyat listesi süresi dolduğunda tetiklenen event
/// </summary>
public sealed record PriceListExpiredDomainEvent(
    int PriceListId,
    Guid TenantId,
    string PriceListName,
    DateTime ExpiredAt) : DomainEvent;

#endregion
