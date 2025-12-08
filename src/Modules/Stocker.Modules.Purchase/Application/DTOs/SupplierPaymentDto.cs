using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record SupplierPaymentDto
{
    public Guid Id { get; init; }
    public string PaymentNumber { get; init; } = string.Empty;
    public DateTime PaymentDate { get; init; }
    public Guid SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Method { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; }
    public decimal AmountInBaseCurrency { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? IBAN { get; init; }
    public string? SwiftCode { get; init; }
    public string? CheckNumber { get; init; }
    public DateTime? CheckDate { get; init; }
    public string? TransactionReference { get; init; }
    public string? Description { get; init; }
    public Guid? PurchaseInvoiceId { get; init; }
    public string? PurchaseInvoiceNumber { get; init; }
    public string? LinkedInvoiceIds { get; init; }
    public bool RequiresApproval { get; init; }
    public Guid? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovalDate { get; init; }
    public Guid? ProcessedById { get; init; }
    public string? ProcessedByName { get; init; }
    public DateTime? ProcessedDate { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
    public bool IsReconciled { get; init; }
    public DateTime? ReconciliationDate { get; init; }
    public string? ReconciliationReference { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public record SupplierPaymentListDto
{
    public Guid Id { get; init; }
    public string PaymentNumber { get; init; } = string.Empty;
    public DateTime PaymentDate { get; init; }
    public string? SupplierName { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Method { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "TRY";
    public string? PurchaseInvoiceNumber { get; init; }
    public bool IsReconciled { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateSupplierPaymentDto
{
    public Guid SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public SupplierPaymentType Type { get; init; } = SupplierPaymentType.Standard;
    public PaymentMethod Method { get; init; } = PaymentMethod.BankTransfer;
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal ExchangeRate { get; init; } = 1;
    public DateTime? PaymentDate { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? IBAN { get; init; }
    public string? SwiftCode { get; init; }
    public string? CheckNumber { get; init; }
    public DateTime? CheckDate { get; init; }
    public string? Description { get; init; }
    public Guid? PurchaseInvoiceId { get; init; }
    public string? PurchaseInvoiceNumber { get; init; }
    public string? LinkedInvoiceIds { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
}

public record UpdateSupplierPaymentDto
{
    public DateTime? PaymentDate { get; init; }
    public decimal? Amount { get; init; }
    public decimal? ExchangeRate { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? IBAN { get; init; }
    public string? SwiftCode { get; init; }
    public string? CheckNumber { get; init; }
    public DateTime? CheckDate { get; init; }
    public string? Description { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
}

public record ApprovePaymentDto
{
    public string? ApprovalNotes { get; init; }
}

public record RejectPaymentDto
{
    public string Reason { get; init; } = string.Empty;
}

public record ProcessPaymentDto
{
    public string? TransactionReference { get; init; }
}

public record ReconcilePaymentDto
{
    public string? ReconciliationReference { get; init; }
}

public record SupplierPaymentSummaryDto
{
    public int TotalPayments { get; init; }
    public int DraftPayments { get; init; }
    public int PendingApprovalPayments { get; init; }
    public int ProcessedPayments { get; init; }
    public int CompletedPayments { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal PendingAmount { get; init; }
    public decimal CompletedAmount { get; init; }
    public int UnreconciledPayments { get; init; }
    public decimal UnreconciledAmount { get; init; }
    public Dictionary<string, int> PaymentsByStatus { get; init; } = new();
    public Dictionary<string, decimal> AmountByMethod { get; init; } = new();
    public Dictionary<string, decimal> AmountBySupplier { get; init; } = new();
}
