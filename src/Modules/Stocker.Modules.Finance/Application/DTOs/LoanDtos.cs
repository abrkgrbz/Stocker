using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Kredi DTO (Loan DTO) - Full details
/// </summary>
public class LoanDto
{
    public int Id { get; set; }
    public string LoanNumber { get; set; } = string.Empty;
    public string? ExternalReference { get; set; }

    // Type
    public LoanType LoanType { get; set; }
    public string LoanTypeName { get; set; } = string.Empty;
    public LoanSubType SubType { get; set; }
    public string SubTypeName { get; set; } = string.Empty;

    // Lender
    public int? LenderId { get; set; }
    public string LenderName { get; set; } = string.Empty;
    public int? BankAccountId { get; set; }

    // Principal & Interest
    public decimal PrincipalAmount { get; set; }
    public decimal RemainingPrincipal { get; set; }
    public decimal TotalInterest { get; set; }
    public decimal PaidInterest { get; set; }
    public string Currency { get; set; } = "TRY";

    // Fees
    public decimal BsmvAmount { get; set; }
    public decimal KkdfAmount { get; set; }
    public decimal ProcessingFee { get; set; }
    public decimal OtherFees { get; set; }

    // Interest Rate
    public decimal AnnualInterestRate { get; set; }
    public InterestType InterestType { get; set; }
    public string InterestTypeName { get; set; } = string.Empty;
    public ReferenceRateType? ReferenceRateType { get; set; }
    public string? ReferenceRateTypeName { get; set; }
    public decimal? Spread { get; set; }

