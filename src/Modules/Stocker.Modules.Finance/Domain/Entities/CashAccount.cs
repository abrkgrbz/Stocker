using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Kasa Hesabı (Cash Account)
/// Nakit işlemlerini yönetir
/// </summary>
public class CashAccount : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Kasa Kodu (Cash Account Code)
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Kasa Adı (Cash Account Name)
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Kasa Türü (Cash Account Type)
    /// </summary>
    public CashAccountType AccountType { get; private set; }

    #endregion

    #region Bakiye Bilgileri (Balance Information)

    /// <summary>
    /// Güncel Bakiye (Current Balance)
    /// </summary>
    public Money Balance { get; private set; } = null!;

    /// <summary>
    /// Minimum Bakiye Uyarısı (Minimum Balance Alert)
    /// </summary>
    public Money? MinimumBalance { get; private set; }

    /// <summary>
    /// Maksimum Bakiye Uyarısı (Maximum Balance Alert)
    /// </summary>
    public Money? MaximumBalance { get; private set; }

    /// <summary>
    /// Açılış Bakiyesi (Opening Balance)
    /// </summary>
    public Money OpeningBalance { get; private set; } = null!;

    /// <summary>
    /// Son Sayım Tarihi (Last Count Date)
    /// </summary>
    public DateTime? LastCountDate { get; private set; }

    /// <summary>
    /// Son Sayım Bakiyesi (Last Count Balance)
    /// </summary>
    public Money? LastCountBalance { get; private set; }

    #endregion

    #region Konum Bilgileri (Location Information)

    /// <summary>
    /// Şube ID (Branch ID)
    /// </summary>
    public int? BranchId { get; private set; }

    /// <summary>
    /// Şube Adı (Branch Name)
    /// </summary>
    public string? BranchName { get; private set; }

    /// <summary>
    /// Depo ID (Warehouse ID)
    /// </summary>
    public int? WarehouseId { get; private set; }

    /// <summary>
    /// Depo Adı (Warehouse Name)
    /// </summary>
    public string? WarehouseName { get; private set; }

    #endregion

    #region Sorumlu Bilgileri (Responsible Information)

    /// <summary>
    /// Sorumlu Kullanıcı ID (Responsible User ID)
    /// </summary>
    public int? ResponsibleUserId { get; private set; }

    /// <summary>
    /// Sorumlu Kullanıcı Adı (Responsible User Name)
    /// </summary>
    public string? ResponsibleUserName { get; private set; }

    #endregion

    #region Durum ve Muhasebe Bilgileri (Status and Accounting)

    /// <summary>
    /// Aktif mi? (Is Active)
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Varsayılan Kasa mı? (Is Default Cash Account)
    /// </summary>
    public bool IsDefault { get; private set; }

    /// <summary>
    /// Muhasebe Hesabı ID (Linked Accounting Account ID)
    /// </summary>
    public int? AccountingAccountId { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    #endregion

    #region Limit Bilgileri (Limit Information)

    /// <summary>
    /// Günlük İşlem Limiti (Daily Transaction Limit)
    /// </summary>
    public Money? DailyTransactionLimit { get; private set; }

    /// <summary>
    /// Tek Seferde İşlem Limiti (Single Transaction Limit)
    /// </summary>
    public Money? SingleTransactionLimit { get; private set; }

    #endregion

    #region Navigation Properties

    public virtual Account? AccountingAccount { get; private set; }
    public virtual ICollection<CashTransaction> Transactions { get; private set; } = new List<CashTransaction>();

    #endregion

    protected CashAccount() { }

    public CashAccount(
        string code,
        string name,
        CashAccountType accountType,
        string currency = "TRY")
    {
        Code = code;
        Name = name;
        AccountType = accountType;
        Currency = currency;
        Balance = Money.Zero(currency);
        OpeningBalance = Money.Zero(currency);
        IsActive = true;
        IsDefault = false;
    }

    public void UpdateBasicInfo(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    public void SetLocation(int? branchId, string? branchName, int? warehouseId, string? warehouseName)
    {
        BranchId = branchId;
        BranchName = branchName;
        WarehouseId = warehouseId;
        WarehouseName = warehouseName;
    }

    public void SetResponsible(int? userId, string? userName)
    {
        ResponsibleUserId = userId;
        ResponsibleUserName = userName;
    }

    public void SetBalanceAlerts(Money? minimum, Money? maximum)
    {
        if (minimum != null && minimum.Currency != Currency)
            throw new InvalidOperationException("Minimum balance currency mismatch");

        if (maximum != null && maximum.Currency != Currency)
            throw new InvalidOperationException("Maximum balance currency mismatch");

        MinimumBalance = minimum;
        MaximumBalance = maximum;
    }

    public void SetLimits(Money? dailyLimit, Money? singleLimit)
    {
        if (dailyLimit != null && dailyLimit.Currency != Currency)
            throw new InvalidOperationException("Daily limit currency mismatch");

        if (singleLimit != null && singleLimit.Currency != Currency)
            throw new InvalidOperationException("Single limit currency mismatch");

        DailyTransactionLimit = dailyLimit;
        SingleTransactionLimit = singleLimit;
    }

    public void SetOpeningBalance(Money balance)
    {
        if (balance.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        OpeningBalance = balance;
        Balance = balance;
    }

    public void LinkToAccountingAccount(int accountingAccountId)
    {
        AccountingAccountId = accountingAccountId;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    /// <summary>
    /// Tahsilat (Deposit/Collection)
    /// </summary>
    public void Deposit(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        ValidateMaximumBalance(amount);
        Balance = Money.Create(Balance.Amount + amount.Amount, Currency);
    }

    /// <summary>
    /// Tediye (Withdrawal/Payment)
    /// </summary>
    public void Withdraw(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        if (amount.Amount > Balance.Amount)
            throw new InvalidOperationException("Insufficient funds in cash account");

        ValidateSingleTransactionLimit(amount);
        Balance = Money.Create(Balance.Amount - amount.Amount, Currency);
    }

    public void SetBalance(Money balance)
    {
        if (balance.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        Balance = balance;
    }

    /// <summary>
    /// Kasa sayımı kaydet (Record cash count)
    /// </summary>
    public void RecordCount(Money countedBalance, DateTime countDate)
    {
        if (countedBalance.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        LastCountBalance = countedBalance;
        LastCountDate = countDate;
    }

    /// <summary>
    /// Sayım farkı hesapla (Calculate count difference)
    /// </summary>
    public Money GetCountDifference()
    {
        if (LastCountBalance == null)
            return Money.Zero(Currency);

        var difference = LastCountBalance.Amount - Balance.Amount;
        return Money.Create(difference, Currency);
    }

    private void ValidateMaximumBalance(Money depositAmount)
    {
        if (MaximumBalance == null) return;

        var newBalance = Balance.Amount + depositAmount.Amount;
        if (newBalance > MaximumBalance.Amount)
            throw new InvalidOperationException($"This deposit would exceed the maximum balance limit of {MaximumBalance}");
    }

    private void ValidateSingleTransactionLimit(Money amount)
    {
        if (SingleTransactionLimit == null) return;

        if (amount.Amount > SingleTransactionLimit.Amount)
            throw new InvalidOperationException($"Amount exceeds single transaction limit of {SingleTransactionLimit}");
    }

    /// <summary>
    /// Minimum bakiye altında mı? (Is below minimum balance)
    /// </summary>
    public bool IsBelowMinimumBalance()
    {
        if (MinimumBalance == null) return false;
        return Balance.Amount < MinimumBalance.Amount;
    }

    /// <summary>
    /// Maksimum bakiye üstünde mı? (Is above maximum balance)
    /// </summary>
    public bool IsAboveMaximumBalance()
    {
        if (MaximumBalance == null) return false;
        return Balance.Amount > MaximumBalance.Amount;
    }

    public void SetAsDefault()
    {
        IsDefault = true;
    }

    public void RemoveDefault()
    {
        IsDefault = false;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Kasa Türleri (Cash Account Types)
/// </summary>
public enum CashAccountType
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
