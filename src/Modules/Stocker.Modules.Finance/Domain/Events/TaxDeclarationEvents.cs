using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Finance.Domain.Events;

#region TaxDeclaration Events

/// <summary>
/// Vergi beyannamesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record TaxDeclarationCreatedDomainEvent(
    int TaxDeclarationId,
    Guid TenantId,
    string DeclarationNumber,
    string TaxType,
    string Period,
    decimal TaxAmount,
    DateTime DueDate) : DomainEvent;

/// <summary>
/// Vergi beyannamesi gönderildiğinde tetiklenen event
/// </summary>
public sealed record TaxDeclarationSubmittedDomainEvent(
    int TaxDeclarationId,
    Guid TenantId,
    string DeclarationNumber,
    string TaxType,
    DateTime SubmittedAt,
    string SubmissionReference) : DomainEvent;

/// <summary>
/// Vergi ödendiğinde tetiklenen event
/// </summary>
public sealed record TaxPaidDomainEvent(
    int TaxDeclarationId,
    Guid TenantId,
    string DeclarationNumber,
    decimal PaidAmount,
    DateTime PaidAt,
    string PaymentReference) : DomainEvent;

/// <summary>
/// Vergi beyannamesi düzeltildiğinde tetiklenen event
/// </summary>
public sealed record TaxDeclarationAmendedDomainEvent(
    int TaxDeclarationId,
    Guid TenantId,
    string DeclarationNumber,
    decimal OldAmount,
    decimal NewAmount,
    string AmendmentReason,
    DateTime AmendedAt) : DomainEvent;

#endregion
