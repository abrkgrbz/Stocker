namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Kasa Hesabı DTO (Cash Account DTO)
/// </summary>
public class CashAccountDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Currency { get; set; } = "TRY";
    public CashAccountTypeDto AccountType { get; set; }
    public string AccountTypeName { get; set; } = string.Empty;

    // Balance Information
    public decimal Balance { get; set; }
    public decimal? MinimumBalance { get; set; }
    public decimal? MaximumBalance { get; set; }
    public decimal OpeningBalance { get; set; }
    public DateTime? LastCountDate { get; set; }
    public decimal? LastCountBalance { get; set; }
    public decimal? CountDifference { get; set; }

    // Location Information
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }

    // Responsible Information
    public int? ResponsibleUserId { get; set; }
    public string? ResponsibleUserName { get; set; }

    // Status and Accounting
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public int? AccountingAccountId { get; set; }
    public string? Notes { get; set; }

    // Limits
    public decimal? DailyTransactionLimit { get; set; }
    public decimal? SingleTransactionLimit { get; set; }

    // Balance Alerts
    public bool IsBelowMinimumBalance { get; set; }
    public bool IsAboveMaximumBalance { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Kasa Hesabı Özet DTO (Cash Account Summary DTO)
/// </summary>
public class CashAccountSummaryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Currency { get; set; } = "TRY";
    public CashAccountTypeDto AccountType { get; set; }
    public string AccountTypeName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public string? BranchName { get; set; }
    public string? ResponsibleUserName { get; set; }
    public bool IsBelowMinimumBalance { get; set; }
    public bool IsAboveMaximumBalance { get; set; }
}

/// <summary>
/// Kasa Hesabı Oluşturma DTO (Create Cash Account DTO)
/// </summary>
public class CreateCashAccountDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Currency { get; set; } = "TRY";
    public CashAccountTypeDto AccountType { get; set; }

    // Opening Balance
    public decimal OpeningBalance { get; set; }

    // Location Information
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }

    // Responsible Information
    public int? ResponsibleUserId { get; set; }
    public string? ResponsibleUserName { get; set; }

    // Balance Alerts
    public decimal? MinimumBalance { get; set; }
    public decimal? MaximumBalance { get; set; }

    // Limits
    public decimal? DailyTransactionLimit { get; set; }
    public decimal? SingleTransactionLimit { get; set; }

    // Accounting
    public int? AccountingAccountId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Kasa Hesabı Güncelleme DTO (Update Cash Account DTO)
/// </summary>
public class UpdateCashAccountDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }

    // Location Information
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }

    // Responsible Information
    public int? ResponsibleUserId { get; set; }
    public string? ResponsibleUserName { get; set; }

    // Balance Alerts
    public decimal? MinimumBalance { get; set; }
    public decimal? MaximumBalance { get; set; }

    // Limits
    public decimal? DailyTransactionLimit { get; set; }
    public decimal? SingleTransactionLimit { get; set; }

    // Accounting
    public int? AccountingAccountId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Kasa Hesabı Filtre DTO (Cash Account Filter DTO)
/// </summary>
public class CashAccountFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public CashAccountTypeDto? AccountType { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsDefault { get; set; }
    public int? BranchId { get; set; }
    public int? WarehouseId { get; set; }
    public int? ResponsibleUserId { get; set; }
    public string? Currency { get; set; }
    public bool? HasBalanceAlert { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = false;
}

/// <summary>
/// Kasa Sayımı DTO (Cash Count DTO)
/// </summary>
public class RecordCashCountDto
{
    public decimal CountedBalance { get; set; }
    public DateTime CountDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Kasa Türü DTO (Cash Account Type DTO)
/// </summary>
public enum CashAccountTypeDto
{
    /// <summary>
    /// TL Kasası (TRY Cash)
    /// </summary>
    TRY = 1,

    /// <summary>
    /// Döviz Kasası (Foreign Currency Cash)
    /// </summary>
    ForeignCurrency = 2,

    /// <summary>
    /// POS Kasası (POS Cash)
    /// </summary>
    POS = 3,

    /// <summary>
    /// Yazar Kasa (Cash Register)
    /// </summary>
    CashRegister = 4,

    /// <summary>
    /// Şube Kasası (Branch Cash)
    /// </summary>
    Branch = 5,

    /// <summary>
    /// Merkez Kasa (Headquarters Cash)
    /// </summary>
    Headquarters = 6
}

/// <summary>
/// Kasa Bakiye Özet DTO (Cash Account Balance Summary DTO)
/// </summary>
public class CashAccountBalanceSummaryDto
{
    /// <summary>
    /// Toplam Bakiye (Total Balance)
    /// </summary>
    public decimal TotalBalance { get; set; }

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; set; } = "TRY";

    /// <summary>
    /// Aktif Kasa Sayısı (Active Account Count)
    /// </summary>
    public int ActiveAccountCount { get; set; }

    /// <summary>
    /// Toplam Kasa Sayısı (Total Account Count)
    /// </summary>
    public int TotalAccountCount { get; set; }

    /// <summary>
    /// Minimum Bakiye Altında Olan Kasalar (Accounts Below Minimum Balance)
    /// </summary>
    public int AccountsBelowMinimumCount { get; set; }

    /// <summary>
    /// Maksimum Bakiye Üstünde Olan Kasalar (Accounts Above Maximum Balance)
    /// </summary>
    public int AccountsAboveMaximumCount { get; set; }

    /// <summary>
    /// Para Birimine Göre Bakiyeler (Balances by Currency)
    /// </summary>
    public List<CashCurrencyBalanceDto> BalancesByCurrency { get; set; } = new();
}

/// <summary>
/// Kasa Para Birimi Bakiye DTO (Cash Currency Balance DTO)
/// </summary>
public class CashCurrencyBalanceDto
{
    public string Currency { get; set; } = string.Empty;
    public decimal TotalBalance { get; set; }
    public int AccountCount { get; set; }
}

/// <summary>
/// Kasaya Para Ekleme DTO (Add Cash DTO)
/// </summary>
public class AddCashDto
{
    /// <summary>
    /// Eklenecek Tutar (Amount to Add)
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// İşlem Tarihi (Transaction Date)
    /// </summary>
    public DateTime TransactionDate { get; set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Referans Numarası (Reference Number)
    /// </summary>
    public string? ReferenceNumber { get; set; }
}

/// <summary>
/// Kasadan Para Çekme DTO (Withdraw Cash DTO)
/// </summary>
public class WithdrawCashDto
{
    /// <summary>
    /// Çekilecek Tutar (Amount to Withdraw)
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// İşlem Tarihi (Transaction Date)
    /// </summary>
    public DateTime TransactionDate { get; set; }

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Referans Numarası (Reference Number)
    /// </summary>
    public string? ReferenceNumber { get; set; }
}
