using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Kur Farkı Kaydı entity'si - Dövizli işlemlerden kaynaklanan kur farkı kayıtları
/// Exchange Rate Adjustment entity - Exchange rate differences from foreign currency transactions
/// Türkiye'de yasal zorunluluk: Dönem sonu ve işlem tarihi kurları arasındaki farkların muhasebeleştirilmesi
/// Legal requirement in Turkey: Recording differences between period-end and transaction date exchange rates
/// </summary>
public class ExchangeRateAdjustment : BaseEntity
{
    /// <summary>
    /// Kayıt numarası / Record number
    /// </summary>
    public string AdjustmentNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Değerleme tarihi / Valuation date
    /// </summary>
    public DateTime ValuationDate { get; private set; }

    /// <summary>
    /// Değerleme türü / Valuation type
    /// </summary>
    public ExchangeRateValuationType ValuationType { get; private set; }

    /// <summary>
    /// İlişkili muhasebe dönemi ID / Related accounting period ID
    /// </summary>
    public int? AccountingPeriodId { get; private set; }

    /// <summary>
    /// Kaynak döviz kodu / Source currency code
    /// </summary>
    public string SourceCurrency { get; private set; } = string.Empty;

    /// <summary>
    /// Hedef döviz kodu (genellikle TRY) / Target currency code (usually TRY)
    /// </summary>
    public string TargetCurrency { get; private set; } = "TRY";

    /// <summary>
    /// Orijinal kur / Original exchange rate
    /// </summary>
    public decimal OriginalRate { get; private set; }

    /// <summary>
    /// Değerleme kuru / Valuation exchange rate
    /// </summary>
    public decimal ValuationRate { get; private set; }

    /// <summary>
    /// Kur değişimi (%) / Rate change (%)
    /// </summary>
    public decimal RateChangePercentage { get; private set; }

    /// <summary>
    /// Kaynak döviz tutarı / Source currency amount
    /// </summary>
    public Money SourceAmount { get; private set; } = null!;

    /// <summary>
    /// Orijinal kurla hesaplanan tutar / Amount at original rate
    /// </summary>
    public Money OriginalValueInTargetCurrency { get; private set; } = null!;

    /// <summary>
    /// Değerleme kuruyla hesaplanan tutar / Amount at valuation rate
    /// </summary>
    public Money CurrentValueInTargetCurrency { get; private set; } = null!;

    /// <summary>
    /// Kur farkı tutarı (pozitif: kâr, negatif: zarar) / Exchange difference (positive: gain, negative: loss)
    /// </summary>
    public Money ExchangeDifference { get; private set; } = null!;

    /// <summary>
    /// Kur farkı yönü / Exchange difference direction
    /// </summary>
    public ExchangeDifferenceDirection Direction { get; private set; }

    /// <summary>
    /// Kaynak varlık türü / Source asset type
    /// </summary>
    public ExchangeRateSourceType SourceType { get; private set; }

    /// <summary>
    /// Kaynak varlık ID / Source asset ID
    /// </summary>
    public int? SourceEntityId { get; private set; }

    /// <summary>
    /// Kaynak referans (hesap no, fatura no vb.) / Source reference
    /// </summary>
    public string? SourceReference { get; private set; }

    /// <summary>
    /// Kaynak açıklaması / Source description
    /// </summary>
    public string? SourceDescription { get; private set; }

    /// <summary>
    /// İlişkili cari hesap ID / Related current account ID
    /// </summary>
    public int? CurrentAccountId { get; private set; }

    /// <summary>
    /// İlişkili banka hesabı ID / Related bank account ID
    /// </summary>
    public int? BankAccountId { get; private set; }

    /// <summary>
    /// Kayıt durumu / Record status
    /// </summary>
    public ExchangeRateAdjustmentStatus Status { get; private set; }

    /// <summary>
    /// Muhasebeleştirildi mi? / Is journalized?
    /// </summary>
    public bool IsJournalized { get; private set; }

    /// <summary>
    /// Muhasebe kaydı ID / Journal entry ID
    /// </summary>
    public int? JournalEntryId { get; private set; }

    /// <summary>
    /// Muhasebeleştirme tarihi / Journalization date
    /// </summary>
    public DateTime? JournalizationDate { get; private set; }

