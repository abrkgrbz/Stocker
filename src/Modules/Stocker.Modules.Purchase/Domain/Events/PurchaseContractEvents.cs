using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region PurchaseContract Events

/// <summary>
/// Satın alma sözleşmesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record PurchaseContractCreatedDomainEvent(
    int PurchaseContractId,
    Guid TenantId,
    string ContractNumber,
    int SupplierId,
    string SupplierName,
    decimal ContractValue,
    DateTime StartDate,
    DateTime EndDate) : DomainEvent;

/// <summary>
/// Satın alma sözleşmesi aktifleştirildiğinde tetiklenen event
/// </summary>
public sealed record PurchaseContractActivatedDomainEvent(
    int PurchaseContractId,
    Guid TenantId,
    string ContractNumber,
    DateTime ActivatedAt) : DomainEvent;

/// <summary>
/// Satın alma sözleşmesi yenilendiğinde tetiklenen event
/// </summary>
public sealed record PurchaseContractRenewedDomainEvent(
    int PurchaseContractId,
    Guid TenantId,
    string ContractNumber,
    DateTime OldEndDate,
    DateTime NewEndDate,
    decimal NewContractValue) : DomainEvent;

/// <summary>
/// Satın alma sözleşmesi sona erdiğinde tetiklenen event
/// </summary>
public sealed record PurchaseContractExpiredDomainEvent(
    int PurchaseContractId,
    Guid TenantId,
    string ContractNumber,
    DateTime ExpiredAt) : DomainEvent;

/// <summary>
/// Satın alma sözleşmesi feshedildiğinde tetiklenen event
/// </summary>
public sealed record PurchaseContractTerminatedDomainEvent(
    int PurchaseContractId,
    Guid TenantId,
    string ContractNumber,
    string TerminationReason,
    DateTime TerminatedAt) : DomainEvent;

#endregion