    // Dates
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime FirstPaymentDate { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public DateTime? DisbursementDate { get; set; }
    public DateTime? ClosureDate { get; set; }

    // Term & Payment
    public int TermMonths { get; set; }
    public PaymentFrequency PaymentFrequency { get; set; }
    public string PaymentFrequencyName { get; set; } = string.Empty;
    public int TotalInstallments { get; set; }
    public int PaidInstallments { get; set; }
    public RepaymentMethod RepaymentMethod { get; set; }
    public string RepaymentMethodName { get; set; } = string.Empty;

    // Collateral
    public CollateralType? CollateralType { get; set; }
    public string? CollateralTypeName { get; set; }
    public string? CollateralDescription { get; set; }
    public decimal? CollateralValue { get; set; }
    public string? GuarantorInfo { get; set; }

    // Purpose & Status
    public string? Purpose { get; set; }
    public LoanStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;

    // Prepayment
    public bool AllowsPrepayment { get; set; }
    public decimal? PrepaymentPenaltyRate { get; set; }
    public int? GracePeriodMonths { get; set; }

    // Accounting
    public int? LoanPayableAccountId { get; set; }
    public int? InterestExpenseAccountId { get; set; }

    // Notes
    public string? Notes { get; set; }

    // Related Data
    public List<LoanScheduleDto> Schedule { get; set; } = new();
    public List<LoanPaymentDto> Payments { get; set; } = new();

    // Calculated
    public decimal TotalPaid => PrincipalAmount - RemainingPrincipal + PaidInterest;
    public decimal TotalRemaining => RemainingPrincipal + (TotalInterest - PaidInterest);
    public int RemainingInstallments => TotalInstallments - PaidInstallments;
    public decimal ProgressPercentage => PrincipalAmount > 0
        ? Math.Round((PrincipalAmount - RemainingPrincipal) / PrincipalAmount * 100, 2)
        : 0;

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Kredi Özet DTO (Loan Summary DTO) - For lists
/// </summary>
public class LoanSummaryDto
{
    public int Id { get; set; }
    public string LoanNumber { get; set; } = string.Empty;
    public string? ExternalReference { get; set; }
    public LoanType LoanType { get; set; }
    public string LoanTypeName { get; set; } = string.Empty;
    public string LenderName { get; set; } = string.Empty;
    public decimal PrincipalAmount { get; set; }
    public decimal RemainingPrincipal { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal AnnualInterestRate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalInstallments { get; set; }
    public int PaidInstallments { get; set; }
    public LoanStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public decimal ProgressPercentage { get; set; }
    public DateTime? NextPaymentDate { get; set; }
    public decimal? NextPaymentAmount { get; set; }
}

/// <summary>
/// Kredi Oluşturma DTO (Create Loan DTO)
/// </summary>
public class CreateLoanDto
{
    public string? ExternalReference { get; set; }

    // Type
    public LoanType LoanType { get; set; }
    public LoanSubType SubType { get; set; }

    // Lender
    public int? LenderId { get; set; }
    public string LenderName { get; set; } = string.Empty;
    public int? BankAccountId { get; set; }

    // Principal
    public decimal PrincipalAmount { get; set; }
    public string Currency { get; set; } = "TRY";

    // Fees
    public decimal? BsmvAmount { get; set; }
    public decimal? KkdfAmount { get; set; }
    public decimal? ProcessingFee { get; set; }
    public decimal? OtherFees { get; set; }

    // Interest Rate
    public decimal AnnualInterestRate { get; set; }
    public InterestType InterestType { get; set; }
    public ReferenceRateType? ReferenceRateType { get; set; }
    public decimal? Spread { get; set; }

    // Dates
    public DateTime StartDate { get; set; }
    public DateTime? FirstPaymentDate { get; set; }

    // Term & Payment
    public int TermMonths { get; set; }
    public PaymentFrequency PaymentFrequency { get; set; }
    public RepaymentMethod RepaymentMethod { get; set; }

    // Collateral
    public CollateralType? CollateralType { get; set; }
    public string? CollateralDescription { get; set; }
    public decimal? CollateralValue { get; set; }
    public string? GuarantorInfo { get; set; }

    // Purpose
    public string? Purpose { get; set; }

    // Prepayment
    public bool AllowsPrepayment { get; set; } = true;
    public decimal? PrepaymentPenaltyRate { get; set; }
    public int? GracePeriodMonths { get; set; }

    // Accounting
    public int? LoanPayableAccountId { get; set; }
    public int? InterestExpenseAccountId { get; set; }

    // Notes
    public string? Notes { get; set; }
}

/// <summary>
/// Kredi Güncelleme DTO (Update Loan DTO)
/// </summary>
public class UpdateLoanDto
{
    public string? ExternalReference { get; set; }
    public int? LenderId { get; set; }
    public string? LenderName { get; set; }
    public int? BankAccountId { get; set; }

    // Fees
    public decimal? BsmvAmount { get; set; }
    public decimal? KkdfAmount { get; set; }
    public decimal? ProcessingFee { get; set; }
    public decimal? OtherFees { get; set; }

    // Variable Rate
    public ReferenceRateType? ReferenceRateType { get; set; }
    public decimal? Spread { get; set; }

    // Collateral
    public CollateralType? CollateralType { get; set; }
    public string? CollateralDescription { get; set; }
    public decimal? CollateralValue { get; set; }
    public string? GuarantorInfo { get; set; }

    // Purpose
    public string? Purpose { get; set; }

    // Prepayment
    public bool? AllowsPrepayment { get; set; }
    public decimal? PrepaymentPenaltyRate { get; set; }
    public int? GracePeriodMonths { get; set; }

    // Accounting
    public int? LoanPayableAccountId { get; set; }
    public int? InterestExpenseAccountId { get; set; }

    // Notes
    public string? Notes { get; set; }
}

/// <summary>
/// Kredi Filtre DTO (Loan Filter DTO)
/// </summary>
public class LoanFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public LoanType? LoanType { get; set; }
    public LoanSubType? SubType { get; set; }
    public LoanStatus? Status { get; set; }
    public InterestType? InterestType { get; set; }
    public int? LenderId { get; set; }
    public DateTime? StartDateFrom { get; set; }
    public DateTime? StartDateTo { get; set; }
    public DateTime? EndDateFrom { get; set; }
    public DateTime? EndDateTo { get; set; }
    public decimal? MinPrincipalAmount { get; set; }
    public decimal? MaxPrincipalAmount { get; set; }
    public string? Currency { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Kredi Ödeme DTO (Loan Payment DTO)
/// </summary>
public class LoanPaymentDto
{
    public int Id { get; set; }
    public int LoanId { get; set; }
    public DateTime PaymentDate { get; set; }
    public LoanPaymentType PaymentType { get; set; }
    public string PaymentTypeName { get; set; } = string.Empty;
    public decimal PrincipalPaid { get; set; }
    public decimal InterestPaid { get; set; }
    public decimal PenaltyPaid { get; set; }
    public decimal TotalPaid { get; set; }
    public string Currency { get; set; } = "TRY";
    public string? Reference { get; set; }
    public int? BankTransactionId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Kredi Ödeme Planı DTO (Loan Schedule DTO)
/// </summary>
public class LoanScheduleDto
{
    public int Id { get; set; }
    public int LoanId { get; set; }
    public int InstallmentNumber { get; set; }
    public DateTime DueDate { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal InterestAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal RemainingBalance { get; set; }
    public string Currency { get; set; } = "TRY";
    public bool IsPaid { get; set; }
    public DateTime? PaymentDate { get; set; }
    public int? PaymentId { get; set; }
    public bool IsOverdue => !IsPaid && DueDate < DateTime.UtcNow;
    public int DaysUntilDue => (int)(DueDate - DateTime.UtcNow).TotalDays;
}

/// <summary>
/// Kredi Ödeme Kaydetme DTO (Make Loan Payment DTO)
/// </summary>
public class MakeLoanPaymentDto
{
    public DateTime PaymentDate { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal InterestAmount { get; set; }
    public string? Reference { get; set; }
    public int? BankTransactionId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Erken Ödeme DTO (Prepayment DTO)
/// </summary>
public class MakePrepaymentDto
{
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public bool CloseIfPaidOff { get; set; } = true;
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Kredi Onaylama DTO (Approve Loan DTO)
/// </summary>
public class ApproveLoanDto
{
    public DateTime ApprovalDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Kredi Kullandırma DTO (Disburse Loan DTO)
/// </summary>
public class DisburseLoanDto
{
    public DateTime DisbursementDate { get; set; }
    public int? BankTransactionId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Kredi Yeniden Yapılandırma DTO (Restructure Loan DTO)
/// </summary>
public class RestructureLoanDto
{
    public decimal NewInterestRate { get; set; }
    public int NewTermMonths { get; set; }
    public DateTime NewStartDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Kredi Kapama DTO (Close Loan DTO)
/// </summary>
public class CloseLoanDto
{
    public DateTime ClosureDate { get; set; }
    public string? Notes { get; set; }
}
