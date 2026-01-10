using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Promotion Events

/// <summary>
/// Promosyon oluşturulduğunda tetiklenen event
/// </summary>
public sealed record PromotionCreatedDomainEvent(
    int PromotionId,
    Guid TenantId,
    string PromotionCode,
    string PromotionName,
    string DiscountType,
    decimal DiscountValue,
    DateTime StartDate,
    DateTime EndDate) : DomainEvent;

/// <summary>
/// Promosyon aktifleştirildiğinde tetiklenen event
/// </summary>
public sealed record PromotionActivatedDomainEvent(
    int PromotionId,
    Guid TenantId,
    string PromotionCode,
    string PromotionName,
    DateTime ActivatedAt) : DomainEvent;

/// <summary>
/// Promosyon uygulandığında tetiklenen event
/// </summary>
public sealed record PromotionAppliedDomainEvent(
    int PromotionId,
    Guid TenantId,
    string PromotionCode,
    int SalesOrderId,
    string OrderNumber,
    decimal DiscountAmount) : DomainEvent;

/// <summary>
/// Promosyon kullanım limiti dolduğunda tetiklenen event
/// </summary>
public sealed record PromotionUsageLimitReachedDomainEvent(
    int PromotionId,
    Guid TenantId,
    string PromotionCode,
    int UsageCount,
    int UsageLimit) : DomainEvent;

/// <summary>
/// Promosyon süresi dolduğunda tetiklenen event
/// </summary>
public sealed record PromotionExpiredDomainEvent(
    int PromotionId,
    Guid TenantId,
    string PromotionCode,
    DateTime ExpiredAt) : DomainEvent;

#endregion
