using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Ödeme/Tahsilat DTO (Payment/Collection DTO)
/// </summary>
public class PaymentDto
{
    public int Id { get; set; }
    public string PaymentNumber { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public PaymentType PaymentType { get; set; }
    public string PaymentTypeName { get; set; } = string.Empty;
    public MovementDirection Direction { get; set; }
    public string DirectionName { get; set; } = string.Empty;

    // Current Account
    public int CurrentAccountId { get; set; }
    public string CurrentAccountCode { get; set; } = string.Empty;
    public string CurrentAccountName { get; set; } = string.Empty;

    // Amount
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal ExchangeRate { get; set; } = 1;
    public decimal AmountTRY { get; set; }

    // Bank/Cash Account
    public int? BankAccountId { get; set; }
    public string? BankAccountName { get; set; }
    public int? CashAccountId { get; set; }
    public string? CashAccountName { get; set; }

    // Check/Note Information (if applicable)
    public string? CheckNumber { get; set; }
    public string? BankName { get; set; }
    public string? BranchName { get; set; }
    public DateTime? CheckDueDate { get; set; }
    public string? Endorser { get; set; }

    // Status
    public PaymentStatus Status { get; set; }

    // Document
    public string? DocumentNumber { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }

    // Reference
    public int? InvoiceId { get; set; }
    public string? InvoiceNumber { get; set; }

    // Allocations
    public List<PaymentAllocationDto> Allocations { get; set; } = new();
    public decimal AllocatedAmount { get; set; }
    public decimal UnallocatedAmount { get; set; }

    // Accounting
    public int? JournalEntryId { get; set; }

    // Audit
    public int? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Ödeme Dağılımı DTO (Payment Allocation DTO)
/// </summary>
public class PaymentAllocationDto
{
    public int Id { get; set; }
    public int PaymentId { get; set; }
    public int? InvoiceId { get; set; }
    public string? InvoiceNumber { get; set; }
    public decimal AllocatedAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public DateTime AllocationDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Ödeme Oluşturma DTO (Create Payment DTO)
/// </summary>
public class CreatePaymentDto
{
    public DateTime PaymentDate { get; set; }
    public PaymentType PaymentType { get; set; }
    public MovementDirection Direction { get; set; }

    // Current Account
    public int CurrentAccountId { get; set; }

    // Amount
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? ExchangeRate { get; set; }

    // Bank/Cash Account
    public int? BankAccountId { get; set; }
    public int? CashAccountId { get; set; }

    // Check/Note Information (if applicable)
    public string? CheckNumber { get; set; }
    public string? BankName { get; set; }
    public string? BranchName { get; set; }
    public DateTime? CheckDueDate { get; set; }
    public string? Endorser { get; set; }

    // Document
    public string? DocumentNumber { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }

    // Auto-allocate to invoices
    public List<CreatePaymentAllocationDto>? Allocations { get; set; }
}

/// <summary>
/// Ödeme Dağılımı Oluşturma DTO (Create Payment Allocation DTO)
/// </summary>
public class CreatePaymentAllocationDto
{
    public int InvoiceId { get; set; }
    public decimal AllocatedAmount { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Ödeme Özet DTO (Payment Summary DTO)
/// </summary>
public class PaymentSummaryDto
{
    public int Id { get; set; }
    public string PaymentNumber { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public PaymentType PaymentType { get; set; }
    public MovementDirection Direction { get; set; }
    public string CurrentAccountName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public PaymentStatus Status { get; set; }
    public decimal AllocatedAmount { get; set; }
    public decimal UnallocatedAmount { get; set; }
}

/// <summary>
/// Ödeme Filtre DTO (Payment Filter DTO)
/// </summary>
public class PaymentFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public PaymentType? PaymentType { get; set; }
    public MovementDirection? Direction { get; set; }
    public PaymentStatus? Status { get; set; }
    public int? CurrentAccountId { get; set; }
    public int? BankAccountId { get; set; }
    public int? CashAccountId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? HasUnallocated { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Ödeme Güncelleme DTO (Update Payment DTO)
/// </summary>
public class UpdatePaymentDto
{
    public DateTime? PaymentDate { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public string? DocumentNumber { get; set; }

    // Check/Note Information
    public string? CheckNumber { get; set; }
    public DateTime? CheckDueDate { get; set; }
}

/// <summary>
/// Toplu Tahsilat/Ödeme DTO (Bulk Collection/Payment DTO)
/// </summary>
public class BulkPaymentDto
{
    public DateTime PaymentDate { get; set; }
    public PaymentType PaymentType { get; set; }
    public MovementDirection Direction { get; set; }
    public int? BankAccountId { get; set; }
    public int? CashAccountId { get; set; }
    public string? Description { get; set; }

    public List<BulkPaymentItemDto> Items { get; set; } = new();
}

/// <summary>
/// Toplu Tahsilat/Ödeme Kalemi DTO (Bulk Payment Item DTO)
/// </summary>
public class BulkPaymentItemDto
{
    public int CurrentAccountId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public int? InvoiceId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Ödeme Onaylama DTO (Approve Payment DTO)
/// </summary>
public class ApprovePaymentDto
{
    public string? Note { get; set; }
}

/// <summary>
/// Ödeme İptal DTO (Cancel Payment DTO)
/// </summary>
public class CancelPaymentDto
{
    public string? Reason { get; set; }
}

/// <summary>
/// Ödeme Dağıtım DTO (Allocate Payment DTO)
/// </summary>
public class AllocatePaymentDto
{
    public List<CreatePaymentAllocationDto> Allocations { get; set; } = new();
}
