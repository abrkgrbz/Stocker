using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.Events;

#region Invoice Events

/// <summary>
/// Satış faturası oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SalesInvoiceCreatedDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    int CustomerId,
    string CustomerName,
    decimal TotalAmount,
    string Currency,
    DateTime InvoiceDate) : DomainEvent;

/// <summary>
/// Satış faturası onaylandığında tetiklenen event
/// </summary>
public sealed record SalesInvoiceApprovedDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Satış faturası GİB'e gönderildiğinde tetiklenen event
/// </summary>
public sealed record SalesInvoiceSentToGibDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    Guid GibUuid,
    DateTime SentAt) : DomainEvent;

/// <summary>
/// Satış faturası ödendiğinde tetiklenen event
/// </summary>
public sealed record SalesInvoicePaidDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    int PaymentId,
    decimal PaidAmount,
    DateTime PaidAt) : DomainEvent;

/// <summary>
/// Satış faturası iptal edildiğinde tetiklenen event
/// </summary>
public sealed record SalesInvoiceCancelledDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    string CancellationReason,
    DateTime CancelledAt) : DomainEvent;

/// <summary>
/// Satış faturası vadesi geçtiğinde tetiklenen event
/// </summary>
public sealed record SalesInvoiceOverdueDomainEvent(
    int InvoiceId,
    Guid TenantId,
    string InvoiceNumber,
    int CustomerId,
    decimal OutstandingAmount,
    int DaysOverdue,
    DateTime DueDate) : DomainEvent;

#endregion
