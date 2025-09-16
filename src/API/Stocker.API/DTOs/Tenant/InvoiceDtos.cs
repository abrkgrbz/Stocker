namespace Stocker.API.DTOs.Tenant;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public string? Terms { get; set; }
    public DateTime? PaidDate { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentReference { get; set; }
    public List<InvoiceItemDto> Items { get; set; } = new();
}

public class InvoiceItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? TaxRate { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal TotalPrice { get; set; }
}

public class CreateInvoiceDto
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public string? Notes { get; set; }
    public string? Terms { get; set; }
    public List<CreateInvoiceItemDto> Items { get; set; } = new();
}

public class CreateInvoiceItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Currency { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? TaxRate { get; set; }
}

public class UpdateInvoiceDto
{
    public string? InvoiceNumber { get; set; }
    public DateTime? InvoiceDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Notes { get; set; }
    public string? Terms { get; set; }
}

public class MarkInvoiceAsPaidDto
{
    public DateTime PaymentDate { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentReference { get; set; }
}

public class CancelInvoiceDto
{
    public string Reason { get; set; } = string.Empty;
}

public class SendInvoiceByEmailDto
{
    public string EmailTo { get; set; } = string.Empty;
    public string? EmailCc { get; set; }
    public string? EmailBcc { get; set; }
    public string? Subject { get; set; }
    public string? Message { get; set; }
}

public class PaymentHistoryDto
{
    public Guid Id { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}

public class ConvertToRecurringDto
{
    public string Frequency { get; set; } = string.Empty; // Monthly, Weekly, Yearly
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? NumberOfOccurrences { get; set; }
}