    /// <summary>
    /// Kur farkı gelir hesabı ID / Exchange gain account ID
    /// </summary>
    public int? ExchangeGainAccountId { get; private set; }

    /// <summary>
    /// Kur farkı gider hesabı ID / Exchange loss account ID
    /// </summary>
    public int? ExchangeLossAccountId { get; private set; }

    /// <summary>
    /// Hazırlayan / Prepared by
    /// </summary>
    public string? PreparedBy { get; private set; }

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

    // Navigation properties
    public virtual ICollection<ExchangeRateAdjustmentDetail> Details { get; private set; } = new List<ExchangeRateAdjustmentDetail>();

    private ExchangeRateAdjustment() { }

    /// <summary>
    /// Dönem sonu kur değerleme kaydı oluşturur / Creates period-end exchange rate valuation
    /// </summary>
    public static ExchangeRateAdjustment CreatePeriodEndValuation(
        string adjustmentNumber,
        DateTime valuationDate,
        string sourceCurrency,
        Money sourceAmount,
        decimal originalRate,
        decimal valuationRate,
        int? accountingPeriodId = null)
    {
        return Create(
            adjustmentNumber,
            valuationDate,
            ExchangeRateValuationType.PeriodEnd,
            sourceCurrency,
            sourceAmount,
            originalRate,
            valuationRate,
            accountingPeriodId);
    }

    /// <summary>
    /// İşlem bazlı kur farkı kaydı oluşturur / Creates transaction-based exchange difference
    /// </summary>
    public static ExchangeRateAdjustment CreateTransactionDifference(
        string adjustmentNumber,
        DateTime valuationDate,
        string sourceCurrency,
        Money sourceAmount,
        decimal originalRate,
        decimal settlementRate,
        ExchangeRateSourceType sourceType,
        int sourceEntityId,
        string sourceReference)
    {
        var adjustment = Create(
            adjustmentNumber,
            valuationDate,
            ExchangeRateValuationType.Settlement,
            sourceCurrency,
            sourceAmount,
            originalRate,
            settlementRate);

        adjustment.SourceType = sourceType;
        adjustment.SourceEntityId = sourceEntityId;
        adjustment.SourceReference = sourceReference;

        return adjustment;
    }

    private static ExchangeRateAdjustment Create(
        string adjustmentNumber,
        DateTime valuationDate,
        ExchangeRateValuationType valuationType,
        string sourceCurrency,
        Money sourceAmount,
        decimal originalRate,
        decimal valuationRate,
        int? accountingPeriodId = null)
    {
        if (string.IsNullOrWhiteSpace(adjustmentNumber))
            throw new ArgumentException("Kayıt numarası gereklidir", nameof(adjustmentNumber));

        if (originalRate <= 0)
            throw new ArgumentException("Orijinal kur pozitif olmalıdır", nameof(originalRate));

        if (valuationRate <= 0)
            throw new ArgumentException("Değerleme kuru pozitif olmalıdır", nameof(valuationRate));

        var targetCurrency = "TRY";
        var originalValue = sourceAmount.Amount * originalRate;
        var currentValue = sourceAmount.Amount * valuationRate;
        var difference = currentValue - originalValue;

        var rateChangePercentage = originalRate != 0
            ? ((valuationRate - originalRate) / originalRate) * 100
            : 0;

        var direction = difference >= 0
            ? ExchangeDifferenceDirection.Gain
            : ExchangeDifferenceDirection.Loss;

        return new ExchangeRateAdjustment
        {
            AdjustmentNumber = adjustmentNumber,
            ValuationDate = valuationDate,
            ValuationType = valuationType,
            AccountingPeriodId = accountingPeriodId,
            SourceCurrency = sourceCurrency,
            TargetCurrency = targetCurrency,
            OriginalRate = originalRate,
            ValuationRate = valuationRate,
            RateChangePercentage = rateChangePercentage,
            SourceAmount = sourceAmount,
            OriginalValueInTargetCurrency = Money.Create(originalValue, targetCurrency),
            CurrentValueInTargetCurrency = Money.Create(currentValue, targetCurrency),
            ExchangeDifference = Money.Create(Math.Abs(difference), targetCurrency),
            Direction = direction,
            Status = ExchangeRateAdjustmentStatus.Draft
        };
    }

