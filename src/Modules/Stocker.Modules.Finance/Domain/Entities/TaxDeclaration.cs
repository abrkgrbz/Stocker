using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Vergi Beyannamesi entity'si - KDV, Muhtasar, Geçici Vergi vb. beyannamelerin takibi
/// Tax Declaration entity - Tracking of VAT, Withholding, Provisional Tax declarations etc.
/// </summary>
public class TaxDeclaration : BaseEntity
{
    /// <summary>
    /// Beyanname numarası / Declaration number
    /// </summary>
    public string DeclarationNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Beyanname türü / Declaration type
    /// </summary>
    public TaxDeclarationType DeclarationType { get; private set; }

    /// <summary>
    /// Vergi dönemi yılı / Tax period year
    /// </summary>
    public int TaxYear { get; private set; }

    /// <summary>
    /// Vergi dönemi ayı (KDV için) / Tax period month (for VAT)
    /// </summary>
    public int? TaxMonth { get; private set; }

    /// <summary>
    /// Vergi dönemi çeyreği (Geçici vergi için) / Tax period quarter
    /// </summary>
    public int? TaxQuarter { get; private set; }

    /// <summary>
    /// Dönem başlangıcı / Period start
    /// </summary>
    public DateTime PeriodStart { get; private set; }

    /// <summary>
    /// Dönem sonu / Period end
    /// </summary>
    public DateTime PeriodEnd { get; private set; }

    /// <summary>
    /// Son beyanname verme tarihi / Filing deadline
    /// </summary>
    public DateTime FilingDeadline { get; private set; }

    /// <summary>
    /// Son ödeme tarihi / Payment deadline
    /// </summary>
    public DateTime PaymentDeadline { get; private set; }

    /// <summary>
    /// Matrah / Tax base
    /// </summary>
    public Money TaxBase { get; private set; } = null!;

    /// <summary>
    /// Hesaplanan vergi / Calculated tax
    /// </summary>
    public Money CalculatedTax { get; private set; } = null!;

    /// <summary>
    /// İndirilecek vergi (KDV için) / Deductible tax (for VAT)
    /// </summary>
    public Money? DeductibleTax { get; private set; }

    /// <summary>
    /// Devreden KDV (KDV için) / Carried forward VAT
    /// </summary>
    public Money? CarriedForwardTax { get; private set; }

    /// <summary>
    /// Önceki dönemden devreden / Brought forward from previous period
    /// </summary>
    public Money? BroughtForwardTax { get; private set; }

    /// <summary>
    /// Tecil edilen vergi / Deferred tax
    /// </summary>
    public Money? DeferredTax { get; private set; }

    /// <summary>
    /// Ödenecek/İade alınacak vergi / Tax payable/refundable
    /// </summary>
    public Money NetTax { get; private set; } = null!;

    /// <summary>
    /// Ödenen tutar / Paid amount
    /// </summary>
    public Money PaidAmount { get; private set; } = null!;

    /// <summary>
    /// Kalan bakiye / Remaining balance
    /// </summary>
    public Money RemainingBalance { get; private set; } = null!;

    /// <summary>
    /// Gecikme faizi / Late interest
    /// </summary>
    public Money? LateInterest { get; private set; }

    /// <summary>
    /// Gecikme zammı / Penalty
    /// </summary>
    public Money? LatePenalty { get; private set; }

    /// <summary>
    /// Beyanname durumu / Declaration status
    /// </summary>
    public TaxDeclarationStatus Status { get; private set; }

    /// <summary>
    /// Beyanname verme tarihi / Filing date
    /// </summary>
    public DateTime? FilingDate { get; private set; }

    /// <summary>
    /// GİB onay numarası / GIB approval number
    /// </summary>
    public string? GibApprovalNumber { get; private set; }

    /// <summary>
    /// Düzeltme beyannamesi mi? / Is amendment?
    /// </summary>
    public bool IsAmendment { get; private set; }

    /// <summary>
    /// Düzeltilen beyanname ID / Amended declaration ID
    /// </summary>
    public int? AmendedDeclarationId { get; private set; }

    /// <summary>
    /// Düzeltme sıra numarası / Amendment sequence number
    /// </summary>
    public int AmendmentSequence { get; private set; }

    /// <summary>
    /// Düzeltme nedeni / Amendment reason
    /// </summary>
    public string? AmendmentReason { get; private set; }

    /// <summary>
    /// Vergi dairesi kodu / Tax office code
    /// </summary>
    public string? TaxOfficeCode { get; private set; }

