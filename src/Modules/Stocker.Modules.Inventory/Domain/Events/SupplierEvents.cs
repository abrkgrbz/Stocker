using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

/// <summary>
/// Tedarikçi oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record SupplierCreatedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Tedarikçi bilgileri güncellendiğinde tetiklenen event.
/// </summary>
public sealed record SupplierUpdatedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string Code,
    string Name,
    string? TaxNumber) : DomainEvent;

/// <summary>
/// Tedarikçi kredi bilgileri değiştirildiğinde tetiklenen event.
/// </summary>
public sealed record SupplierCreditInfoChangedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string Code,
    decimal CreditLimit,
    int PaymentTerm) : DomainEvent;

/// <summary>
/// Tedarikçi aktifleştirildiğinde tetiklenen event.
/// </summary>
public sealed record SupplierActivatedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

/// <summary>
/// Tedarikçi pasifleştirildiğinde tetiklenen event.
/// Tedarikçi pasifleştirildiğinde satınalma süreçleri etkilenebilir.
/// </summary>
public sealed record SupplierDeactivatedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;
