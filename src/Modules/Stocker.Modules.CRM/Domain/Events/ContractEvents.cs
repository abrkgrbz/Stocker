using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Contract Events

/// <summary>
/// Raised when a new contract is created
/// </summary>
public sealed record ContractCreatedDomainEvent(
    Guid ContractId,
    Guid TenantId,
    string ContractNumber,
    string Title,
    Guid AccountId,
    string AccountName,
    decimal ContractValue,
    string Currency,
    DateTime StartDate,
    DateTime EndDate,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a contract is sent for signature
/// </summary>
public sealed record ContractSentForSignatureDomainEvent(
    Guid ContractId,
    Guid TenantId,
    string ContractNumber,
    string Title,
    string AccountName,
    DateTime SentDate,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a contract is signed
/// </summary>
public sealed record ContractSignedDomainEvent(
    Guid ContractId,
    Guid TenantId,
    string ContractNumber,
    string Title,
    string AccountName,
    decimal ContractValue,
    string Currency,
    DateTime SignedDate,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a contract is activated
/// </summary>
public sealed record ContractActivatedDomainEvent(
    Guid ContractId,
    Guid TenantId,
    string ContractNumber,
    string Title,
    string AccountName,
    DateTime ActivationDate,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a contract is renewed
/// </summary>
public sealed record ContractRenewedDomainEvent(
    Guid ContractId,
    Guid TenantId,
    string ContractNumber,
    string Title,
    string AccountName,
    Guid NewContractId,
    DateTime NewStartDate,
    DateTime NewEndDate,
    decimal NewContractValue,
    string Currency,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a contract is about to expire
/// </summary>
public sealed record ContractExpiringDomainEvent(
    Guid ContractId,
    Guid TenantId,
    string ContractNumber,
    string Title,
    string AccountName,
    DateTime EndDate,
    int DaysRemaining,
    decimal ContractValue,
    string Currency,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a contract expires
/// </summary>
public sealed record ContractExpiredDomainEvent(
    Guid ContractId,
    Guid TenantId,
    string ContractNumber,
    string Title,
    string AccountName,
    DateTime EndDate,
    decimal ContractValue,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a contract is terminated
/// </summary>
public sealed record ContractTerminatedDomainEvent(
    Guid ContractId,
    Guid TenantId,
    string ContractNumber,
    string Title,
    string AccountName,
    DateTime TerminationDate,
    string? TerminationReason,
    int TerminatedById) : DomainEvent;

/// <summary>
/// Raised when a contract is amended
/// </summary>
public sealed record ContractAmendedDomainEvent(
    Guid ContractId,
    Guid TenantId,
    string ContractNumber,
    string Title,
    string AccountName,
    string AmendmentDetails,
    decimal? OldValue,
    decimal? NewValue,
    int AmendedById) : DomainEvent;

#endregion
