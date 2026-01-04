using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Cari Hesap DTO (Current Account DTO)
/// </summary>
public class CurrentAccountDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public CurrentAccountType AccountType { get; set; }
    public TaxLiabilityType TaxLiabilityType { get; set; }

    // Tax Information
    public string? TaxOffice { get; set; }
    public string? TaxNumber { get; set; }
    public string? IdentityNumber { get; set; }
    public string? TradeRegistryNumber { get; set; }
    public string? MersisNumber { get; set; }

    // E-Invoice Information
    public bool IsEInvoiceRegistered { get; set; }
    public string? EInvoiceAlias { get; set; }
    public string? KepAddress { get; set; }

    // Contact Information
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Fax { get; set; }
    public string? Website { get; set; }

    // Address Information
    public string? Address { get; set; }
    public string? District { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }

    // Financial Information
    public string Currency { get; set; } = "TRY";
    public decimal DebitBalance { get; set; }
    public decimal CreditBalance { get; set; }
    public decimal Balance { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal UsedCredit { get; set; }
    public decimal AvailableCredit { get; set; }
    public RiskStatus RiskStatus { get; set; }
    public string? RiskNotes { get; set; }

    // Payment Terms
    public PaymentTermType PaymentTermType { get; set; }
    public int PaymentDays { get; set; }
    public decimal DiscountRate { get; set; }
    public VatRate DefaultVatRate { get; set; }
    public bool ApplyWithholding { get; set; }
    public WithholdingCode? WithholdingCode { get; set; }

    // Status
    public CurrentAccountStatus Status { get; set; }
    public string? Category { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }

    // Linked Accounts
    public int? ReceivableAccountId { get; set; }
    public int? PayableAccountId { get; set; }
    public int? CrmCustomerId { get; set; }
    public int? PurchaseSupplierId { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public List<CurrentAccountTransactionDto> RecentTransactions { get; set; } = new();
}

/// <summary>
/// Cari Hesap Oluşturma DTO (Create Current Account DTO)
/// </summary>
public class CreateCurrentAccountDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public CurrentAccountType AccountType { get; set; }
    public TaxLiabilityType TaxLiabilityType { get; set; }
    public string Currency { get; set; } = "TRY";

    // Tax Information
    public string? TaxOffice { get; set; }
    public string? TaxNumber { get; set; }
    public string? IdentityNumber { get; set; }
    public string? TradeRegistryNumber { get; set; }
    public string? MersisNumber { get; set; }

    // E-Invoice Information
    public bool IsEInvoiceRegistered { get; set; }
    public string? EInvoiceAlias { get; set; }
    public string? KepAddress { get; set; }

    // Contact Information
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Fax { get; set; }
    public string? Website { get; set; }

    // Address Information
    public string? Address { get; set; }
    public string? District { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }

    // Financial Settings
    public decimal? CreditLimit { get; set; }
    public PaymentTermType PaymentTermType { get; set; } = PaymentTermType.Cash;
    public int PaymentDays { get; set; }
    public decimal DiscountRate { get; set; }
    public VatRate DefaultVatRate { get; set; } = VatRate.Twenty;
    public bool ApplyWithholding { get; set; }
    public WithholdingCode? WithholdingCode { get; set; }

    // Category
    public string? Category { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }

    // Linked Accounts
    public int? ReceivableAccountId { get; set; }
    public int? PayableAccountId { get; set; }
    public int? CrmCustomerId { get; set; }
    public int? PurchaseSupplierId { get; set; }
}

/// <summary>
/// Cari Hesap Güncelleme DTO (Update Current Account DTO)
/// </summary>
public class UpdateCurrentAccountDto
{
    public string? Name { get; set; }
    public string? ShortName { get; set; }

    // Tax Information
    public string? TaxOffice { get; set; }
    public string? TaxNumber { get; set; }
    public string? IdentityNumber { get; set; }
    public string? TradeRegistryNumber { get; set; }
    public string? MersisNumber { get; set; }

    // E-Invoice Information
    public bool? IsEInvoiceRegistered { get; set; }
    public string? EInvoiceAlias { get; set; }
    public string? KepAddress { get; set; }

    // Contact Information
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Fax { get; set; }
    public string? Website { get; set; }

    // Address Information
    public string? Address { get; set; }
    public string? District { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }

    // Financial Settings
    public decimal? CreditLimit { get; set; }
    public PaymentTermType? PaymentTermType { get; set; }
    public int? PaymentDays { get; set; }
    public decimal? DiscountRate { get; set; }
    public VatRate? DefaultVatRate { get; set; }
    public bool? ApplyWithholding { get; set; }
    public WithholdingCode? WithholdingCode { get; set; }

    // Status
    public CurrentAccountStatus? Status { get; set; }
    public RiskStatus? RiskStatus { get; set; }
    public string? RiskNotes { get; set; }

    // Category
    public string? Category { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }

    // Linked Accounts
    public int? ReceivableAccountId { get; set; }
    public int? PayableAccountId { get; set; }
    public int? CrmCustomerId { get; set; }
    public int? PurchaseSupplierId { get; set; }
}

/// <summary>
/// Cari Hesap Hareket DTO (Current Account Transaction DTO)
/// </summary>
public class CurrentAccountTransactionDto
{
    public int Id { get; set; }
    public int CurrentAccountId { get; set; }
    public string CurrentAccountName { get; set; } = string.Empty;
    public CurrentAccountTransactionType TransactionType { get; set; }
    public string TransactionTypeName { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? DocumentNumber { get; set; }
    public string? Description { get; set; }
    public decimal DebitAmount { get; set; }
    public decimal CreditAmount { get; set; }
    public decimal BalanceAfter { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? ExchangeRate { get; set; }
    public decimal? BaseCurrencyAmount { get; set; }
    public int? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Cari Hesap Özet DTO (Current Account Summary DTO)
/// </summary>
public class CurrentAccountSummaryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public CurrentAccountType AccountType { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal Balance { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal AvailableCredit { get; set; }
    public RiskStatus RiskStatus { get; set; }
    public CurrentAccountStatus Status { get; set; }
}

/// <summary>
/// Cari Hesap Ekstre DTO (Current Account Statement DTO)
/// </summary>
public class CurrentAccountStatementDto
{
    public int CurrentAccountId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
    public decimal ClosingBalance { get; set; }
    public string Currency { get; set; } = "TRY";
    public List<CurrentAccountTransactionDto> Transactions { get; set; } = new();
}
