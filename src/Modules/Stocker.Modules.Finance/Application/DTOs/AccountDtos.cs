using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Muhasebe Hesabı DTO (Account DTO)
/// </summary>
public class AccountDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentAccountId { get; set; }
    public string? ParentAccountCode { get; set; }
    public string? ParentAccountName { get; set; }

    // Account Classification
    public AccountType AccountType { get; set; }
    public string AccountTypeName { get; set; } = string.Empty;
    public AccountSubGroup? SubGroup { get; set; }
    public string? SubGroupName { get; set; }

    // Balance Information
    public string Currency { get; set; } = "TRY";
    public decimal DebitBalance { get; set; }
    public decimal CreditBalance { get; set; }
    public decimal Balance { get; set; }

    // Account Properties
    public bool IsActive { get; set; }
    public bool IsSystemAccount { get; set; }
    public int Level { get; set; }
    public bool AcceptsSubAccounts { get; set; }
    public bool AcceptsTransactions { get; set; }
    public bool IsDebitNatured { get; set; }
    public bool ClosesAtPeriodEnd { get; set; }

    // Linked Accounts
    public int? LinkedBankAccountId { get; set; }
    public string? LinkedBankAccountName { get; set; }
    public int? LinkedCashAccountId { get; set; }
    public string? LinkedCashAccountName { get; set; }
    public int? LinkedCurrentAccountId { get; set; }
    public string? LinkedCurrentAccountName { get; set; }

    // Child Accounts
    public List<AccountSummaryDto> SubAccounts { get; set; } = new();

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Muhasebe Hesabı Özet DTO (Account Summary DTO) - Liste ve ağaç görünümü için
/// </summary>
public class AccountSummaryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int? ParentAccountId { get; set; }
    public AccountType AccountType { get; set; }
    public string AccountTypeName { get; set; } = string.Empty;
    public AccountSubGroup? SubGroup { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal Balance { get; set; }
    public bool IsActive { get; set; }
    public bool IsSystemAccount { get; set; }
    public int Level { get; set; }
    public bool AcceptsSubAccounts { get; set; }
    public bool AcceptsTransactions { get; set; }
    public bool HasChildren { get; set; }

    // For tree view
    public List<AccountSummaryDto> Children { get; set; } = new();
}

/// <summary>
/// Muhasebe Hesabı Oluşturma DTO (Create Account DTO)
/// </summary>
public class CreateAccountDto
{
    /// <summary>
    /// Hesap Kodu - örn: "100", "100.01", "120.01.001"
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Hesap Adı
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Açıklama
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Üst Hesap ID (opsiyonel)
    /// </summary>
    public int? ParentAccountId { get; set; }

    /// <summary>
    /// Ana Hesap Grubu (1-9)
    /// </summary>
    public AccountType AccountType { get; set; }

    /// <summary>
    /// Alt Grup (10, 11, 12, vb.)
    /// </summary>
    public AccountSubGroup? SubGroup { get; set; }

    /// <summary>
    /// Para Birimi
    /// </summary>
    public string Currency { get; set; } = "TRY";

    /// <summary>
    /// Alt Hesap Kabul Eder mi?
    /// </summary>
    public bool AcceptsSubAccounts { get; set; } = true;

    /// <summary>
    /// Hareket Kabul Eder mi? (Sadece yaprak hesaplar)
    /// </summary>
    public bool AcceptsTransactions { get; set; } = false;
}

/// <summary>
/// Muhasebe Hesabı Güncelleme DTO (Update Account DTO)
/// </summary>
public class UpdateAccountDto
{
    /// <summary>
    /// Hesap Adı
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Açıklama
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Alt Hesap Kabul Eder mi?
    /// </summary>
    public bool? AcceptsSubAccounts { get; set; }

    /// <summary>
    /// Hareket Kabul Eder mi?
    /// </summary>
    public bool? AcceptsTransactions { get; set; }
}

/// <summary>
/// Muhasebe Hesabı Filtreleme DTO (Account Filter DTO)
/// </summary>
public class AccountFilterDto
{
    /// <summary>
    /// Arama terimi (Kod veya Ad)
    /// </summary>
    public string? SearchTerm { get; set; }

    /// <summary>
    /// Hesap Tipi Filtresi
    /// </summary>
    public AccountType? AccountType { get; set; }

    /// <summary>
    /// Alt Grup Filtresi
    /// </summary>
    public AccountSubGroup? SubGroup { get; set; }

    /// <summary>
    /// Para Birimi Filtresi
    /// </summary>
    public string? Currency { get; set; }

    /// <summary>
    /// Aktiflik Durumu Filtresi
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// Sadece Sistem Hesapları
    /// </summary>
    public bool? IsSystemAccount { get; set; }

    /// <summary>
    /// Hareket Kabul Eden Hesaplar (Yaprak Hesaplar)
    /// </summary>
    public bool? AcceptsTransactions { get; set; }

    /// <summary>
    /// Hesap Seviyesi Filtresi
    /// </summary>
    public int? Level { get; set; }

    /// <summary>
    /// Üst Hesap ID (belirli bir hesabın alt hesapları için)
    /// </summary>
    public int? ParentAccountId { get; set; }

    /// <summary>
    /// Sadece Kök Hesaplar (Üst hesabı olmayan)
    /// </summary>
    public bool? RootOnly { get; set; }

    // Pagination
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    // Sorting
    public string? SortBy { get; set; } = "Code";
    public bool SortDescending { get; set; } = false;
}

/// <summary>
/// Hesap Ağacı Düğümü DTO (Account Tree Node DTO)
/// </summary>
public class AccountTreeNodeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string FullPath { get; set; } = string.Empty;
    public int? ParentAccountId { get; set; }
    public AccountType AccountType { get; set; }
    public string AccountTypeName { get; set; } = string.Empty;
    public AccountSubGroup? SubGroup { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal Balance { get; set; }
    public bool IsActive { get; set; }
    public int Level { get; set; }
    public bool AcceptsTransactions { get; set; }
    public bool IsExpanded { get; set; }
    public bool HasChildren { get; set; }
    public List<AccountTreeNodeDto> Children { get; set; } = new();
}
