using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Invoice Events

/// <summary>
/// Satış faturası oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SalesInvoiceCreatedDomainEvent(
    Guid InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    Guid? CustomerId,
    string CustomerName,
    decimal TotalAmount,
    string Currency,
    DateTime InvoiceDate) : DomainEvent;

/// <summary>
/// Satış faturası onaylandığında tetiklenen event
/// </summary>
public sealed record SalesInvoiceApprovedDomainEvent(
    Guid InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    Guid? ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Satış faturası GİB'e gönderildiğinde tetiklenen event
/// </summary>
public sealed record SalesInvoiceSentToGibDomainEvent(
    Guid InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    Guid GibUuid,
    DateTime SentAt) : DomainEvent;

/// <summary>
/// Satış faturası ödendiğinde tetiklenen event
/// </summary>
public sealed record SalesInvoicePaidDomainEvent(
    Guid InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    Guid PaymentId,
    decimal PaidAmount,
    DateTime PaidAt) : DomainEvent;

/// <summary>
/// Satış faturası iptal edildiğinde tetiklenen event
/// </summary>
public sealed record SalesInvoiceCancelledDomainEvent(
    Guid InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

/// <summary>
/// Satış faturası vadesi geçtiğinde tetiklenen event
/// </summary>
public sealed record SalesInvoiceOverdueDomainEvent(
    Guid InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    Guid? CustomerId,
    decimal OutstandingAmount,
    int DaysOverdue,
    DateTime DueDate) : DomainEvent;

#endregion
