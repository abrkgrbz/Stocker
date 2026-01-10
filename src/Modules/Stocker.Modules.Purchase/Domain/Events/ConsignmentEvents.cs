using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region Consignment Events

/// <summary>
/// Konsinye stok oluşturulduğunda tetiklenen event
/// </summary>
public sealed record ConsignmentCreatedDomainEvent(
    int ConsignmentId,
    Guid TenantId,
    string ConsignmentNumber,
    int SupplierId,
    string SupplierName,
    DateTime ValidFrom,
    DateTime ValidTo) : DomainEvent;

/// <summary>
/// Konsinye stok tüketildiğinde tetiklenen event
/// </summary>
public sealed record ConsignmentConsumedDomainEvent(
    int ConsignmentId,
    Guid TenantId,
    string ConsignmentNumber,
    int ProductId,
    decimal ConsumedQuantity,
    decimal RemainingQuantity) : DomainEvent;

/// <summary>
/// Konsinye stok iade edildiğinde tetiklenen event
/// </summary>
public sealed record ConsignmentReturnedDomainEvent(
    int ConsignmentId,
    Guid TenantId,
    string ConsignmentNumber,
    decimal ReturnedQuantity,
    string ReturnReason,
    DateTime ReturnedAt) : DomainEvent;

/// <summary>
/// Konsinye süresi dolduğunda tetiklenen event
/// </summary>
public sealed record ConsignmentExpiredDomainEvent(
    int ConsignmentId,
    Guid TenantId,
    string ConsignmentNumber,
    decimal RemainingQuantity,
    DateTime ExpiredAt) : DomainEvent;

#endregion