    /// <summary>
    /// Vergi dairesi adı / Tax office name
    /// </summary>
    public string? TaxOfficeName { get; private set; }

    /// <summary>
    /// Tahakkuk fişi numarası / Accrual slip number
    /// </summary>
    public string? AccrualSlipNumber { get; private set; }

    /// <summary>
    /// Hazırlayan / Prepared by
    /// </summary>
    public string? PreparedBy { get; private set; }

    /// <summary>
    /// Hazırlanma tarihi / Preparation date
    /// </summary>
    public DateTime? PreparationDate { get; private set; }

    /// <summary>
    /// Onaylayan / Approved by
    /// </summary>
    public string? ApprovedBy { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Muhasebe hesabı ID / Accounting account ID
    /// </summary>
    public int? AccountId { get; private set; }

    /// <summary>
    /// İlişkili muhasebe dönemi ID / Related accounting period ID
    /// </summary>
    public int? AccountingPeriodId { get; private set; }

    // Navigation properties
    public virtual ICollection<TaxDeclarationDetail> Details { get; private set; } = new List<TaxDeclarationDetail>();
    public virtual ICollection<TaxDeclarationPayment> Payments { get; private set; } = new List<TaxDeclarationPayment>();
    public virtual TaxDeclaration? AmendedDeclaration { get; private set; }
    public virtual ICollection<TaxDeclaration> Amendments { get; private set; } = new List<TaxDeclaration>();

    private TaxDeclaration() { }

    /// <summary>
    /// KDV beyannamesi oluşturur / Creates VAT declaration
    /// </summary>
    public static TaxDeclaration CreateVatDeclaration(
        string declarationNumber,
        int year,
        int month,
        Money taxBase,
        Money outputVat,
        Money inputVat,
        Money? broughtForward = null)
    {
        var periodStart = new DateTime(year, month, 1);
        var periodEnd = periodStart.AddMonths(1).AddDays(-1);

        var declaration = new TaxDeclaration
        {
            DeclarationNumber = declarationNumber,
            DeclarationType = TaxDeclarationType.Kdv,
            TaxYear = year,
            TaxMonth = month,
            PeriodStart = periodStart,
            PeriodEnd = periodEnd,
            FilingDeadline = new DateTime(year, month, 1).AddMonths(1).AddDays(25), // Takip eden ayın 26'sı
            PaymentDeadline = new DateTime(year, month, 1).AddMonths(1).AddDays(25),
            TaxBase = taxBase,
            CalculatedTax = outputVat,
            DeductibleTax = inputVat,
            BroughtForwardTax = broughtForward ?? Money.Zero(taxBase.Currency),
            Status = TaxDeclarationStatus.Draft
        };

        declaration.CalculateNetVat();
        return declaration;
    }

    /// <summary>
    /// Muhtasar beyannamesi oluşturur / Creates withholding tax declaration
    /// </summary>
    public static TaxDeclaration CreateWithholdingDeclaration(
        string declarationNumber,
        int year,
        int month,
        Money taxBase,
        Money withholdingTax)
    {
        var periodStart = new DateTime(year, month, 1);
        var periodEnd = periodStart.AddMonths(1).AddDays(-1);

        return new TaxDeclaration
        {
            DeclarationNumber = declarationNumber,
            DeclarationType = TaxDeclarationType.Muhtasar,
            TaxYear = year,
            TaxMonth = month,
            PeriodStart = periodStart,
            PeriodEnd = periodEnd,
            FilingDeadline = new DateTime(year, month, 1).AddMonths(1).AddDays(25),
            PaymentDeadline = new DateTime(year, month, 1).AddMonths(1).AddDays(25),
            TaxBase = taxBase,
            CalculatedTax = withholdingTax,
            NetTax = withholdingTax,
            PaidAmount = Money.Zero(taxBase.Currency),
            RemainingBalance = withholdingTax,
            Status = TaxDeclarationStatus.Draft
        };
    }

    /// <summary>
    /// Geçici vergi beyannamesi oluşturur / Creates provisional tax declaration
    /// </summary>
    public static TaxDeclaration CreateProvisionalTaxDeclaration(
        string declarationNumber,
        int year,
        int quarter,
        Money taxableIncome,
        Money provisionalTax,
        Money? previousPeriodPaid = null)
    {
        var periodStart = new DateTime(year, (quarter - 1) * 3 + 1, 1);
        var periodEnd = new DateTime(year, quarter * 3, 1).AddMonths(1).AddDays(-1);

        // Geçici vergi son beyan tarihleri: 1. dönem 17 Mayıs, 2. dönem 17 Ağustos, 3. dönem 17 Kasım, 4. dönem 17 Şubat
        var deadlineMonth = quarter switch
        {
            1 => 5,
            2 => 8,
            3 => 11,
            4 => 2,
            _ => 5
        };
        var deadlineYear = quarter == 4 ? year + 1 : year;

        var netTax = previousPeriodPaid != null
            ? provisionalTax.Subtract(previousPeriodPaid)
            : provisionalTax;

        return new TaxDeclaration
        {
            DeclarationNumber = declarationNumber,
            DeclarationType = TaxDeclarationType.GeciciVergi,
            TaxYear = year,
            TaxQuarter = quarter,
            PeriodStart = periodStart,
            PeriodEnd = periodEnd,
            FilingDeadline = new DateTime(deadlineYear, deadlineMonth, 17),
            PaymentDeadline = new DateTime(deadlineYear, deadlineMonth, 17),
            TaxBase = taxableIncome,
            CalculatedTax = provisionalTax,
            DeferredTax = previousPeriodPaid,
            NetTax = netTax,
            PaidAmount = Money.Zero(taxableIncome.Currency),
            RemainingBalance = netTax,
            Status = TaxDeclarationStatus.Draft
        };
    }

    /// <summary>
    /// Kurumlar vergisi beyannamesi oluşturur / Creates corporate tax declaration
    /// </summary>
    public static TaxDeclaration CreateCorporateTaxDeclaration(
        string declarationNumber,
        int year,
        Money taxableIncome,
        Money corporateTax,
        Money? provisionalTaxPaid = null)
    {
        var periodStart = new DateTime(year, 1, 1);
        var periodEnd = new DateTime(year, 12, 31);

        var netTax = provisionalTaxPaid != null
            ? corporateTax.Subtract(provisionalTaxPaid)
            : corporateTax;

        return new TaxDeclaration
        {
            DeclarationNumber = declarationNumber,
            DeclarationType = TaxDeclarationType.KurumlarVergisi,
            TaxYear = year,
            PeriodStart = periodStart,
            PeriodEnd = periodEnd,
            FilingDeadline = new DateTime(year + 1, 4, 30), // Takip eden yılın Nisan ayı sonu
            PaymentDeadline = new DateTime(year + 1, 4, 30),
            TaxBase = taxableIncome,
            CalculatedTax = corporateTax,
            DeferredTax = provisionalTaxPaid,
            NetTax = netTax,
            PaidAmount = Money.Zero(taxableIncome.Currency),
            RemainingBalance = netTax,
            Status = TaxDeclarationStatus.Draft
        };
    }

    /// <summary>
    /// Damga vergisi beyannamesi oluşturur / Creates stamp duty declaration
    /// </summary>
    public static TaxDeclaration CreateStampDutyDeclaration(
        string declarationNumber,
        int year,
        int month,
        Money stampDutyBase,
        Money stampDutyAmount)
    {
        var periodStart = new DateTime(year, month, 1);
        var periodEnd = periodStart.AddMonths(1).AddDays(-1);

        return new TaxDeclaration
        {
            DeclarationNumber = declarationNumber,
            DeclarationType = TaxDeclarationType.DamgaVergisi,
            TaxYear = year,
            TaxMonth = month,
            PeriodStart = periodStart,
            PeriodEnd = periodEnd,
            FilingDeadline = new DateTime(year, month, 1).AddMonths(1).AddDays(22), // Takip eden ayın 23'ü
            PaymentDeadline = new DateTime(year, month, 1).AddMonths(1).AddDays(25),
            TaxBase = stampDutyBase,
            CalculatedTax = stampDutyAmount,
            NetTax = stampDutyAmount,
            PaidAmount = Money.Zero(stampDutyBase.Currency),
            RemainingBalance = stampDutyAmount,
            Status = TaxDeclarationStatus.Draft
        };
    }

    /// <summary>
    /// KDV net tutarını hesaplar / Calculates net VAT amount
    /// </summary>
    private void CalculateNetVat()
    {
        var currency = TaxBase.Currency;
        PaidAmount = Money.Zero(currency);

        var outputVat = CalculatedTax?.Amount ?? 0;
        var inputVat = DeductibleTax?.Amount ?? 0;
        var broughtForward = BroughtForwardTax?.Amount ?? 0;

        var netAmount = outputVat - inputVat - broughtForward;

        if (netAmount >= 0)
        {
            // Ödenecek KDV
            NetTax = Money.Create(netAmount, currency);
            CarriedForwardTax = Money.Zero(currency);
        }
        else
        {
            // Devreden KDV
            NetTax = Money.Zero(currency);
            CarriedForwardTax = Money.Create(Math.Abs(netAmount), currency);
        }

        RemainingBalance = NetTax;
    }

    /// <summary>
    /// Beyanname detayı ekler / Adds declaration detail
    /// </summary>
    public TaxDeclarationDetail AddDetail(
        string code,
        string description,
        Money amount,
        decimal? rate = null,
        Money? taxAmount = null)
    {
        var detail = TaxDeclarationDetail.Create(this, code, description, amount, rate, taxAmount);
        Details.Add(detail);
        return detail;
    }

    /// <summary>
    /// Ödeme kaydeder / Records a payment
    /// </summary>
    public TaxDeclarationPayment RecordPayment(
        DateTime paymentDate,
        Money amount,
        TaxPaymentMethod paymentMethod,
        string? receiptNumber = null)
    {
        if (Status == TaxDeclarationStatus.Draft)
            throw new InvalidOperationException("Taslak beyannameye ödeme yapılamaz");

        var payment = TaxDeclarationPayment.Create(this, paymentDate, amount, paymentMethod, receiptNumber);
        Payments.Add(payment);

        PaidAmount = PaidAmount.Add(amount);
        RemainingBalance = NetTax.Subtract(PaidAmount);

        if (RemainingBalance.Amount <= 0)
        {
            Status = TaxDeclarationStatus.Paid;
        }

        return payment;
    }

    /// <summary>
    /// Beyannameyi hazır olarak işaretler / Marks declaration as ready
    /// </summary>
    public void MarkAsReady(string preparedBy)
    {
        if (Status != TaxDeclarationStatus.Draft)
            throw new InvalidOperationException("Sadece taslak beyannameler hazır olarak işaretlenebilir");

        PreparedBy = preparedBy;
        PreparationDate = DateTime.UtcNow;
        Status = TaxDeclarationStatus.Ready;
    }

    /// <summary>
    /// Beyannameyi onaylar / Approves the declaration
    /// </summary>
    public void Approve(string approvedBy)
    {
        if (Status != TaxDeclarationStatus.Ready)
            throw new InvalidOperationException("Sadece hazır beyannameler onaylanabilir");

        ApprovedBy = approvedBy;
        ApprovalDate = DateTime.UtcNow;
        Status = TaxDeclarationStatus.Approved;
    }

    /// <summary>
    /// Beyannameyi gönderir / Files the declaration
    /// </summary>
    public void File(DateTime filingDate, string? gibApprovalNumber = null)
    {
        if (Status != TaxDeclarationStatus.Approved)
            throw new InvalidOperationException("Sadece onaylı beyannameler gönderilebilir");

        FilingDate = filingDate;
        GibApprovalNumber = gibApprovalNumber;
        Status = TaxDeclarationStatus.Filed;
    }

    /// <summary>
    /// Düzeltme beyannamesi oluşturur / Creates amendment declaration
    /// </summary>
    public TaxDeclaration CreateAmendment(string declarationNumber, string amendmentReason)
    {
        if (Status != TaxDeclarationStatus.Filed && Status != TaxDeclarationStatus.Paid)
            throw new InvalidOperationException("Sadece verilmiş beyannameler düzeltilebilir");

        var amendment = new TaxDeclaration
        {
            DeclarationNumber = declarationNumber,
            DeclarationType = DeclarationType,
            TaxYear = TaxYear,
            TaxMonth = TaxMonth,
            TaxQuarter = TaxQuarter,
            PeriodStart = PeriodStart,
            PeriodEnd = PeriodEnd,
            FilingDeadline = FilingDeadline,
            PaymentDeadline = PaymentDeadline,
            TaxBase = TaxBase,
            CalculatedTax = CalculatedTax,
            DeductibleTax = DeductibleTax,
            CarriedForwardTax = CarriedForwardTax,
            BroughtForwardTax = BroughtForwardTax,
            DeferredTax = DeferredTax,
            NetTax = NetTax,
            PaidAmount = Money.Zero(TaxBase.Currency),
            RemainingBalance = NetTax,
            TaxOfficeCode = TaxOfficeCode,
            TaxOfficeName = TaxOfficeName,
            IsAmendment = true,
            AmendedDeclarationId = Id,
            AmendmentSequence = AmendmentSequence + 1,
            AmendmentReason = amendmentReason,
            Status = TaxDeclarationStatus.Draft
        };

        return amendment;
    }

    /// <summary>
    /// Gecikme faizi hesaplar / Calculates late interest
    /// </summary>
    public void CalculateLateInterest(DateTime calculationDate, decimal monthlyInterestRate)
    {
        if (calculationDate <= PaymentDeadline)
        {
            LateInterest = Money.Zero(NetTax.Currency);
            return;
        }

        var daysPastDue = (calculationDate - PaymentDeadline).Days;
        var monthsPastDue = Math.Ceiling(daysPastDue / 30.0);

        var interestAmount = RemainingBalance.Amount * (monthlyInterestRate / 100) * (decimal)monthsPastDue;
        LateInterest = Money.Create(interestAmount, NetTax.Currency);
    }

    /// <summary>
    /// İptal eder / Cancels the declaration
    /// </summary>
    public void Cancel(string reason)
    {
        if (Status == TaxDeclarationStatus.Paid)
            throw new InvalidOperationException("Ödenmiş beyanname iptal edilemez");

        Notes = $"İptal nedeni: {reason}. Önceki not: {Notes}";
        Status = TaxDeclarationStatus.Cancelled;
    }

    // Setter methods
    public void SetTaxOffice(string code, string name)
    {
        TaxOfficeCode = code;
        TaxOfficeName = name;
    }
    public void SetAccrualSlipNumber(string? slipNumber) => AccrualSlipNumber = slipNumber;
    public void SetAccountId(int? accountId) => AccountId = accountId;
    public void SetAccountingPeriodId(int? periodId) => AccountingPeriodId = periodId;
    public void SetNotes(string? notes) => Notes = notes;
    public void UpdateTaxAmounts(Money taxBase, Money calculatedTax, Money? deductibleTax = null)
    {
        if (Status != TaxDeclarationStatus.Draft)
            throw new InvalidOperationException("Sadece taslak beyannamelerin tutarları güncellenebilir");

        TaxBase = taxBase;
        CalculatedTax = calculatedTax;
        DeductibleTax = deductibleTax;

        if (DeclarationType == TaxDeclarationType.Kdv)
        {
            CalculateNetVat();
        }
        else
        {
            NetTax = CalculatedTax;
            RemainingBalance = NetTax;
        }
    }
    public void SetBroughtForwardTax(Money? amount)
    {
        BroughtForwardTax = amount;
        if (DeclarationType == TaxDeclarationType.Kdv)
        {
            CalculateNetVat();
        }
    }
}

/// <summary>
/// Beyanname detay kalemi / Declaration detail item
/// </summary>
public class TaxDeclarationDetail : BaseEntity
{
    /// <summary>
    /// Beyanname ID / Declaration ID
    /// </summary>
    public int TaxDeclarationId { get; private set; }

