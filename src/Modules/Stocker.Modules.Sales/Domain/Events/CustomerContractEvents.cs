using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region CustomerContract Events

/// <summary>
/// Müşteri sözleşmesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record CustomerContractCreatedDomainEvent(
    Guid CustomerContractId,
    Guid TenantId,
    string ContractNumber,
    Guid? CustomerId,
    string CustomerName,
    decimal ContractValue,
    DateTime StartDate,
    DateTime EndDate) : DomainEvent;

/// <summary>
/// Müşteri sözleşmesi aktifleştirildiğinde tetiklenen event
/// </summary>
public sealed record CustomerContractActivatedDomainEvent(
    Guid CustomerContractId,
    Guid TenantId,
    string ContractNumber,
    DateTime ActivatedAt) : DomainEvent;

/// <summary>
/// Müşteri sözleşmesi yenilendiğinde tetiklenen event
/// </summary>
public sealed record CustomerContractRenewedDomainEvent(
    Guid CustomerContractId,
    Guid TenantId,
    string ContractNumber,
    DateTime OldEndDate,
    DateTime NewEndDate,
    decimal NewContractValue) : DomainEvent;

/// <summary>
/// Müşteri sözleşmesi sona erdiğinde tetiklenen event
/// </summary>
public sealed record CustomerContractExpiredDomainEvent(
    Guid CustomerContractId,
    Guid TenantId,
    string ContractNumber,
    DateTime ExpiredAt) : DomainEvent;

/// <summary>
/// Müşteri sözleşmesi feshedildiğinde tetiklenen event
/// </summary>
public sealed record CustomerContractTerminatedDomainEvent(
    Guid CustomerContractId,
    Guid TenantId,
    string ContractNumber,
    string TerminationReason,
    DateTime TerminatedAt) : DomainEvent;

#endregion
