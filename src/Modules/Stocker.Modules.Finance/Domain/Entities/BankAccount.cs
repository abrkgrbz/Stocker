using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Banka Hesabı (Bank Account)
/// Şirketin banka hesaplarını yönetir
/// </summary>
public class BankAccount : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Hesap Kodu (Account Code)
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Hesap Adı (Account Name)
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Banka Adı (Bank Name)
    /// </summary>
    public string BankName { get; private set; } = string.Empty;

    /// <summary>
    /// Şube Adı (Branch Name)
    /// </summary>
    public string? BranchName { get; private set; }

    /// <summary>
    /// Şube Kodu (Branch Code)
    /// </summary>
    public string? BranchCode { get; private set; }

    /// <summary>
    /// Hesap Numarası (Account Number)
    /// </summary>
    public string AccountNumber { get; private set; } = string.Empty;

    /// <summary>
    /// IBAN
    /// </summary>
    public string Iban { get; private set; } = string.Empty;

    /// <summary>
    /// Swift/BIC Kodu (Swift/BIC Code)
    /// </summary>
    public string? SwiftCode { get; private set; }

    #endregion

    #region Para Birimi ve Bakiye (Currency and Balance)

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Güncel Bakiye (Current Balance)
    /// </summary>
    public Money Balance { get; private set; } = null!;

    /// <summary>
    /// Bloke Bakiye (Blocked Balance)
    /// </summary>
    public Money BlockedBalance { get; private set; } = null!;

    /// <summary>
    /// Kullanılabilir Bakiye (Available Balance)
    /// </summary>
    public Money AvailableBalance { get; private set; } = null!;

    /// <summary>
    /// Son Mutabakat Tarihi (Last Reconciliation Date)
    /// </summary>
    public DateTime? LastReconciliationDate { get; private set; }

    /// <summary>
    /// Mutabakat Bakiyesi (Reconciled Balance)
    /// </summary>
    public Money? ReconciledBalance { get; private set; }

    #endregion

    #region Hesap Türü (Account Type)

    /// <summary>
    /// Hesap Türü (Account Type)
    /// </summary>
    public BankAccountType AccountType { get; private set; }

    /// <summary>
    /// Vadesiz mi? (Is Demand Account)
    /// </summary>
    public bool IsDemandAccount { get; private set; }

    /// <summary>
    /// Mevduat Vadesi (Deposit Maturity Date)
    /// </summary>
    public DateTime? DepositMaturityDate { get; private set; }

    /// <summary>
    /// Faiz Oranı % (Interest Rate)
    /// </summary>
    public decimal? InterestRate { get; private set; }

    #endregion

    #region POS Bilgileri (POS Information)

    /// <summary>
    /// POS Hesabı mı? (Is POS Account)
    /// </summary>
    public bool IsPosAccount { get; private set; }

    /// <summary>
    /// POS Komisyon Oranı % (POS Commission Rate)
    /// </summary>
    public decimal? PosCommissionRate { get; private set; }

    /// <summary>
    /// POS Terminal ID
    /// </summary>
    public string? PosTerminalId { get; private set; }

    /// <summary>
    /// POS Merchant ID
    /// </summary>
    public string? PosMerchantId { get; private set; }

    #endregion

    #region Entegrasyon Bilgileri (Integration Information)

    /// <summary>
    /// Banka Entegrasyonu Var mı? (Has Bank Integration)
    /// </summary>
    public bool HasBankIntegration { get; private set; }

    /// <summary>
    /// Entegrasyon Türü (Integration Type)
    /// </summary>
    public string? IntegrationType { get; private set; }

    /// <summary>
    /// Son Entegrasyon Tarihi (Last Integration Date)
    /// </summary>
    public DateTime? LastIntegrationDate { get; private set; }

    /// <summary>
    /// Otomatik Eşleştirme Aktif mi? (Is Auto Matching Enabled)
    /// </summary>
    public bool IsAutoMatchingEnabled { get; private set; }

    #endregion

    #region Limit Bilgileri (Limit Information)

    /// <summary>
    /// Günlük Transfer Limiti (Daily Transfer Limit)
    /// </summary>
    public Money? DailyTransferLimit { get; private set; }

    /// <summary>
    /// Tek Seferde Transfer Limiti (Single Transfer Limit)
    /// </summary>
    public Money? SingleTransferLimit { get; private set; }

    /// <summary>
    /// Kredi Limiti (Credit Limit / Overdraft)
    /// </summary>
    public Money? CreditLimit { get; private set; }

    #endregion

    #region Durum ve Muhasebe Bilgileri (Status and Accounting)

    /// <summary>
    /// Aktif mi? (Is Active)
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Varsayılan Hesap mı? (Is Default Account)
    /// </summary>
    public bool IsDefault { get; private set; }

    /// <summary>
    /// Muhasebe Hesabı ID (Linked Accounting Account ID)
    /// </summary>
    public int? AccountingAccountId { get; private set; }

    /// <summary>
    /// Açılış Tarihi (Opening Date)
    /// </summary>
    public DateTime? OpeningDate { get; private set; }

    /// <summary>
    /// Kapanış Tarihi (Closing Date)
    /// </summary>
    public DateTime? ClosingDate { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    #endregion

    #region Navigation Properties

    public virtual Account? AccountingAccount { get; private set; }
    public virtual ICollection<BankTransaction> Transactions { get; private set; } = new List<BankTransaction>();

    #endregion

    protected BankAccount() { }

    public BankAccount(
        string code,
        string name,
        string bankName,
        string accountNumber,
        string iban,
        BankAccountType accountType,
        string currency = "TRY")
    {
        Code = code;
        Name = name;
        BankName = bankName;
        AccountNumber = accountNumber;
        Iban = iban.Replace(" ", "").ToUpperInvariant();
        AccountType = accountType;
        Currency = currency;
        Balance = Money.Zero(currency);
        BlockedBalance = Money.Zero(currency);
        AvailableBalance = Money.Zero(currency);
        IsActive = true;
        IsDefault = false;
        IsDemandAccount = true;
        IsPosAccount = false;
        HasBankIntegration = false;
        IsAutoMatchingEnabled = false;
    }

    public void UpdateBasicInfo(string name, string bankName, string? branchName, string? branchCode, string? swiftCode)
    {
        Name = name;
        BankName = bankName;
        BranchName = branchName;
        BranchCode = branchCode;
        SwiftCode = swiftCode;
    }

    public void UpdateAccountNumbers(string accountNumber, string iban)
    {
        AccountNumber = accountNumber;
        Iban = iban.Replace(" ", "").ToUpperInvariant();
    }

    public void SetAsDepositAccount(DateTime maturityDate, decimal interestRate)
    {
        IsDemandAccount = false;
        DepositMaturityDate = maturityDate;
        InterestRate = interestRate;
    }

    public void SetAsDemandAccount()
    {
        IsDemandAccount = true;
        DepositMaturityDate = null;
        InterestRate = null;
    }

    public void SetPosInfo(bool isPosAccount, decimal? commissionRate = null, string? terminalId = null, string? merchantId = null)
    {
        IsPosAccount = isPosAccount;
        PosCommissionRate = commissionRate;
        PosTerminalId = terminalId;
        PosMerchantId = merchantId;
    }

    public void SetIntegration(bool hasIntegration, string? integrationType = null, bool autoMatching = false)
    {
        HasBankIntegration = hasIntegration;
        IntegrationType = integrationType;
        IsAutoMatchingEnabled = autoMatching;
        if (hasIntegration)
            LastIntegrationDate = DateTime.UtcNow;
    }

    public void SetLimits(Money? dailyLimit, Money? singleLimit, Money? creditLimit)
    {
        DailyTransferLimit = dailyLimit;
        SingleTransferLimit = singleLimit;
        CreditLimit = creditLimit;
    }

    public void LinkToAccountingAccount(int accountingAccountId)
    {
        AccountingAccountId = accountingAccountId;
    }

    public void SetOpeningDate(DateTime openingDate)
    {
        OpeningDate = openingDate;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void Deposit(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        Balance = Money.Create(Balance.Amount + amount.Amount, Currency);
        RecalculateAvailableBalance();
    }

    public void Withdraw(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        if (amount.Amount > AvailableBalance.Amount)
            throw new InvalidOperationException("Insufficient funds");

        Balance = Money.Create(Balance.Amount - amount.Amount, Currency);
        RecalculateAvailableBalance();
    }

    public void BlockAmount(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        BlockedBalance = Money.Create(BlockedBalance.Amount + amount.Amount, Currency);
        RecalculateAvailableBalance();
    }

    public void UnblockAmount(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        if (amount.Amount > BlockedBalance.Amount)
            throw new InvalidOperationException("Cannot unblock more than blocked amount");

        BlockedBalance = Money.Create(BlockedBalance.Amount - amount.Amount, Currency);
        RecalculateAvailableBalance();
    }

    public void SetBalance(Money balance)
    {
        if (balance.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        Balance = balance;
        RecalculateAvailableBalance();
    }

    private void RecalculateAvailableBalance()
    {
        AvailableBalance = Money.Create(Balance.Amount - BlockedBalance.Amount, Currency);
    }

    public void Reconcile(Money reconciledBalance, DateTime reconciliationDate)
    {
        ReconciledBalance = reconciledBalance;
        LastReconciliationDate = reconciliationDate;
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

    public void Close(DateTime closingDate)
    {
        if (Balance.Amount != 0)
            throw new InvalidOperationException("Cannot close account with non-zero balance");

        ClosingDate = closingDate;
        IsActive = false;
    }
}

/// <summary>
/// Banka Hesap Türleri (Bank Account Types)
/// </summary>
public enum BankAccountType
{
    /// <summary>
    /// Vadesiz Mevduat (Demand Deposit)
    /// </summary>
    DemandDeposit = 1,

    /// <summary>
    /// Vadeli Mevduat (Time Deposit)
    /// </summary>
    TimeDeposit = 2,

    /// <summary>
    /// Döviz Hesabı (Foreign Currency Account)
    /// </summary>
    ForeignCurrency = 3,

    /// <summary>
    /// Kredi Hesabı (Loan Account)
    /// </summary>
    Loan = 4,

    /// <summary>
    /// POS Hesabı (POS Account)
    /// </summary>
    POS = 5,

    /// <summary>
    /// Yatırım Hesabı (Investment Account)
    /// </summary>
    Investment = 6,

    /// <summary>
    /// Kredi Kartı Hesabı (Credit Card Account)
    /// </summary>
    CreditCard = 7
}