    /// <summary>
    /// Satır kodu / Line code
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// Tutar / Amount
    /// </summary>
    public Money Amount { get; private set; } = null!;

    /// <summary>
    /// Oran (%) / Rate (%)
    /// </summary>
    public decimal? Rate { get; private set; }

    /// <summary>
    /// Vergi tutarı / Tax amount
    /// </summary>
    public Money? TaxAmount { get; private set; }

    /// <summary>
    /// Sıra numarası / Sequence number
    /// </summary>
    public int SequenceNumber { get; private set; }

    // Navigation
    public virtual TaxDeclaration TaxDeclaration { get; private set; } = null!;

    private TaxDeclarationDetail() { }

    public static TaxDeclarationDetail Create(
        TaxDeclaration declaration,
        string code,
        string description,
        Money amount,
        decimal? rate = null,
        Money? taxAmount = null)
    {
        var nextSequence = declaration.Details.Any()
            ? declaration.Details.Max(d => d.SequenceNumber) + 1
            : 1;

        return new TaxDeclarationDetail
        {
            TaxDeclarationId = declaration.Id,
            TaxDeclaration = declaration,
            Code = code,
            Description = description,
            Amount = amount,
            Rate = rate,
            TaxAmount = taxAmount,
            SequenceNumber = nextSequence
        };
    }

