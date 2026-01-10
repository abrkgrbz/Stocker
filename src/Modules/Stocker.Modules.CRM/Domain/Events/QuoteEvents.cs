using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Quote Events

/// <summary>
/// Raised when a new quote is created
/// </summary>
public sealed record QuoteCreatedDomainEvent(
    Guid QuoteId,
    Guid TenantId,
    string QuoteNumber,
    string QuoteName,
    Guid? AccountId,
    string? AccountName,
    decimal TotalAmount,
    string Currency,
    DateTime? ExpirationDate,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a quote is sent to customer
/// </summary>
public sealed record QuoteSentDomainEvent(
    Guid QuoteId,
    Guid TenantId,
    string QuoteNumber,
    string QuoteName,
    string? AccountName,
    decimal TotalAmount,
    string Currency,
    DateTime SentDate,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a quote is approved
/// </summary>
public sealed record QuoteApprovedDomainEvent(
    Guid QuoteId,
    Guid TenantId,
    string QuoteNumber,
    string QuoteName,
    decimal TotalAmount,
    string Currency,
    int ApprovedById,
    string ApprovedByName) : DomainEvent;

/// <summary>
/// Raised when a quote is rejected
/// </summary>
public sealed record QuoteRejectedDomainEvent(
    Guid QuoteId,
    Guid TenantId,
    string QuoteNumber,
    string QuoteName,
    string? AccountName,
    string RejectionReason,
    int RejectedById) : DomainEvent;

/// <summary>
/// Raised when a quote is accepted by customer
/// </summary>
public sealed record QuoteAcceptedDomainEvent(
    Guid QuoteId,
    Guid TenantId,
    string QuoteNumber,
    string QuoteName,
    string? AccountName,
    decimal TotalAmount,
    string Currency,
    DateTime AcceptedDate,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a quote expires
/// </summary>
public sealed record QuoteExpiredDomainEvent(
    Guid QuoteId,
    Guid TenantId,
    string QuoteNumber,
    string QuoteName,
    string? AccountName,
    decimal TotalAmount,
    DateTime ExpirationDate,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a quote is about to expire
/// </summary>
public sealed record QuoteExpiringDomainEvent(
    Guid QuoteId,
    Guid TenantId,
    string QuoteNumber,
    string QuoteName,
    string? AccountName,
    decimal TotalAmount,
    DateTime ExpirationDate,
    int DaysRemaining,
    int OwnerId) : DomainEvent;

/// <summary>
/// Raised when a quote is converted to order/contract
/// </summary>
public sealed record QuoteConvertedDomainEvent(
    Guid QuoteId,
    Guid TenantId,
    string QuoteNumber,
    string QuoteName,
    Guid? ConvertedToId,
    string ConvertedToType,
    decimal TotalAmount,
    string Currency,
    int OwnerId) : DomainEvent;

#endregion
