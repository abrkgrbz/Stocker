using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region Supplier Events

/// <summary>
/// Tedarikçi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SupplierCreatedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string SupplierCode,
    string SupplierName,
    string TaxNumber,
    int? CategoryId) : DomainEvent;

/// <summary>
/// Tedarikçi güncellendiğinde tetiklenen event
/// </summary>
public sealed record SupplierUpdatedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string SupplierCode,
    string SupplierName) : DomainEvent;

/// <summary>
/// Tedarikçi aktifleştirildiğinde tetiklenen event
/// </summary>
public sealed record SupplierActivatedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string SupplierCode,
    string SupplierName) : DomainEvent;

/// <summary>
/// Tedarikçi pasifleştirildiğinde tetiklenen event
/// </summary>
public sealed record SupplierDeactivatedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string SupplierCode,
    string SupplierName,
    string DeactivationReason) : DomainEvent;

/// <summary>
/// Tedarikçi kara listeye alındığında tetiklenen event
/// </summary>
public sealed record SupplierBlacklistedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string SupplierCode,
    string SupplierName,
    string BlacklistReason,
    DateTime BlacklistedAt) : DomainEvent;

#endregion
