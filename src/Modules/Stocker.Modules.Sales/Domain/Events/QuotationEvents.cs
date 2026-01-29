using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Quotation Events

/// <summary>
/// Teklif oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SalesQuotationCreatedDomainEvent(
    Guid QuotationId,
    Guid TenantId,
    string QuotationNumber,
    Guid? CustomerId,
    string CustomerName,
    decimal TotalAmount,
    string Currency,
    DateTime ValidUntil) : DomainEvent;

/// <summary>
/// Teklif gönderildiğinde tetiklenen event
/// </summary>
public sealed record SalesQuotationSentDomainEvent(
    Guid QuotationId,
    Guid TenantId,
    string QuotationNumber,
    string CustomerEmail,
    DateTime SentAt) : DomainEvent;

/// <summary>
/// Teklif kabul edildiğinde tetiklenen event
/// </summary>
public sealed record SalesQuotationAcceptedDomainEvent(
    Guid QuotationId,
    Guid TenantId,
    string QuotationNumber,
    Guid? CustomerId,
    Guid SalesOrderId,
    DateTime AcceptedAt) : DomainEvent;

/// <summary>
/// Teklif reddedildiğinde tetiklenen event
/// </summary>
public sealed record SalesQuotationRejectedDomainEvent(
    Guid QuotationId,
    Guid TenantId,
    string QuotationNumber,
    Guid? CustomerId,
    string RejectionReason,
    DateTime RejectedAt) : DomainEvent;

/// <summary>
/// Teklif süresi dolduğunda tetiklenen event
/// </summary>
public sealed record SalesQuotationExpiredDomainEvent(
    Guid QuotationId,
    Guid TenantId,
    string QuotationNumber,
    DateTime ExpiredAt) : DomainEvent;

#endregion
