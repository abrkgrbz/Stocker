using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Quotation Events

/// <summary>
/// Teklif oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SalesQuotationCreatedDomainEvent(
    int QuotationId,
    Guid TenantId,
    string QuotationNumber,
    int CustomerId,
    string CustomerName,
    decimal TotalAmount,
    string Currency,
    DateTime ValidUntil) : DomainEvent;

/// <summary>
/// Teklif gönderildiğinde tetiklenen event
/// </summary>
public sealed record SalesQuotationSentDomainEvent(
    int QuotationId,
    Guid TenantId,
    string QuotationNumber,
    string CustomerEmail,
    DateTime SentAt) : DomainEvent;

/// <summary>
/// Teklif kabul edildiğinde tetiklenen event
/// </summary>
public sealed record SalesQuotationAcceptedDomainEvent(
    int QuotationId,
    Guid TenantId,
    string QuotationNumber,
    int CustomerId,
    int SalesOrderId,
    DateTime AcceptedAt) : DomainEvent;

/// <summary>
/// Teklif reddedildiğinde tetiklenen event
/// </summary>
public sealed record SalesQuotationRejectedDomainEvent(
    int QuotationId,
    Guid TenantId,
    string QuotationNumber,
    int CustomerId,
    string RejectionReason,
    DateTime RejectedAt) : DomainEvent;

/// <summary>
/// Teklif süresi dolduğunda tetiklenen event
/// </summary>
public sealed record SalesQuotationExpiredDomainEvent(
    int QuotationId,
    Guid TenantId,
    string QuotationNumber,
    DateTime ExpiredAt) : DomainEvent;

#endregion
