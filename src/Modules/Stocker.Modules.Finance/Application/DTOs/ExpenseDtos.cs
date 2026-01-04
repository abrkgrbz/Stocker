using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Gider DTO (Expense DTO)
/// </summary>
public class ExpenseDto
{
    public int Id { get; set; }
    public string ExpenseNumber { get; set; } = string.Empty;
    public DateTime ExpenseDate { get; set; }
    public ExpenseCategoryType Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Current Account (if applicable)
    public int? CurrentAccountId { get; set; }
    public string? CurrentAccountName { get; set; }

    // Amount Information
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal ExchangeRate { get; set; } = 1;
    public decimal AmountTRY { get; set; }

    // VAT Information
    public VatRate VatRate { get; set; }
    public decimal VatAmount { get; set; }
    public decimal GrossAmount { get; set; }
    public bool IsVatDeductible { get; set; }

    // Withholding Information
    public bool ApplyWithholding { get; set; }
    public VatWithholdingRate WithholdingRate { get; set; }
    public decimal WithholdingAmount { get; set; }

    // Cost Center
    public int? CostCenterId { get; set; }
    public string? CostCenterName { get; set; }

    // Document Information
    public string? DocumentNumber { get; set; }
    public DateTime? DocumentDate { get; set; }
    public string? ReceiptPath { get; set; }

    // Status
    public ExpenseStatus Status { get; set; }
    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public string? ApprovalNotes { get; set; }

    // Payment
    public PaymentType? PaymentMethod { get; set; }
    public DateTime? PaymentDate { get; set; }
    public int? PaymentId { get; set; }
    public bool IsPaid { get; set; }

    // Project/Reference
    public int? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public int? InvoiceId { get; set; }

    // Accounting
    public int? AccountId { get; set; }
    public string? AccountCode { get; set; }
    public int? JournalEntryId { get; set; }

    // Notes
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }

    // Audit
    public int? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Gider Oluşturma DTO (Create Expense DTO)
/// </summary>
public class CreateExpenseDto
{
    public DateTime ExpenseDate { get; set; }
    public ExpenseCategoryType Category { get; set; }
    public string Description { get; set; } = string.Empty;

    // Current Account
    public int? CurrentAccountId { get; set; }

    // Amount
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? ExchangeRate { get; set; }

    // VAT
    public VatRate VatRate { get; set; } = VatRate.Twenty;
    public bool IsVatDeductible { get; set; } = true;

    // Withholding
    public bool ApplyWithholding { get; set; }
    public VatWithholdingRate WithholdingRate { get; set; }

    // Cost Center
    public int? CostCenterId { get; set; }

    // Document
    public string? DocumentNumber { get; set; }
    public DateTime? DocumentDate { get; set; }
    public string? ReceiptPath { get; set; }

    // Payment
    public PaymentType? PaymentMethod { get; set; }
    public DateTime? PaymentDate { get; set; }

    // Project/Reference
    public int? ProjectId { get; set; }

    // Accounting
    public int? AccountId { get; set; }

    // Notes
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }
}

/// <summary>
/// Gider Güncelleme DTO (Update Expense DTO)
/// </summary>
public class UpdateExpenseDto
{
    public DateTime? ExpenseDate { get; set; }
    public ExpenseCategoryType? Category { get; set; }
    public string? Description { get; set; }

    // Current Account
    public int? CurrentAccountId { get; set; }

    // Amount (only for draft expenses)
    public decimal? Amount { get; set; }
    public decimal? ExchangeRate { get; set; }

    // VAT
    public VatRate? VatRate { get; set; }
    public bool? IsVatDeductible { get; set; }

    // Withholding
    public bool? ApplyWithholding { get; set; }
    public VatWithholdingRate? WithholdingRate { get; set; }

    // Cost Center
    public int? CostCenterId { get; set; }

    // Document
    public string? DocumentNumber { get; set; }
    public DateTime? DocumentDate { get; set; }
    public string? ReceiptPath { get; set; }

    // Project/Reference
    public int? ProjectId { get; set; }

    // Accounting
    public int? AccountId { get; set; }

    // Notes
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }
}

/// <summary>
/// Gider Özet DTO (Expense Summary DTO)
/// </summary>
public class ExpenseSummaryDto
{
    public int Id { get; set; }
    public string ExpenseNumber { get; set; } = string.Empty;
    public DateTime ExpenseDate { get; set; }
    public ExpenseCategoryType Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal GrossAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public ExpenseStatus Status { get; set; }
    public bool IsPaid { get; set; }
    public string? CurrentAccountName { get; set; }
}

/// <summary>
/// Gider Filtre DTO (Expense Filter DTO)
/// </summary>
public class ExpenseFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public ExpenseCategoryType? Category { get; set; }
    public ExpenseStatus? Status { get; set; }
    public int? CurrentAccountId { get; set; }
    public int? CostCenterId { get; set; }
    public int? ProjectId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? IsPaid { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Gider Onaylama DTO (Approve Expense DTO)
/// </summary>
public class ApproveExpenseDto
{
    public string? ApprovalNotes { get; set; }
}

/// <summary>
/// Gider Reddetme DTO (Reject Expense DTO)
/// </summary>
public class RejectExpenseDto
{
    public string RejectionReason { get; set; } = string.Empty;
}
