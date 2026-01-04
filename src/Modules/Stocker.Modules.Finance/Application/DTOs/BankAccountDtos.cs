using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Banka Hesabi DTO (Bank Account DTO)
/// </summary>
public class BankAccountDto
{
    public int Id { get; set; }

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Hesap Kodu (Account Code)
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Hesap Adi (Account Name)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Banka Adi (Bank Name)
    /// </summary>
    public string BankName { get; set; } = string.Empty;

    /// <summary>
    /// Sube Adi (Branch Name)
    /// </summary>
    public string? BranchName { get; set; }

    /// <summary>
    /// Sube Kodu (Branch Code)
    /// </summary>
    public string? BranchCode { get; set; }

    /// <summary>
    /// Hesap Numarasi (Account Number)
    /// </summary>
    public string AccountNumber { get; set; } = string.Empty;

    /// <summary>
    /// IBAN
    /// </summary>
    public string Iban { get; set; } = string.Empty;

    /// <summary>
    /// Swift/BIC Kodu (Swift/BIC Code)
    /// </summary>
    public string? SwiftCode { get; set; }

    #endregion

    #region Para Birimi ve Bakiye (Currency and Balance)

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; set; } = "TRY";

    /// <summary>
    /// Guncel Bakiye (Current Balance)
    /// </summary>
    public decimal Balance { get; set; }

    /// <summary>
    /// Bloke Bakiye (Blocked Balance)
    /// </summary>
    public decimal BlockedBalance { get; set; }

    /// <summary>
    /// Kullanilabilir Bakiye (Available Balance)
    /// </summary>
    public decimal AvailableBalance { get; set; }

    /// <summary>
    /// Son Mutabakat Tarihi (Last Reconciliation Date)
    /// </summary>
    public DateTime? LastReconciliationDate { get; set; }

    /// <summary>
    /// Mutabakat Bakiyesi (Reconciled Balance)
    /// </summary>
    public decimal? ReconciledBalance { get; set; }

    #endregion

    #region Hesap Turu (Account Type)

    /// <summary>
    /// Hesap Turu (Account Type)
    /// </summary>
    public BankAccountType AccountType { get; set; }

    /// <summary>
    /// Hesap Turu Adi (Account Type Name)
    /// </summary>
    public string AccountTypeName { get; set; } = string.Empty;

    /// <summary>
    /// Vadesiz mi? (Is Demand Account)
    /// </summary>
    public bool IsDemandAccount { get; set; }

    /// <summary>
    /// Mevduat Vadesi (Deposit Maturity Date)
    /// </summary>
    public DateTime? DepositMaturityDate { get; set; }

    /// <summary>
    /// Faiz Orani % (Interest Rate)
    /// </summary>
    public decimal? InterestRate { get; set; }

    #endregion

    #region POS Bilgileri (POS Information)

    /// <summary>
    /// POS Hesabi mi? (Is POS Account)
    /// </summary>
    public bool IsPosAccount { get; set; }

    /// <summary>
    /// POS Komisyon Orani % (POS Commission Rate)
    /// </summary>
    public decimal? PosCommissionRate { get; set; }

    /// <summary>
    /// POS Terminal ID
    /// </summary>
    public string? PosTerminalId { get; set; }

    /// <summary>
    /// POS Merchant ID
    /// </summary>
    public string? PosMerchantId { get; set; }

    #endregion

    #region Entegrasyon Bilgileri (Integration Information)

    /// <summary>
    /// Banka Entegrasyonu Var mi? (Has Bank Integration)
    /// </summary>
    public bool HasBankIntegration { get; set; }

    /// <summary>
    /// Entegrasyon Turu (Integration Type)
    /// </summary>
    public string? IntegrationType { get; set; }

    /// <summary>
    /// Son Entegrasyon Tarihi (Last Integration Date)
    /// </summary>
    public DateTime? LastIntegrationDate { get; set; }

    /// <summary>
    /// Otomatik Eslestirme Aktif mi? (Is Auto Matching Enabled)
    /// </summary>
    public bool IsAutoMatchingEnabled { get; set; }

    #endregion

    #region Limit Bilgileri (Limit Information)

    /// <summary>
    /// Gunluk Transfer Limiti (Daily Transfer Limit)
    /// </summary>
    public decimal? DailyTransferLimit { get; set; }

    /// <summary>
    /// Tek Seferde Transfer Limiti (Single Transfer Limit)
    /// </summary>
    public decimal? SingleTransferLimit { get; set; }

    /// <summary>
    /// Kredi Limiti (Credit Limit / Overdraft)
    /// </summary>
    public decimal? CreditLimit { get; set; }

    #endregion

    #region Durum ve Muhasebe Bilgileri (Status and Accounting)

    /// <summary>
    /// Aktif mi? (Is Active)
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Varsayilan Hesap mi? (Is Default Account)
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// Muhasebe Hesabi ID (Linked Accounting Account ID)
    /// </summary>
    public int? AccountingAccountId { get; set; }

    /// <summary>
    /// Acilis Tarihi (Opening Date)
    /// </summary>
    public DateTime? OpeningDate { get; set; }

    /// <summary>
    /// Kapanis Tarihi (Closing Date)
    /// </summary>
    public DateTime? ClosingDate { get; set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }

    #endregion

    #region Audit

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    #endregion
}