    public void Update(string description, Money amount, decimal? rate, Money? taxAmount)
    {
        Description = description;
        Amount = amount;
        Rate = rate;
        TaxAmount = taxAmount;
    }
}

/// <summary>
/// Beyanname ödemesi / Declaration payment
/// </summary>
public class TaxDeclarationPayment : BaseEntity
{
    /// <summary>
    /// Beyanname ID / Declaration ID
    /// </summary>
    public int TaxDeclarationId { get; private set; }

    /// <summary>
    /// Ödeme tarihi / Payment date
    /// </summary>
    public DateTime PaymentDate { get; private set; }

    /// <summary>
    /// Ödeme tutarı / Payment amount
    /// </summary>
    public Money Amount { get; private set; } = null!;

    /// <summary>
    /// Ödeme yöntemi / Payment method
    /// </summary>
    public TaxPaymentMethod PaymentMethod { get; private set; }

    /// <summary>
    /// Makbuz/dekont numarası / Receipt number
    /// </summary>
    public string? ReceiptNumber { get; private set; }

    /// <summary>
    /// Banka işlemi ID / Bank transaction ID
    /// </summary>
    public int? BankTransactionId { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    // Navigation
    public virtual TaxDeclaration TaxDeclaration { get; private set; } = null!;

    private TaxDeclarationPayment() { }

    public static TaxDeclarationPayment Create(
        TaxDeclaration declaration,
        DateTime paymentDate,
        Money amount,
        TaxPaymentMethod paymentMethod,
        string? receiptNumber = null)
    {
        return new TaxDeclarationPayment
        {
            TaxDeclarationId = declaration.Id,
            TaxDeclaration = declaration,
            PaymentDate = paymentDate,
            Amount = amount,
            PaymentMethod = paymentMethod,
            ReceiptNumber = receiptNumber
        };
    }

    public void SetBankTransaction(int transactionId) => BankTransactionId = transactionId;
    public void SetNotes(string? notes) => Notes = notes;
}

#region Enums

/// <summary>
/// Vergi beyannamesi türü / Tax declaration type
/// </summary>
public enum TaxDeclarationType
{
    /// <summary>KDV Beyannamesi / VAT Declaration</summary>
    Kdv = 1,