    /// <summary>
    /// Toplu kur değerleme oluşturur / Creates batch exchange rate valuation
    /// </summary>
    public static ExchangeRateAdjustment CreateBatchValuation(
        string adjustmentNumber,
        DateTime valuationDate,
        ExchangeRateValuationType valuationType,
        int? accountingPeriodId = null)
    {
        return new ExchangeRateAdjustment
        {
            AdjustmentNumber = adjustmentNumber,
            ValuationDate = valuationDate,
            ValuationType = valuationType,
            AccountingPeriodId = accountingPeriodId,
            SourceCurrency = "MULTI",
            TargetCurrency = "TRY",
            SourceAmount = Money.Zero("TRY"),
            OriginalValueInTargetCurrency = Money.Zero("TRY"),
            CurrentValueInTargetCurrency = Money.Zero("TRY"),
            ExchangeDifference = Money.Zero("TRY"),
            Direction = ExchangeDifferenceDirection.Neutral,
            Status = ExchangeRateAdjustmentStatus.Draft
        };
    }

    /// <summary>
    /// Detay ekler / Adds detail
    /// </summary>
    public ExchangeRateAdjustmentDetail AddDetail(
        string sourceCurrency,
        Money sourceAmount,
        decimal originalRate,
        decimal valuationRate,
        ExchangeRateSourceType sourceType,
        string? sourceReference = null,
        string? description = null)
    {
        var detail = ExchangeRateAdjustmentDetail.Create(
            this,
            sourceCurrency,
            sourceAmount,
            originalRate,
            valuationRate,
            sourceType,
            sourceReference,
            description);

        Details.Add(detail);
        RecalculateTotals();

        return detail;
    }

    /// <summary>
    /// Toplamları yeniden hesaplar / Recalculates totals
    /// </summary>
    public void RecalculateTotals()
    {
        if (!Details.Any())
            return;

        var totalOriginal = Details.Sum(d => d.OriginalValueInTargetCurrency.Amount);
        var totalCurrent = Details.Sum(d => d.CurrentValueInTargetCurrency.Amount);
        var totalDifference = totalCurrent - totalOriginal;

        OriginalValueInTargetCurrency = Money.Create(totalOriginal, TargetCurrency);
        CurrentValueInTargetCurrency = Money.Create(totalCurrent, TargetCurrency);
        ExchangeDifference = Money.Create(Math.Abs(totalDifference), TargetCurrency);
        Direction = totalDifference >= 0
            ? ExchangeDifferenceDirection.Gain
            : ExchangeDifferenceDirection.Loss;
    }

    /// <summary>
    /// Kaydı hesaplar / Calculates the record
    /// </summary>
    public void Calculate(string preparedBy)
    {
        if (Status != ExchangeRateAdjustmentStatus.Draft)
            throw new InvalidOperationException("Sadece taslak kayıtlar hesaplanabilir");

        RecalculateTotals();
        PreparedBy = preparedBy;
        Status = ExchangeRateAdjustmentStatus.Calculated;
    }

    /// <summary>
    /// Onaylar / Approves the record
    /// </summary>
    public void Approve(string approvedBy)
    {
        if (Status != ExchangeRateAdjustmentStatus.Calculated)
            throw new InvalidOperationException("Sadece hesaplanmış kayıtlar onaylanabilir");

        ApprovedBy = approvedBy;
        ApprovalDate = DateTime.UtcNow;
        Status = ExchangeRateAdjustmentStatus.Approved;
    }

    /// <summary>
    /// Muhasebeleştirir / Journalizes the record
    /// </summary>
    public void Journalize(int journalEntryId, DateTime journalizationDate)
    {
        if (Status != ExchangeRateAdjustmentStatus.Approved)
            throw new InvalidOperationException("Sadece onaylı kayıtlar muhasebeleştirilebilir");

        JournalEntryId = journalEntryId;
        JournalizationDate = journalizationDate;
        IsJournalized = true;
        Status = ExchangeRateAdjustmentStatus.Journalized;
    }