/// <summary>
/// Banka Hesabi Ozet DTO (Bank Account Summary DTO)
/// </summary>
public class BankAccountSummaryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string? BranchName { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string Iban { get; set; } = string.Empty;
    public string Currency { get; set; } = "TRY";
    public decimal Balance { get; set; }
    public decimal AvailableBalance { get; set; }
    public BankAccountType AccountType { get; set; }
    public string AccountTypeName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public bool IsPosAccount { get; set; }
}

/// <summary>
/// Banka Hesabi Olusturma DTO (Create Bank Account DTO)
/// </summary>
public class CreateBankAccountDto
{
    #region Zorunlu Alanlar (Required Fields)

    /// <summary>
    /// Hesap Kodu (Account Code)
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Hesap Adi (Account Name)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Banka Adi (Bank Name)
    /// </summary>
    public string BankName { get; set; } = string.Empty;

    /// <summary>
    /// Hesap Numarasi (Account Number)
    /// </summary>
    public string AccountNumber { get; set; } = string.Empty;

    /// <summary>
    /// IBAN
    /// </summary>
    public string Iban { get; set; } = string.Empty;

    /// <summary>
    /// Hesap Turu (Account Type)
    /// </summary>
    public BankAccountType AccountType { get; set; }

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; set; } = "TRY";

    #endregion

    #region Opsiyonel Alanlar (Optional Fields)

    /// <summary>
    /// Sube Adi (Branch Name)
    /// </summary>
    public string? BranchName { get; set; }

    /// <summary>
    /// Sube Kodu (Branch Code)
    /// </summary>
    public string? BranchCode { get; set; }

    /// <summary>
    /// Swift/BIC Kodu (Swift/BIC Code)
    /// </summary>
    public string? SwiftCode { get; set; }

    /// <summary>
    /// Acilis Tarihi (Opening Date)
    /// </summary>
    public DateTime? OpeningDate { get; set; }

    /// <summary>
    /// Muhasebe Hesabi ID (Linked Accounting Account ID)
    /// </summary>
    public int? AccountingAccountId { get; set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }

    #endregion

    #region Vadeli Mevduat Bilgileri (Time Deposit Information)

    /// <summary>
    /// Mevduat Vadesi (Deposit Maturity Date)
    /// </summary>
    public DateTime? DepositMaturityDate { get; set; }

    /// <summary>
    /// Faiz Orani % (Interest Rate)
    /// </summary>
    public decimal? InterestRate { get; set; }

    #endregion

    #region POS Bilgileri (POS Information)

    /// <summary>
    /// POS Hesabi mi? (Is POS Account)
    /// </summary>
    public bool IsPosAccount { get; set; }

    /// <summary>
    /// POS Komisyon Orani % (POS Commission Rate)
    /// </summary>
    public decimal? PosCommissionRate { get; set; }

    /// <summary>
    /// POS Terminal ID
    /// </summary>
    public string? PosTerminalId { get; set; }

    /// <summary>
    /// POS Merchant ID
    /// </summary>
    public string? PosMerchantId { get; set; }

    #endregion

    #region Limit Bilgileri (Limit Information)

    /// <summary>
    /// Gunluk Transfer Limiti (Daily Transfer Limit)
    /// </summary>
    public decimal? DailyTransferLimit { get; set; }

    /// <summary>
    /// Tek Seferde Transfer Limiti (Single Transfer Limit)
    /// </summary>
    public decimal? SingleTransferLimit { get; set; }

    /// <summary>
    /// Kredi Limiti (Credit Limit / Overdraft)
    /// </summary>
    public decimal? CreditLimit { get; set; }

    #endregion
}