    /// <summary>KDV2 Beyannamesi (Sorumlu Sıfatıyla) / VAT2 Declaration (as Withholding Agent)</summary>
    Kdv2 = 2,

    /// <summary>Muhtasar Beyannamesi / Withholding Tax Declaration</summary>
    Muhtasar = 3,

    /// <summary>Muhtasar ve Prim Hizmet Beyannamesi / Withholding and Premium Service Declaration</summary>
    MuhtasarPrimHizmet = 4,

    /// <summary>Geçici Vergi Beyannamesi / Provisional Tax Declaration</summary>
    GeciciVergi = 5,

    /// <summary>Kurumlar Vergisi Beyannamesi / Corporate Tax Declaration</summary>
    KurumlarVergisi = 6,

    /// <summary>Gelir Vergisi Beyannamesi / Income Tax Declaration</summary>
    GelirVergisi = 7,

    /// <summary>Damga Vergisi Beyannamesi / Stamp Duty Declaration</summary>
    DamgaVergisi = 8,

    /// <summary>ÖTV Beyannamesi / Special Consumption Tax Declaration</summary>
    Otv = 9,

    /// <summary>Veraset ve İntikal Vergisi / Inheritance and Transfer Tax</summary>
    VerasetIntikal = 10,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

/// <summary>
/// Beyanname durumu / Declaration status
/// </summary>
public enum TaxDeclarationStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 0,

    /// <summary>Hazır / Ready</summary>
    Ready = 1,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 2,

    /// <summary>Verildi / Filed</summary>
    Filed = 3,

    /// <summary>Ödendi / Paid</summary>
    Paid = 4,

    /// <summary>Kısmen Ödendi / Partially Paid</summary>
    PartiallyPaid = 5,

    /// <summary>Gecikmiş / Overdue</summary>
    Overdue = 6,

    /// <summary>İptal Edildi / Cancelled</summary>
    Cancelled = 7
}

/// <summary>
/// Vergi ödeme yöntemi / Tax payment method
/// </summary>
public enum TaxPaymentMethod
{
    /// <summary>İnternet Bankacılığı / Internet Banking</summary>
    InternetBanking = 1,

    /// <summary>Banka Şubesi / Bank Branch</summary>
    BankBranch = 2,

    /// <summary>Vergi Dairesi / Tax Office</summary>
    TaxOffice = 3,

    /// <summary>Kredi Kartı / Credit Card</summary>
    CreditCard = 4,

    /// <summary>PTT / Postal Service</summary>
    Ptt = 5,

    /// <summary>Otomatik Ödeme / Automatic Payment</summary>
    AutomaticPayment = 6,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

#endregion
