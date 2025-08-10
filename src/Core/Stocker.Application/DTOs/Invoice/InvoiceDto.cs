using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.DTOs.Invoice;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public Guid? SubscriptionId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public InvoiceStatus Status { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? PaymentMethod { get; set; }
    public int ItemCount { get; set; }
}

public class InvoiceDetailDto : InvoiceDto
{
    public string TenantEmail { get; set; } = string.Empty;
    public string? SubscriptionNumber { get; set; }
    public string? PackageName { get; set; }
    public decimal BalanceDue { get; set; }
    public string? Notes { get; set; }
    public List<InvoiceItemDto> Items { get; set; } = new();
    public List<PaymentDto> Payments { get; set; } = new();
}

public class InvoiceItemDto
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class PaymentDto
{
    public Guid Id { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public PaymentStatus Status { get; set; }
}