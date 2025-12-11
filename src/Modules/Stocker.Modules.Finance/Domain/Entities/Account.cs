using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Muhasebe Hesabı - Tekdüzen Hesap Planı'na uygun (Chart of Accounts)
/// Turkish Uniform Chart of Accounts compliant account structure
/// </summary>
public class Account : BaseEntity
{
    /// <summary>
    /// Hesap Kodu (Account Code) - e.g., "100", "100.01", "120.01.001"
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Hesap Adı (Account Name)
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Üst Hesap ID (Parent Account ID)
    /// </summary>
    public int? ParentAccountId { get; private set; }

    /// <summary>
    /// Ana Hesap Grubu (Main Account Group) - 1-9
    /// </summary>
    public AccountType AccountType { get; private set; }

    /// <summary>
    /// Alt Grup (Sub Group) - 10, 11, 12, etc.
    /// </summary>
    public AccountSubGroup? SubGroup { get; private set; }

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Borç Bakiyesi (Debit Balance)
    /// </summary>
    public Money DebitBalance { get; private set; } = null!;

    /// <summary>
    /// Alacak Bakiyesi (Credit Balance)
    /// </summary>
    public Money CreditBalance { get; private set; } = null!;

    /// <summary>
    /// Net Bakiye (Net Balance) = Debit - Credit
    /// </summary>
    public Money Balance { get; private set; } = null!;

    /// <summary>
    /// Aktif mi? (Is Active)
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Sistem Hesabı mı? (Is System Account - cannot be deleted)
    /// </summary>
    public bool IsSystemAccount { get; private set; }

    /// <summary>
    /// Hesap Seviyesi (Account Level) - derived from code structure
    /// </summary>
    public int Level { get; private set; }

    /// <summary>
    /// Alt Hesap Kabul Eder mi? (Accepts Sub-accounts)
    /// </summary>
    public bool AcceptsSubAccounts { get; private set; }

    /// <summary>
    /// Hareket Kabul Eder mi? (Accepts Transactions)
    /// Only leaf accounts can have transactions
    /// </summary>
    public bool AcceptsTransactions { get; private set; }

    /// <summary>
    /// Borç Karakterli mi? (Is Debit Natured)
    /// Assets and Expenses are debit natured
    /// </summary>
    public bool IsDebitNatured { get; private set; }

    /// <summary>
    /// Dönem Sonu Kapatılacak mı? (Closes at Period End)
    /// Revenue and Expense accounts close at year end
    /// </summary>
    public bool ClosesAtPeriodEnd { get; private set; }

    /// <summary>
    /// Banka Hesabı ile İlişkili mi? (Linked to Bank Account)
    /// </summary>
    public int? LinkedBankAccountId { get; private set; }

    /// <summary>
    /// Kasa ile İlişkili mi? (Linked to Cash Account)
    /// </summary>
    public int? LinkedCashAccountId { get; private set; }

    /// <summary>
    /// Cari Hesap ile İlişkili mi? (Linked to Current Account)
    /// </summary>
    public int? LinkedCurrentAccountId { get; private set; }

    // Navigation Properties
    public virtual Account? ParentAccount { get; private set; }
    public virtual ICollection<Account> SubAccounts { get; private set; } = new List<Account>();
    public virtual ICollection<JournalEntryLine> JournalEntryLines { get; private set; } = new List<JournalEntryLine>();

    protected Account() { }

    public Account(
        string code,
        string name,
        AccountType accountType,
        string currency = "TRY",
        int? parentAccountId = null,
        AccountSubGroup? subGroup = null)
    {
        Code = code;
        Name = name;
        AccountType = accountType;
        SubGroup = subGroup;
        Currency = currency;
        ParentAccountId = parentAccountId;
        DebitBalance = Money.Zero(currency);
        CreditBalance = Money.Zero(currency);
        Balance = Money.Zero(currency);
        IsActive = true;
        IsSystemAccount = false;
        Level = CalculateLevel(code);
        AcceptsSubAccounts = true;
        AcceptsTransactions = false; // Default to false, set true for leaf accounts
        IsDebitNatured = DetermineDebitNature(accountType);
        ClosesAtPeriodEnd = DetermineClosesAtPeriodEnd(accountType);
    }

    public void Update(string name, string? description, bool acceptsSubAccounts, bool acceptsTransactions)
    {
        Name = name;
        Description = description;
        AcceptsSubAccounts = acceptsSubAccounts;
        AcceptsTransactions = acceptsTransactions;
    }

    public void SetAsLeafAccount()
    {
        AcceptsSubAccounts = false;
        AcceptsTransactions = true;
    }

    public void SetAsParentAccount()
    {
        AcceptsSubAccounts = true;
        AcceptsTransactions = false;
    }

    /// <summary>
    /// Borç kaydı ekle (Add debit entry)
    /// </summary>
    public void Debit(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException($"Currency mismatch. Account: {Currency}, Amount: {amount.Currency}");

        DebitBalance = Money.Create(DebitBalance.Amount + amount.Amount, Currency);
        RecalculateBalance();
    }

    /// <summary>
    /// Alacak kaydı ekle (Add credit entry)
    /// </summary>
    public void Credit(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException($"Currency mismatch. Account: {Currency}, Amount: {amount.Currency}");

        CreditBalance = Money.Create(CreditBalance.Amount + amount.Amount, Currency);
        RecalculateBalance();
    }

    /// <summary>
    /// Bakiye yeniden hesapla (Recalculate balance)
    /// </summary>
    private void RecalculateBalance()
    {
        var netAmount = IsDebitNatured
            ? DebitBalance.Amount - CreditBalance.Amount
            : CreditBalance.Amount - DebitBalance.Amount;

        Balance = Money.Create(Math.Abs(netAmount), Currency);
    }

    /// <summary>
    /// Dönem sonu bakiye sıfırla (Reset balance at period end)
    /// </summary>
    public void ResetBalance()
    {
        DebitBalance = Money.Zero(Currency);
        CreditBalance = Money.Zero(Currency);
        Balance = Money.Zero(Currency);
    }

    public void MarkAsSystemAccount()
    {
        IsSystemAccount = true;
    }

    public void LinkToBankAccount(int bankAccountId)
    {
        LinkedBankAccountId = bankAccountId;
    }

    public void LinkToCashAccount(int cashAccountId)
    {
        LinkedCashAccountId = cashAccountId;
    }

    public void LinkToCurrentAccount(int currentAccountId)
    {
        LinkedCurrentAccountId = currentAccountId;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    private int CalculateLevel(string code)
    {
        return code.Split('.').Length;
    }

    private bool DetermineDebitNature(AccountType type)
    {
        // Assets (1-2), Expenses (6-7) are debit natured
        return type == AccountType.CurrentAssets ||
               type == AccountType.NonCurrentAssets ||
               type == AccountType.Revenue ||
               type == AccountType.Cost;
    }

    private bool DetermineClosesAtPeriodEnd(AccountType type)
    {
        // Revenue (6) and Cost (7) accounts close at year end
        return type == AccountType.Revenue || type == AccountType.Cost;
    }
}
