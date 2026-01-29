using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region PriceList Events

/// <summary>
/// Satış fiyat listesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SalesPriceListCreatedDomainEvent(
    Guid PriceListId,
    Guid TenantId,
    string PriceListName,
    string Currency,
    DateTime ValidFrom,
    DateTime ValidTo) : DomainEvent;

/// <summary>
/// Satış fiyat listesi güncellendiğinde tetiklenen event
/// </summary>
public sealed record SalesPriceListUpdatedDomainEvent(
    Guid PriceListId,
    Guid TenantId,
    string PriceListName,
    int UpdatedItemCount) : DomainEvent;

/// <summary>
/// Satış fiyat listesi aktifleştirildiğinde tetiklenen event
/// </summary>
public sealed record SalesPriceListActivatedDomainEvent(
    Guid PriceListId,
    Guid TenantId,
    string PriceListName,
    DateTime ActivatedAt) : DomainEvent;

/// <summary>
/// Satış fiyat listesi süresi dolduğunda tetiklenen event
/// </summary>
public sealed record SalesPriceListExpiredDomainEvent(
    Guid PriceListId,
    Guid TenantId,
    string PriceListName,
    DateTime ExpiredAt) : DomainEvent;

#endregion
