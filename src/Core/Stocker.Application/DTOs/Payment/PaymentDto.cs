using Stocker.Domain.Master.Enums;

namespace Stocker.Application.DTOs.Payment;

public class PaymentDto
{
    public Guid Id { get; set; }
    public string PaymentNumber { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public Guid? InvoiceId { get; set; }
    public string? InvoiceNumber { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? TransactionId { get; set; }
}

public class PaymentDetailDto : PaymentDto
{
    public string? Description { get; set; }
    public string? ProcessorResponse { get; set; }
    public string? FailureReason { get; set; }
    public decimal? RefundedAmount { get; set; }
    public DateTime? RefundedDate { get; set; }
    public string? RefundReason { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}