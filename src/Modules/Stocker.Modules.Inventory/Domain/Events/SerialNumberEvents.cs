using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Seri numarası oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record SerialNumberCreatedDomainEvent(
    int SerialNumberId,
    Guid TenantId,
    string Serial,
    int ProductId) : DomainEvent;

/// <summary>
/// Seri numarası teslim alındığında tetiklenen event.
/// </summary>
public sealed record SerialNumberReceivedDomainEvent(
    int SerialNumberId,
    Guid TenantId,
    string Serial,
    int ProductId,
    int? WarehouseId,
    DateTime ReceivedDate) : DomainEvent;

/// <summary>
/// Seri numarası rezerve edildiğinde tetiklenen event.
/// </summary>
public sealed record SerialNumberReservedDomainEvent(
    int SerialNumberId,
    Guid TenantId,
    string Serial,
    int ProductId,
    Guid SalesOrderId) : DomainEvent;

/// <summary>
/// Seri numarası rezervasyonu serbest bırakıldığında tetiklenen event.
/// </summary>
public sealed record SerialNumberReservationReleasedDomainEvent(
    int SerialNumberId,
    Guid TenantId,
    string Serial,
    int ProductId) : DomainEvent;

/// <summary>
/// Seri numarası satıldığında tetiklenen event.
/// </summary>
public sealed record SerialNumberSoldDomainEvent(
    int SerialNumberId,
    Guid TenantId,
    string Serial,
    int ProductId,
    Guid CustomerId,
    Guid SalesOrderId,
    DateTime SoldDate,
    DateTime? WarrantyEndDate) : DomainEvent;

/// <summary>
/// Seri numarası iade edildiğinde tetiklenen event.
/// </summary>
public sealed record SerialNumberReturnedDomainEvent(
    int SerialNumberId,
    Guid TenantId,
    string Serial,
    int ProductId,
    int WarehouseId,
    DateTime ReturnedDate) : DomainEvent;

/// <summary>
/// Seri numarası arızalı olarak işaretlendiğinde tetiklenen event.
/// </summary>
public sealed record SerialNumberMarkedDefectiveDomainEvent(
    int SerialNumberId,
    Guid TenantId,
    string Serial,
    int ProductId,
    string? Reason) : DomainEvent;

/// <summary>
/// Seri numarası tamir için gönderildiğinde tetiklenen event.
/// </summary>
public sealed record SerialNumberSentToRepairDomainEvent(
    int SerialNumberId,
    Guid TenantId,
    string Serial,
    int ProductId) : DomainEvent;

/// <summary>
/// Seri numarası tamiri tamamlandığında tetiklenen event.
/// </summary>
public sealed record SerialNumberRepairCompletedDomainEvent(
    int SerialNumberId,
    Guid TenantId,
    string Serial,
    int ProductId) : DomainEvent;

/// <summary>
/// Seri numarası hurda olarak işaretlendiğinde tetiklenen event.
/// </summary>
public sealed record SerialNumberScrappedDomainEvent(
    int SerialNumberId,
    Guid TenantId,
    string Serial,
    int ProductId,
    string? Reason) : DomainEvent;

/// <summary>
/// Seri numarası kayıp olarak işaretlendiğinde tetiklenen event.
/// </summary>
public sealed record SerialNumberLostDomainEvent(
    int SerialNumberId,
    Guid TenantId,
    string Serial,
    int ProductId,
    string? Reason) : DomainEvent;