    /// <summary>
    /// Muhasebeleştirmeyi tersine çevirir / Reverses journalization
    /// </summary>
    public void ReverseJournalization()
    {
        if (Status != ExchangeRateAdjustmentStatus.Journalized)
            throw new InvalidOperationException("Sadece muhasebeleştirilmiş kayıtlar tersine çevrilebilir");

        IsJournalized = false;
        Status = ExchangeRateAdjustmentStatus.Approved;
    }

    /// <summary>
    /// İptal eder / Cancels the record
    /// </summary>
    public void Cancel(string reason)
    {
        if (Status == ExchangeRateAdjustmentStatus.Journalized)
            throw new InvalidOperationException("Muhasebeleştirilmiş kayıt iptal edilemez, önce tersine çevirin");

        Notes = $"İptal nedeni: {reason}. {Notes}";
        Status = ExchangeRateAdjustmentStatus.Cancelled;
    }

    // Setter methods
    public void SetSourceInfo(ExchangeRateSourceType sourceType, int? sourceEntityId, string? sourceReference, string? description)
    {
        SourceType = sourceType;
        SourceEntityId = sourceEntityId;
        SourceReference = sourceReference;
        SourceDescription = description;
    }
    public void SetCurrentAccountId(int? accountId) => CurrentAccountId = accountId;
    public void SetBankAccountId(int? accountId) => BankAccountId = accountId;
    public void SetExchangeGainAccountId(int? accountId) => ExchangeGainAccountId = accountId;
    public void SetExchangeLossAccountId(int? accountId) => ExchangeLossAccountId = accountId;
    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Kur farkı kaydı detayı / Exchange rate adjustment detail
/// </summary>
public class ExchangeRateAdjustmentDetail : BaseEntity
{
    /// <summary>
    /// Ana kayıt ID / Main record ID
    /// </summary>
    public int ExchangeRateAdjustmentId { get; private set; }

    /// <summary>
    /// Sıra numarası / Sequence number
    /// </summary>
    public int SequenceNumber { get; private set; }

    /// <summary>
    /// Kaynak döviz kodu / Source currency code
    /// </summary>
    public string SourceCurrency { get; private set; } = string.Empty;

    /// <summary>
    /// Kaynak döviz tutarı / Source currency amount
    /// </summary>
    public Money SourceAmount { get; private set; } = null!;

    /// <summary>
    /// Orijinal kur / Original exchange rate
    /// </summary>
    public decimal OriginalRate { get; private set; }

    /// <summary>
    /// Değerleme kuru / Valuation exchange rate
    /// </summary>
    public decimal ValuationRate { get; private set; }

    /// <summary>
    /// Orijinal kurla hesaplanan tutar / Amount at original rate
    /// </summary>
    public Money OriginalValueInTargetCurrency { get; private set; } = null!;

    /// <summary>
    /// Değerleme kuruyla hesaplanan tutar / Amount at valuation rate
    /// </summary>
    public Money CurrentValueInTargetCurrency { get; private set; } = null!;

    /// <summary>
    /// Kur farkı tutarı / Exchange difference amount
    /// </summary>
    public Money ExchangeDifference { get; private set; } = null!;

    /// <summary>
    /// Kur farkı yönü / Exchange difference direction
    /// </summary>
    public ExchangeDifferenceDirection Direction { get; private set; }

    /// <summary>
    /// Kaynak varlık türü / Source asset type
    /// </summary>
    public ExchangeRateSourceType SourceType { get; private set; }

    /// <summary>
    /// Kaynak varlık ID / Source asset ID
    /// </summary>
    public int? SourceEntityId { get; private set; }

    /// <summary>
    /// Kaynak referans / Source reference
    /// </summary>
    public string? SourceReference { get; private set; }

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// İlişkili hesap ID / Related account ID
    /// </summary>
    public int? AccountId { get; private set; }

    // Navigation
    public virtual ExchangeRateAdjustment ExchangeRateAdjustment { get; private set; } = null!;

    private ExchangeRateAdjustmentDetail() { }

