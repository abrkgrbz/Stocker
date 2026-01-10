using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region ImportDeclaration Events

/// <summary>
/// İthalat beyannamesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record ImportDeclarationCreatedDomainEvent(
    int ImportDeclarationId,
    Guid TenantId,
    string DeclarationNumber,
    string CustomsOffice,
    decimal TotalValue,
    string Currency) : DomainEvent;

/// <summary>
/// İthalat beyannamesi gümrüğe sunulduğunda tetiklenen event
/// </summary>
public sealed record ImportDeclarationSubmittedDomainEvent(
    int ImportDeclarationId,
    Guid TenantId,
    string DeclarationNumber,
    DateTime SubmittedAt,
    string SubmissionReference) : DomainEvent;

/// <summary>
/// İthalat beyannamesi onaylandığında tetiklenen event
/// </summary>
public sealed record ImportDeclarationApprovedDomainEvent(
    int ImportDeclarationId,
    Guid TenantId,
    string DeclarationNumber,
    DateTime ApprovedAt,
    string ApprovalNumber) : DomainEvent;

/// <summary>
/// Gümrük vergisi ödendiğinde tetiklenen event
/// </summary>
public sealed record CustomsDutyPaidDomainEvent(
    int ImportDeclarationId,
    Guid TenantId,
    string DeclarationNumber,
    decimal DutyAmount,
    DateTime PaidAt) : DomainEvent;

/// <summary>
/// Mallar gümrükten çekildiğinde tetiklenen event
/// </summary>
public sealed record GoodsClearedFromCustomsDomainEvent(
    int ImportDeclarationId,
    Guid TenantId,
    string DeclarationNumber,
    DateTime ClearedAt) : DomainEvent;

#endregion
