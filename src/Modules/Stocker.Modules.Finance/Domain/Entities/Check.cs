using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Çek (Check)
/// Alınan ve verilen çekleri yönetir
/// </summary>
public class Check : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Çek Numarası (Check Number)
    /// </summary>
    public string CheckNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Portföy Numarası (Portfolio Number)
    /// </summary>
    public string PortfolioNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Seri Numarası (Serial Number)
    /// </summary>
    public string? SerialNumber { get; private set; }

    /// <summary>
    /// Çek Türü (Check Type)
    /// </summary>
    public CheckType CheckType { get; private set; }

    /// <summary>
    /// Hareket Yönü (Direction)
    /// Inbound = Alınan Çek, Outbound = Verilen Çek
    /// </summary>
    public MovementDirection Direction { get; private set; }

    /// <summary>
    /// Durum (Status)
    /// </summary>
    public NegotiableInstrumentStatus Status { get; private set; }

    #endregion

    #region Tarih Bilgileri (Date Information)

    /// <summary>
    /// Kayıt Tarihi (Registration Date)
    /// </summary>
    public DateTime RegistrationDate { get; private set; }

    /// <summary>
    /// Vade Tarihi (Due Date)
    /// </summary>
    public DateTime DueDate { get; private set; }

    /// <summary>
    /// Keşide Tarihi (Issue Date)
    /// </summary>
    public DateTime IssueDate { get; private set; }

    /// <summary>
    /// Tahsilat/Ödeme Tarihi (Collection/Payment Date)
    /// </summary>
    public DateTime? CollectionDate { get; private set; }

    #endregion

    #region Tutar Bilgileri (Amount Information)

    /// <summary>
    /// Çek Tutarı (Check Amount)
    /// </summary>
    public Money Amount { get; private set; } = null!;

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Döviz Kuru (Exchange Rate)
    /// </summary>
    public decimal ExchangeRate { get; private set; } = 1;

    /// <summary>
    /// TL Tutarı (Amount in TRY)
    /// </summary>
    public Money AmountTRY { get; private set; } = null!;

    #endregion

    #region Banka Bilgileri (Bank Information)

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
    public string? AccountNumber { get; private set; }

    /// <summary>
    /// IBAN
    /// </summary>
    public string? Iban { get; private set; }

    #endregion

    #region Keşideci Bilgileri (Drawer Information)

    /// <summary>
    /// Keşideci Adı (Drawer Name)
    /// </summary>
    public string DrawerName { get; private set; } = string.Empty;

    /// <summary>
    /// Keşideci VKN/TCKN (Drawer Tax/ID Number)
    /// </summary>
    public string? DrawerTaxId { get; private set; }

    /// <summary>
    /// Keşideci Adresi (Drawer Address)
    /// </summary>
    public string? DrawerAddress { get; private set; }

    /// <summary>
    /// Keşideci Telefon (Drawer Phone)
    /// </summary>
    public string? DrawerPhone { get; private set; }

    #endregion

    #region Lehdar Bilgileri (Beneficiary Information)

    /// <summary>
    /// Lehdar Adı (Beneficiary Name)
    /// </summary>
    public string? BeneficiaryName { get; private set; }

    /// <summary>
    /// Lehdar VKN/TCKN (Beneficiary Tax/ID Number)
    /// </summary>
    public string? BeneficiaryTaxId { get; private set; }

    #endregion

    #region Cari Hesap Bilgileri (Current Account Information)

    /// <summary>
    /// Cari Hesap ID (Current Account ID)
    /// </summary>
    public int? CurrentAccountId { get; private set; }

    /// <summary>
    /// Cari Hesap Adı (Current Account Name)
    /// </summary>
    public string? CurrentAccountName { get; private set; }

    #endregion

    #region Hareket Bilgileri (Movement Information)

    /// <summary>
    /// Bankaya Tahsile Verildi mi? (Is Given to Bank)
    /// </summary>
    public bool IsGivenToBank { get; private set; }

    /// <summary>
    /// Tahsile Veren Banka Hesabı ID (Bank Account for Collection)
    /// </summary>
    public int? CollectionBankAccountId { get; private set; }

    /// <summary>
    /// Tahsile Verme Tarihi (Given to Bank Date)
    /// </summary>
    public DateTime? GivenToBankDate { get; private set; }

    /// <summary>
    /// Ciro Edildi mi? (Is Endorsed)
    /// </summary>
    public bool IsEndorsed { get; private set; }

    /// <summary>
    /// Ciro Edilen Cari Hesap ID (Endorsed to Current Account)
    /// </summary>
    public int? EndorsedToCurrentAccountId { get; private set; }

    /// <summary>
    /// Ciro Tarihi (Endorsement Date)
    /// </summary>
    public DateTime? EndorsementDate { get; private set; }

    /// <summary>
    /// Teminata Verildi mi? (Is Given as Collateral)
    /// </summary>
    public bool IsGivenAsCollateral { get; private set; }

    /// <summary>
    /// Teminat Verilen Yer (Collateral Given To)
    /// </summary>
    public string? CollateralGivenTo { get; private set; }

    /// <summary>
    /// Teminat Verme Tarihi (Collateral Date)
    /// </summary>
    public DateTime? CollateralDate { get; private set; }

    #endregion

    #region Karşılıksız/Protesto Bilgileri (Bounced/Protest Information)

    /// <summary>
    /// Karşılıksız mı? (Is Bounced)
    /// </summary>
    public bool IsBounced { get; private set; }

    /// <summary>
    /// Karşılıksız Tarihi (Bounced Date)
    /// </summary>
    public DateTime? BouncedDate { get; private set; }

    /// <summary>
    /// Karşılıksız Nedeni (Bounced Reason)
    /// </summary>
    public string? BouncedReason { get; private set; }

    /// <summary>
    /// Protestolu mu? (Is Protested)
    /// </summary>
    public bool IsProtested { get; private set; }

    /// <summary>
    /// Protesto Tarihi (Protest Date)
    /// </summary>
    public DateTime? ProtestDate { get; private set; }

    #endregion

    #region Referans Bilgileri (Reference Information)

    /// <summary>
    /// Ödeme ID (Payment ID)
    /// </summary>
    public int? PaymentId { get; private set; }

    /// <summary>
    /// Muhasebe Fişi ID (Journal Entry ID)
    /// </summary>
    public int? JournalEntryId { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    #endregion

    #region Navigation Properties

    public virtual CurrentAccount? CurrentAccount { get; private set; }
    public virtual CurrentAccount? EndorsedToCurrentAccount { get; private set; }
    public virtual BankAccount? CollectionBankAccount { get; private set; }
    public virtual Payment? Payment { get; private set; }
    public virtual JournalEntry? JournalEntry { get; private set; }
    public virtual ICollection<CheckMovement> Movements { get; private set; } = new List<CheckMovement>();

    #endregion

    protected Check() { }

    public Check(
        string checkNumber,
        string portfolioNumber,
        CheckType checkType,
        MovementDirection direction,
        DateTime registrationDate,
        DateTime dueDate,
        DateTime issueDate,
        Money amount,
        string bankName,
        string drawerName,
        string currency = "TRY")
    {
        CheckNumber = checkNumber;
        PortfolioNumber = portfolioNumber;
        CheckType = checkType;
        Direction = direction;
        RegistrationDate = registrationDate;
        DueDate = dueDate;
        IssueDate = issueDate;
        Amount = amount;
        Currency = currency;
        ExchangeRate = 1;
        AmountTRY = amount;
        BankName = bankName;
        DrawerName = drawerName;
        Status = NegotiableInstrumentStatus.InPortfolio;
        IsGivenToBank = false;
        IsEndorsed = false;
        IsGivenAsCollateral = false;
        IsBounced = false;
        IsProtested = false;
    }

    public void SetSerialNumber(string? serialNumber)
    {
        SerialNumber = serialNumber;
    }

    public void SetExchangeRate(decimal rate)
    {
        ExchangeRate = rate;
        AmountTRY = Money.Create(Amount.Amount * rate, "TRY");
    }

    public void SetBankInfo(string bankName, string? branchName, string? branchCode, string? accountNumber, string? iban)
    {
        BankName = bankName;
        BranchName = branchName;
        BranchCode = branchCode;
        AccountNumber = accountNumber;
        Iban = iban?.Replace(" ", "").ToUpperInvariant();
    }

    public void SetDrawerInfo(string drawerName, string? taxId, string? address, string? phone)
    {
        DrawerName = drawerName;
        DrawerTaxId = taxId;
        DrawerAddress = address;
        DrawerPhone = phone;
    }

    public void SetBeneficiaryInfo(string? beneficiaryName, string? taxId)
    {
        BeneficiaryName = beneficiaryName;
        BeneficiaryTaxId = taxId;
    }

    public void LinkToCurrentAccount(int currentAccountId, string currentAccountName)
    {
        CurrentAccountId = currentAccountId;
        CurrentAccountName = currentAccountName;
    }

    public void LinkToPayment(int paymentId)
    {
        PaymentId = paymentId;
    }

    public void LinkToJournalEntry(int journalEntryId)
    {
        JournalEntryId = journalEntryId;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    #region Status Management

    /// <summary>
    /// Bankaya tahsile ver (Give to bank for collection)
    /// </summary>
    public void GiveToBank(int bankAccountId, DateTime date)
    {
        if (Direction != MovementDirection.Inbound)
            throw new InvalidOperationException("Only received checks can be given to bank");

        if (Status != NegotiableInstrumentStatus.InPortfolio)
            throw new InvalidOperationException("Check must be in portfolio to give to bank");

        IsGivenToBank = true;
        CollectionBankAccountId = bankAccountId;
        GivenToBankDate = date;
        Status = NegotiableInstrumentStatus.GivenToBank;

        AddMovement(CheckMovementType.GivenToBank, date, $"Bankaya tahsile verildi");
    }

    /// <summary>
    /// Bankadan geri al (Return from bank)
    /// </summary>
    public void ReturnFromBank(DateTime date)
    {
        if (Status != NegotiableInstrumentStatus.GivenToBank)
            throw new InvalidOperationException("Check must be given to bank to return");

        IsGivenToBank = false;
        Status = NegotiableInstrumentStatus.InPortfolio;

        AddMovement(CheckMovementType.ReturnedFromBank, date, "Bankadan geri alındı");
    }

    /// <summary>
    /// Ciro et (Endorse)
    /// </summary>
    public void Endorse(int endorsedToCurrentAccountId, DateTime date)
    {
        if (Direction != MovementDirection.Inbound)
            throw new InvalidOperationException("Only received checks can be endorsed");

        if (Status != NegotiableInstrumentStatus.InPortfolio)
            throw new InvalidOperationException("Check must be in portfolio to endorse");

        IsEndorsed = true;
        EndorsedToCurrentAccountId = endorsedToCurrentAccountId;
        EndorsementDate = date;
        Status = NegotiableInstrumentStatus.Endorsed;

        AddMovement(CheckMovementType.Endorsed, date, "Ciro edildi");
    }

    /// <summary>
    /// Teminata ver (Give as collateral)
    /// </summary>
    public void GiveAsCollateral(string collateralGivenTo, DateTime date)
    {
        if (Direction != MovementDirection.Inbound)
            throw new InvalidOperationException("Only received checks can be given as collateral");

        if (Status != NegotiableInstrumentStatus.InPortfolio)
            throw new InvalidOperationException("Check must be in portfolio to give as collateral");

        IsGivenAsCollateral = true;
        CollateralGivenTo = collateralGivenTo;
        CollateralDate = date;
        Status = NegotiableInstrumentStatus.GivenAsCollateral;

        AddMovement(CheckMovementType.GivenAsCollateral, date, $"Teminata verildi: {collateralGivenTo}");
    }

    /// <summary>
    /// Tahsil et (Collect)
    /// </summary>
    public void Collect(DateTime date)
    {
        if (Status != NegotiableInstrumentStatus.InPortfolio && Status != NegotiableInstrumentStatus.GivenToBank)
            throw new InvalidOperationException("Check must be in portfolio or given to bank to collect");

        CollectionDate = date;
        Status = NegotiableInstrumentStatus.Collected;

        AddMovement(CheckMovementType.Collected, date, "Tahsil edildi");
    }

    /// <summary>
    /// Karşılıksız olarak işaretle (Mark as bounced)
    /// </summary>
    public void MarkAsBounced(DateTime date, string reason)
    {
        IsBounced = true;
        BouncedDate = date;
        BouncedReason = reason;
        Status = NegotiableInstrumentStatus.Bounced;

        AddMovement(CheckMovementType.Bounced, date, $"Karşılıksız: {reason}");
    }

    /// <summary>
    /// Protesto et (Protest)
    /// </summary>
    public void Protest(DateTime date)
    {
        if (!IsBounced)
            throw new InvalidOperationException("Check must be bounced to protest");

        IsProtested = true;
        ProtestDate = date;
        Status = NegotiableInstrumentStatus.Protested;

        AddMovement(CheckMovementType.Protested, date, "Protesto edildi");
    }

    /// <summary>
    /// İade et (Return)
    /// </summary>
    public void Return(DateTime date, string reason)
    {
        Status = NegotiableInstrumentStatus.Returned;

        AddMovement(CheckMovementType.Returned, date, $"İade edildi: {reason}");
    }

    private void AddMovement(CheckMovementType movementType, DateTime date, string description)
    {
        var movement = new CheckMovement(Id, movementType, date, description);
        Movements.Add(movement);
    }

    #endregion

    #region Factory Methods

    /// <summary>
    /// Alınan çek oluştur (Create received check)
    /// </summary>
    public static Check CreateReceivedCheck(
        string checkNumber,
        string portfolioNumber,
        DateTime registrationDate,
        DateTime dueDate,
        DateTime issueDate,
        Money amount,
        string bankName,
        string drawerName,
        int? currentAccountId = null,
        string? currentAccountName = null)
    {
        var check = new Check(
            checkNumber,
            portfolioNumber,
            CheckType.CustomerCheck,
            MovementDirection.Inbound,
            registrationDate,
            dueDate,
            issueDate,
            amount,
            bankName,
            drawerName,
            amount.Currency);

        if (currentAccountId.HasValue)
            check.LinkToCurrentAccount(currentAccountId.Value, currentAccountName!);

        check.AddMovement(CheckMovementType.Received, registrationDate, "Çek alındı");

        return check;
    }

    /// <summary>
    /// Verilen çek oluştur (Create given check)
    /// </summary>
    public static Check CreateGivenCheck(
        string checkNumber,
        string portfolioNumber,
        DateTime registrationDate,
        DateTime dueDate,
        DateTime issueDate,
        Money amount,
        string bankName,
        string drawerName,
        int? currentAccountId = null,
        string? currentAccountName = null)
    {
        var check = new Check(
            checkNumber,
            portfolioNumber,
            CheckType.CompanyCheck,
            MovementDirection.Outbound,
            registrationDate,
            dueDate,
            issueDate,
            amount,
            bankName,
            drawerName,
            amount.Currency);

        if (currentAccountId.HasValue)
            check.LinkToCurrentAccount(currentAccountId.Value, currentAccountName!);

        check.AddMovement(CheckMovementType.Given, registrationDate, "Çek verildi");

        return check;
    }

    #endregion
}

/// <summary>
/// Çek Türleri (Check Types)
/// </summary>
public enum CheckType
{
    /// <summary>
    /// Müşteri Çeki (Customer Check)
    /// </summary>
    CustomerCheck = 1,

    /// <summary>
    /// Firma Çeki (Company Check)
    /// </summary>
    CompanyCheck = 2,

    /// <summary>
    /// Kefalet Çeki (Guarantee Check)
    /// </summary>
    GuaranteeCheck = 3,

    /// <summary>
    /// Banka Çeki (Bank Check)
    /// </summary>
    BankCheck = 4
}

/// <summary>
/// Çek Hareketi (Check Movement)
/// </summary>
public class CheckMovement : BaseEntity
{
    public int CheckId { get; private set; }
    public CheckMovementType MovementType { get; private set; }
    public DateTime MovementDate { get; private set; }
    public string Description { get; private set; } = string.Empty;

    public virtual Check Check { get; private set; } = null!;

    protected CheckMovement() { }

    public CheckMovement(int checkId, CheckMovementType movementType, DateTime movementDate, string description)
    {
        CheckId = checkId;
        MovementType = movementType;
        MovementDate = movementDate;
        Description = description;
    }
}

/// <summary>
/// Çek Hareket Türleri (Check Movement Types)
/// </summary>
public enum CheckMovementType
{
    Received = 1,           // Alındı
    Given = 2,              // Verildi
    GivenToBank = 3,        // Bankaya tahsile verildi
    ReturnedFromBank = 4,   // Bankadan geri alındı
    Endorsed = 5,           // Ciro edildi
    GivenAsCollateral = 6,  // Teminata verildi
    ReturnedFromCollateral = 7, // Teminattan geri alındı
    Collected = 8,          // Tahsil edildi
    Bounced = 9,            // Karşılıksız çıktı
    Protested = 10,         // Protesto edildi
    Returned = 11,          // İade edildi
    Cancelled = 12          // İptal edildi
}