    public static ExchangeRateAdjustmentDetail Create(
        ExchangeRateAdjustment adjustment,
        string sourceCurrency,
        Money sourceAmount,
        decimal originalRate,
        decimal valuationRate,
        ExchangeRateSourceType sourceType,
        string? sourceReference = null,
        string? description = null)
    {
        var targetCurrency = adjustment.TargetCurrency;
        var originalValue = sourceAmount.Amount * originalRate;
        var currentValue = sourceAmount.Amount * valuationRate;
        var difference = currentValue - originalValue;

        var direction = difference >= 0
            ? ExchangeDifferenceDirection.Gain
            : ExchangeDifferenceDirection.Loss;

        var nextSequence = adjustment.Details.Any()
            ? adjustment.Details.Max(d => d.SequenceNumber) + 1
            : 1;

        return new ExchangeRateAdjustmentDetail
        {
            ExchangeRateAdjustmentId = adjustment.Id,
            ExchangeRateAdjustment = adjustment,
            SequenceNumber = nextSequence,
            SourceCurrency = sourceCurrency,
            SourceAmount = sourceAmount,
            OriginalRate = originalRate,
            ValuationRate = valuationRate,
            OriginalValueInTargetCurrency = Money.Create(originalValue, targetCurrency),
            CurrentValueInTargetCurrency = Money.Create(currentValue, targetCurrency),
            ExchangeDifference = Money.Create(Math.Abs(difference), targetCurrency),
            Direction = direction,
            SourceType = sourceType,
            SourceReference = sourceReference,
            Description = description
        };
    }

    public void SetSourceEntityId(int? entityId) => SourceEntityId = entityId;
    public void SetAccountId(int? accountId) => AccountId = accountId;
}

#region Enums

/// <summary>
/// Kur değerleme türü / Exchange rate valuation type
/// </summary>
public enum ExchangeRateValuationType
{
    /// <summary>Dönem Sonu Değerleme / Period-End Valuation</summary>
    PeriodEnd = 1,

    /// <summary>Ay Sonu Değerleme / Month-End Valuation</summary>
    MonthEnd = 2,

    /// <summary>Üç Aylık Değerleme / Quarterly Valuation</summary>
    Quarterly = 3,

    /// <summary>Yıl Sonu Değerleme / Year-End Valuation</summary>
    YearEnd = 4,

    /// <summary>İşlem Kapama / Transaction Settlement</summary>
    Settlement = 5,

    /// <summary>Ödeme Tarihinde / At Payment Date</summary>
    AtPayment = 6,

    /// <summary>Manuel Değerleme / Manual Valuation</summary>
    Manual = 99
}

/// <summary>
/// Kur farkı kaynağı türü / Exchange rate source type
/// </summary>
public enum ExchangeRateSourceType
{
    /// <summary>Banka Hesabı / Bank Account</summary>
    BankAccount = 1,

    /// <summary>Kasa / Cash Account</summary>
    CashAccount = 2,

    /// <summary>Alacak (Müşteri) / Receivable (Customer)</summary>
    Receivable = 3,

    /// <summary>Borç (Tedarikçi) / Payable (Supplier)</summary>
    Payable = 4,

    /// <summary>Avans / Advance</summary>
    Advance = 5,

    /// <summary>Çek / Check</summary>
    Check = 6,

    /// <summary>Senet / Promissory Note</summary>
    PromissoryNote = 7,

    /// <summary>Kredi / Loan</summary>
    Loan = 8,

    /// <summary>Fatura / Invoice</summary>
    Invoice = 9,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

/// <summary>
/// Kur farkı yönü / Exchange difference direction
/// </summary>
public enum ExchangeDifferenceDirection
{
    /// <summary>Nötr / Neutral</summary>
    Neutral = 0,

    /// <summary>Kâr (Olumlu Kur Farkı) / Gain (Positive Exchange Difference)</summary>
    Gain = 1,

    /// <summary>Zarar (Olumsuz Kur Farkı) / Loss (Negative Exchange Difference)</summary>
    Loss = 2
}

/// <summary>
/// Kur farkı kaydı durumu / Exchange rate adjustment status
/// </summary>
public enum ExchangeRateAdjustmentStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 0,

    /// <summary>Hesaplandı / Calculated</summary>
    Calculated = 1,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 2,

    /// <summary>Muhasebeleştirildi / Journalized</summary>
    Journalized = 3,

    /// <summary>İptal Edildi / Cancelled</summary>
    Cancelled = 4
}

#endregion
