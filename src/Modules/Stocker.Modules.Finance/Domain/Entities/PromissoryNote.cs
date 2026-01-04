using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Senet (Promissory Note)
/// Alınan ve verilen senetleri yönetir
/// </summary>
public class PromissoryNote : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Senet Numarası (Note Number)
    /// </summary>
    public string NoteNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Portföy Numarası (Portfolio Number)
    /// </summary>
    public string PortfolioNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Seri Numarası (Serial Number)
    /// </summary>
    public string? SerialNumber { get; private set; }

    /// <summary>
    /// Senet Türü (Note Type)
    /// </summary>
    public PromissoryNoteType NoteType { get; private set; }

    /// <summary>
    /// Hareket Yönü (Direction)
    /// Inbound = Alınan Senet, Outbound = Verilen Senet
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
    /// Düzenleme Tarihi (Issue Date)
    /// </summary>
    public DateTime IssueDate { get; private set; }

    /// <summary>
    /// Düzenleme Yeri (Place of Issue)
    /// </summary>
    public string? IssuePlace { get; private set; }

    /// <summary>
    /// Tahsilat/Ödeme Tarihi (Collection/Payment Date)
    /// </summary>
    public DateTime? CollectionDate { get; private set; }

    #endregion

    #region Tutar Bilgileri (Amount Information)

    /// <summary>
    /// Senet Tutarı (Note Amount)
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

    #region Borçlu Bilgileri (Debtor Information)

    /// <summary>
    /// Borçlu Adı (Debtor Name)
    /// </summary>
    public string DebtorName { get; private set; } = string.Empty;

    /// <summary>
    /// Borçlu VKN/TCKN (Debtor Tax/ID Number)
    /// </summary>
    public string? DebtorTaxId { get; private set; }

    /// <summary>
    /// Borçlu Adresi (Debtor Address)
    /// </summary>
    public string? DebtorAddress { get; private set; }

    /// <summary>
    /// Borçlu Telefon (Debtor Phone)
    /// </summary>
    public string? DebtorPhone { get; private set; }

    #endregion

    #region Alacaklı Bilgileri (Creditor Information)

    /// <summary>
    /// Alacaklı Adı (Creditor Name)
    /// </summary>
    public string? CreditorName { get; private set; }

    /// <summary>
    /// Alacaklı VKN/TCKN (Creditor Tax/ID Number)
    /// </summary>
    public string? CreditorTaxId { get; private set; }

    #endregion

    #region Kefil Bilgileri (Guarantor Information)

    /// <summary>
    /// Kefil Adı (Guarantor Name)
    /// </summary>
    public string? GuarantorName { get; private set; }

    /// <summary>
    /// Kefil VKN/TCKN (Guarantor Tax/ID Number)
    /// </summary>
    public string? GuarantorTaxId { get; private set; }

    /// <summary>
    /// Kefil Adresi (Guarantor Address)
    /// </summary>
    public string? GuarantorAddress { get; private set; }

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
    /// Bankaya Tahsile/İskontoya Verildi mi? (Is Given to Bank)
    /// </summary>
    public bool IsGivenToBank { get; private set; }

    /// <summary>
    /// Tahsile Veren Banka Hesabı ID (Bank Account for Collection)
    /// </summary>
    public int? CollectionBankAccountId { get; private set; }

    /// <summary>
    /// Tahsile/İskontoya Verme Tarihi (Given to Bank Date)
    /// </summary>
    public DateTime? GivenToBankDate { get; private set; }

    /// <summary>
    /// İskonto Tutarı (Discount Amount)
    /// </summary>
    public Money? DiscountAmount { get; private set; }

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

    #region Protesto Bilgileri (Protest Information)

    /// <summary>
    /// Protestolu mu? (Is Protested)
    /// </summary>
    public bool IsProtested { get; private set; }

    /// <summary>
    /// Protesto Tarihi (Protest Date)
    /// </summary>
    public DateTime? ProtestDate { get; private set; }

    /// <summary>
    /// Protesto Nedeni (Protest Reason)
    /// </summary>
    public string? ProtestReason { get; private set; }

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
    public virtual ICollection<PromissoryNoteMovement> Movements { get; private set; } = new List<PromissoryNoteMovement>();

    #endregion

    protected PromissoryNote() { }

    public PromissoryNote(
        string noteNumber,
        string portfolioNumber,
        PromissoryNoteType noteType,
        MovementDirection direction,
        DateTime registrationDate,
        DateTime dueDate,
        DateTime issueDate,
        Money amount,
        string debtorName,
        string currency = "TRY")
    {
        NoteNumber = noteNumber;
        PortfolioNumber = portfolioNumber;
        NoteType = noteType;
        Direction = direction;
        RegistrationDate = registrationDate;
        DueDate = dueDate;
        IssueDate = issueDate;
        Amount = amount;
        Currency = currency;
        ExchangeRate = 1;
        AmountTRY = amount;
        DebtorName = debtorName;
        Status = NegotiableInstrumentStatus.InPortfolio;
        IsGivenToBank = false;
        IsEndorsed = false;
        IsGivenAsCollateral = false;
        IsProtested = false;
    }

    public void SetSerialNumber(string? serialNumber)
    {
        SerialNumber = serialNumber;
    }

    public void SetIssuePlace(string? issuePlace)
    {
        IssuePlace = issuePlace;
    }

    public void SetExchangeRate(decimal rate)
    {
        ExchangeRate = rate;
        AmountTRY = Money.Create(Amount.Amount * rate, "TRY");
    }

    public void SetDebtorInfo(string debtorName, string? taxId, string? address, string? phone)
    {
        DebtorName = debtorName;
        DebtorTaxId = taxId;
        DebtorAddress = address;
        DebtorPhone = phone;
    }

    public void SetCreditorInfo(string? creditorName, string? taxId)
    {
        CreditorName = creditorName;
        CreditorTaxId = taxId;
    }

    public void SetGuarantorInfo(string? guarantorName, string? taxId, string? address)
    {
        GuarantorName = guarantorName;
        GuarantorTaxId = taxId;
        GuarantorAddress = address;
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
            throw new InvalidOperationException("Only received notes can be given to bank");

        if (Status != NegotiableInstrumentStatus.InPortfolio)
            throw new InvalidOperationException("Note must be in portfolio to give to bank");

        IsGivenToBank = true;
        CollectionBankAccountId = bankAccountId;
        GivenToBankDate = date;
        Status = NegotiableInstrumentStatus.GivenToBank;

        AddMovement(PromissoryNoteMovementType.GivenToBank, date, "Bankaya tahsile verildi");
    }

    /// <summary>
    /// Bankaya iskontoya ver (Give to bank for discount)
    /// </summary>
    public void GiveToBankForDiscount(int bankAccountId, DateTime date, Money discountAmount)
    {
        if (Direction != MovementDirection.Inbound)
            throw new InvalidOperationException("Only received notes can be discounted");

        if (Status != NegotiableInstrumentStatus.InPortfolio)
            throw new InvalidOperationException("Note must be in portfolio to discount");

        IsGivenToBank = true;
        CollectionBankAccountId = bankAccountId;
        GivenToBankDate = date;
        DiscountAmount = discountAmount;
        Status = NegotiableInstrumentStatus.GivenToBank;

        AddMovement(PromissoryNoteMovementType.Discounted, date, $"İskontoya verildi, iskonto tutarı: {discountAmount}");
    }

    /// <summary>
    /// Bankadan geri al (Return from bank)
    /// </summary>
    public void ReturnFromBank(DateTime date)
    {
        if (Status != NegotiableInstrumentStatus.GivenToBank)
            throw new InvalidOperationException("Note must be given to bank to return");

        IsGivenToBank = false;
        DiscountAmount = null;
        Status = NegotiableInstrumentStatus.InPortfolio;

        AddMovement(PromissoryNoteMovementType.ReturnedFromBank, date, "Bankadan geri alındı");
    }

    /// <summary>
    /// Ciro et (Endorse)
    /// </summary>
    public void Endorse(int endorsedToCurrentAccountId, DateTime date)
    {
        if (Direction != MovementDirection.Inbound)
            throw new InvalidOperationException("Only received notes can be endorsed");

        if (Status != NegotiableInstrumentStatus.InPortfolio)
            throw new InvalidOperationException("Note must be in portfolio to endorse");

        IsEndorsed = true;
        EndorsedToCurrentAccountId = endorsedToCurrentAccountId;
        EndorsementDate = date;
        Status = NegotiableInstrumentStatus.Endorsed;

        AddMovement(PromissoryNoteMovementType.Endorsed, date, "Ciro edildi");
    }

    /// <summary>
    /// Teminata ver (Give as collateral)
    /// </summary>
    public void GiveAsCollateral(string collateralGivenTo, DateTime date)
    {
        if (Direction != MovementDirection.Inbound)
            throw new InvalidOperationException("Only received notes can be given as collateral");

        if (Status != NegotiableInstrumentStatus.InPortfolio)
            throw new InvalidOperationException("Note must be in portfolio to give as collateral");

        IsGivenAsCollateral = true;
        CollateralGivenTo = collateralGivenTo;
        CollateralDate = date;
        Status = NegotiableInstrumentStatus.GivenAsCollateral;

        AddMovement(PromissoryNoteMovementType.GivenAsCollateral, date, $"Teminata verildi: {collateralGivenTo}");
    }

    /// <summary>
    /// Tahsil et (Collect)
    /// </summary>
    public void Collect(DateTime date)
    {
        if (Status != NegotiableInstrumentStatus.InPortfolio && Status != NegotiableInstrumentStatus.GivenToBank)
            throw new InvalidOperationException("Note must be in portfolio or given to bank to collect");

        CollectionDate = date;
        Status = NegotiableInstrumentStatus.Collected;

        AddMovement(PromissoryNoteMovementType.Collected, date, "Tahsil edildi");
    }

    /// <summary>
    /// Protesto et (Protest)
    /// </summary>
    public void Protest(DateTime date, string reason)
    {
        IsProtested = true;
        ProtestDate = date;
        ProtestReason = reason;
        Status = NegotiableInstrumentStatus.Protested;

        AddMovement(PromissoryNoteMovementType.Protested, date, $"Protesto edildi: {reason}");
    }

    /// <summary>
    /// İade et (Return)
    /// </summary>
    public void Return(DateTime date, string reason)
    {
        Status = NegotiableInstrumentStatus.Returned;

        AddMovement(PromissoryNoteMovementType.Returned, date, $"İade edildi: {reason}");
    }

    /// <summary>
    /// İptal et (Cancel)
    /// </summary>
    public void Cancel(DateTime date, string reason)
    {
        if (Status != NegotiableInstrumentStatus.InPortfolio)
            throw new InvalidOperationException("Sadece portföydeki senetler iptal edilebilir");

        Status = NegotiableInstrumentStatus.Returned;
        Notes = string.IsNullOrEmpty(Notes)
            ? $"İptal edildi: {reason}"
            : $"{Notes}\nİptal edildi: {reason}";

        AddMovement(PromissoryNoteMovementType.Returned, date, $"İptal edildi: {reason}");
    }

    private void AddMovement(PromissoryNoteMovementType movementType, DateTime date, string description)
    {
        var movement = new PromissoryNoteMovement(Id, movementType, date, description);
        Movements.Add(movement);
    }

    #endregion

    #region Factory Methods

    /// <summary>
    /// Alınan senet oluştur (Create received note)
    /// </summary>
    public static PromissoryNote CreateReceivedNote(
        string noteNumber,
        string portfolioNumber,
        DateTime registrationDate,
        DateTime dueDate,
        DateTime issueDate,
        Money amount,
        string debtorName,
        int? currentAccountId = null,
        string? currentAccountName = null)
    {
        var note = new PromissoryNote(
            noteNumber,
            portfolioNumber,
            PromissoryNoteType.CustomerNote,
            MovementDirection.Inbound,
            registrationDate,
            dueDate,
            issueDate,
            amount,
            debtorName,
            amount.Currency);

        if (currentAccountId.HasValue)
            note.LinkToCurrentAccount(currentAccountId.Value, currentAccountName!);

        note.AddMovement(PromissoryNoteMovementType.Received, registrationDate, "Senet alındı");

        return note;
    }

    /// <summary>
    /// Verilen senet oluştur (Create given note)
    /// </summary>
    public static PromissoryNote CreateGivenNote(
        string noteNumber,
        string portfolioNumber,
        DateTime registrationDate,
        DateTime dueDate,
        DateTime issueDate,
        Money amount,
        string debtorName,
        int? currentAccountId = null,
        string? currentAccountName = null)
    {
        var note = new PromissoryNote(
            noteNumber,
            portfolioNumber,
            PromissoryNoteType.CompanyNote,
            MovementDirection.Outbound,
            registrationDate,
            dueDate,
            issueDate,
            amount,
            debtorName,
            amount.Currency);

        if (currentAccountId.HasValue)
            note.LinkToCurrentAccount(currentAccountId.Value, currentAccountName!);

        note.AddMovement(PromissoryNoteMovementType.Given, registrationDate, "Senet verildi");

        return note;
    }

    #endregion
}