/// <summary>
/// Banka Hesabi Guncelleme DTO (Update Bank Account DTO)
/// </summary>
public class UpdateBankAccountDto
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Hesap Adi (Account Name)
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Banka Adi (Bank Name)
    /// </summary>
    public string? BankName { get; set; }

    /// <summary>
    /// Sube Adi (Branch Name)
    /// </summary>
    public string? BranchName { get; set; }

    /// <summary>
    /// Sube Kodu (Branch Code)
    /// </summary>
    public string? BranchCode { get; set; }

    /// <summary>
    /// Swift/BIC Kodu (Swift/BIC Code)
    /// </summary>
    public string? SwiftCode { get; set; }

    /// <summary>
    /// Hesap Numarasi (Account Number)
    /// </summary>
    public string? AccountNumber { get; set; }

    /// <summary>
    /// IBAN
    /// </summary>
    public string? Iban { get; set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; set; }

    #endregion

    #region Muhasebe Bilgileri (Accounting Information)

    /// <summary>
    /// Muhasebe Hesabi ID (Linked Accounting Account ID)
    /// </summary>
    public int? AccountingAccountId { get; set; }

    #endregion

    #region POS Bilgileri (POS Information)

    /// <summary>
    /// POS Hesabi mi? (Is POS Account)
    /// </summary>
    public bool? IsPosAccount { get; set; }

    /// <summary>
    /// POS Komisyon Orani % (POS Commission Rate)
    /// </summary>
    public decimal? PosCommissionRate { get; set; }

    /// <summary>
    /// POS Terminal ID
    /// </summary>
    public string? PosTerminalId { get; set; }

    /// <summary>
    /// POS Merchant ID
    /// </summary>
    public string? PosMerchantId { get; set; }

    #endregion

    #region Entegrasyon Bilgileri (Integration Information)

    /// <summary>
    /// Banka Entegrasyonu Var mi? (Has Bank Integration)
    /// </summary>
    public bool? HasBankIntegration { get; set; }

    /// <summary>
    /// Entegrasyon Turu (Integration Type)
    /// </summary>
    public string? IntegrationType { get; set; }

    /// <summary>
    /// Otomatik Eslestirme Aktif mi? (Is Auto Matching Enabled)
    /// </summary>
    public bool? IsAutoMatchingEnabled { get; set; }

    #endregion

    #region Limit Bilgileri (Limit Information)

    /// <summary>
    /// Gunluk Transfer Limiti (Daily Transfer Limit)
    /// </summary>
    public decimal? DailyTransferLimit { get; set; }

    /// <summary>
    /// Tek Seferde Transfer Limiti (Single Transfer Limit)
    /// </summary>
    public decimal? SingleTransferLimit { get; set; }

    /// <summary>
    /// Kredi Limiti (Credit Limit / Overdraft)
    /// </summary>
    public decimal? CreditLimit { get; set; }

    #endregion
}

/// <summary>
/// Banka Hesabi Filtre DTO (Bank Account Filter DTO)
/// </summary>
public class BankAccountFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public BankAccountType? AccountType { get; set; }
    public BankAccountStatus? Status { get; set; }
    public string? Currency { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsDefault { get; set; }
    public bool? IsPosAccount { get; set; }
    public bool? HasBankIntegration { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = false;
}

/// <summary>
/// Banka Hesabi Bakiye Ozet DTO (Bank Account Balance Summary DTO)
/// </summary>
public class BankAccountBalanceSummaryDto
{
    /// <summary>
    /// Toplam Bakiye (Total Balance)
    /// </summary>
    public decimal TotalBalance { get; set; }

    /// <summary>
    /// Toplam Kullanilabilir Bakiye (Total Available Balance)
    /// </summary>
    public decimal TotalAvailableBalance { get; set; }

    /// <summary>
    /// Toplam Bloke Bakiye (Total Blocked Balance)
    /// </summary>
    public decimal TotalBlockedBalance { get; set; }

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; set; } = "TRY";

    /// <summary>
    /// Aktif Hesap Sayisi (Active Account Count)
    /// </summary>
    public int ActiveAccountCount { get; set; }

    /// <summary>
    /// Toplam Hesap Sayisi (Total Account Count)
    /// </summary>
    public int TotalAccountCount { get; set; }

    /// <summary>
    /// Para Birimine Gore Bakiyeler (Balances by Currency)
    /// </summary>
    public List<CurrencyBalanceDto> BalancesByCurrency { get; set; } = new();
}

/// <summary>
/// Para Birimi Bakiye DTO (Currency Balance DTO)
/// </summary>
public class CurrencyBalanceDto
{
    public string Currency { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public decimal AvailableBalance { get; set; }
    public int AccountCount { get; set; }
}

/// <summary>
/// Banka Hesabi Bakiye Guncelleme DTO (Update Bank Account Balance DTO)
/// </summary>
public class UpdateBankAccountBalanceDto
{
    /// <summary>
    /// Yeni Bakiye (New Balance)
    /// </summary>
    public decimal NewBalance { get; set; }

    /// <summary>
    /// Mutabakat Tarihi (Reconciliation Date)
    /// </summary>
    public DateTime? ReconciliationDate { get; set; }

    /// <summary>
    /// Aciklama (Notes)
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Banka Hesabi Durum Enum (Bank Account Status)
/// </summary>
public enum BankAccountStatus
{
    Active = 1,
    Inactive = 2,
    Closed = 3,
    Frozen = 4
}