/// <summary>
/// Senet Türleri (Promissory Note Types)
/// </summary>
public enum PromissoryNoteType
{
    /// <summary>
    /// Müşteri Senedi (Customer Note)
    /// </summary>
    CustomerNote = 1,

    /// <summary>
    /// Firma Senedi (Company Note)
    /// </summary>
    CompanyNote = 2,

    /// <summary>
    /// Kefalet Senedi (Guarantee Note)
    /// </summary>
    GuaranteeNote = 3
}

/// <summary>
/// Senet Hareketi (Promissory Note Movement)
/// </summary>
public class PromissoryNoteMovement : BaseEntity
{
    public int PromissoryNoteId { get; private set; }
    public PromissoryNoteMovementType MovementType { get; private set; }
    public DateTime MovementDate { get; private set; }
    public string Description { get; private set; } = string.Empty;

    public virtual PromissoryNote PromissoryNote { get; private set; } = null!;

    protected PromissoryNoteMovement() { }

    public PromissoryNoteMovement(int promissoryNoteId, PromissoryNoteMovementType movementType, DateTime movementDate, string description)
    {
        PromissoryNoteId = promissoryNoteId;
        MovementType = movementType;
        MovementDate = movementDate;
        Description = description;
    }
}

/// <summary>
/// Senet Hareket Türleri (Promissory Note Movement Types)
/// </summary>
public enum PromissoryNoteMovementType
{
    Received = 1,           // Alındı
    Given = 2,              // Verildi
    GivenToBank = 3,        // Bankaya tahsile verildi
    Discounted = 4,         // İskontoya verildi
    ReturnedFromBank = 5,   // Bankadan geri alındı
    Endorsed = 6,           // Ciro edildi
    GivenAsCollateral = 7,  // Teminata verildi
    ReturnedFromCollateral = 8, // Teminattan geri alındı
    Collected = 9,          // Tahsil edildi
    Protested = 10,         // Protesto edildi
    Returned = 11,          // İade edildi
    Cancelled = 12          // İptal edildi
}
