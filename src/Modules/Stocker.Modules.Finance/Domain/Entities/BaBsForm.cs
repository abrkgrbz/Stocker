using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Ba-Bs Formu entity'si - 5.000 TL ve üzeri mal/hizmet alım-satım bildirimi (GİB yasal zorunluluk)
/// Ba-Bs Form entity - Mandatory reporting for purchases/sales over 5,000 TL (GIB legal requirement)
/// Ba Formu: Mal ve Hizmet Alımlarına İlişkin Bildirim Formu (Form A - Purchases)
/// Bs Formu: Mal ve Hizmet Satışlarına İlişkin Bildirim Formu (Form B - Sales)
/// </summary>
public class BaBsForm : BaseEntity
{
    /// <summary>
    /// Form numarası / Form number
    /// </summary>
    public string FormNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Form türü (Ba/Bs) / Form type (Ba/Bs)
    /// </summary>
    public BaBsFormType FormType { get; private set; }

    /// <summary>
    /// Dönem yılı / Period year
    /// </summary>
    public int PeriodYear { get; private set; }

    /// <summary>
    /// Dönem ayı / Period month
    /// </summary>
    public int PeriodMonth { get; private set; }

    /// <summary>
    /// Dönem başlangıcı / Period start
    /// </summary>
    public DateTime PeriodStart { get; private set; }

    /// <summary>
    /// Dönem sonu / Period end
    /// </summary>
    public DateTime PeriodEnd { get; private set; }

    /// <summary>
    /// Son beyan tarihi / Filing deadline
    /// </summary>
    public DateTime FilingDeadline { get; private set; }

    /// <summary>
    /// Toplam kayıt sayısı / Total record count
    /// </summary>
    public int TotalRecordCount { get; private set; }

    /// <summary>
    /// Toplam tutar (KDV hariç) / Total amount (excluding VAT)
    /// </summary>
    public Money TotalAmountExcludingVat { get; private set; } = null!;

    /// <summary>
    /// Toplam KDV / Total VAT
    /// </summary>
    public Money TotalVat { get; private set; } = null!;

    /// <summary>
    /// Toplam tutar (KDV dahil) / Total amount (including VAT)
    /// </summary>
    public Money TotalAmountIncludingVat { get; private set; } = null!;

    /// <summary>
    /// Form durumu / Form status
    /// </summary>
    public BaBsFormStatus Status { get; private set; }

    /// <summary>
    /// Düzeltme formu mu? / Is correction form?
    /// </summary>
    public bool IsCorrection { get; private set; }

    /// <summary>
    /// Düzeltilen form ID / Corrected form ID
    /// </summary>
    public int? CorrectedFormId { get; private set; }

    /// <summary>
    /// Düzeltme sıra numarası / Correction sequence number
    /// </summary>
    public int CorrectionSequence { get; private set; }

    /// <summary>
    /// Düzeltme nedeni / Correction reason
    /// </summary>
    public string? CorrectionReason { get; private set; }

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
    /// Gönderilme tarihi / Filing date
    /// </summary>
    public DateTime? FilingDate { get; private set; }

    /// <summary>
    /// GİB onay numarası / GIB approval number
    /// </summary>
    public string? GibApprovalNumber { get; private set; }

    /// <summary>
    /// GİB gönderim referansı / GIB submission reference
    /// </summary>
    public string? GibSubmissionReference { get; private set; }

    /// <summary>
    /// Vergi kimlik numarası / Tax ID
    /// </summary>
    public string TaxId { get; private set; } = string.Empty;

    /// <summary>
    /// Vergi dairesi / Tax office
    /// </summary>
    public string? TaxOffice { get; private set; }

    /// <summary>
    /// Unvan / Company name
    /// </summary>
    public string CompanyName { get; private set; } = string.Empty;

    /// <summary>
    /// İlişkili muhasebe dönemi ID / Related accounting period ID
    /// </summary>
    public int? AccountingPeriodId { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    // Navigation properties
    public virtual ICollection<BaBsFormItem> Items { get; private set; } = new List<BaBsFormItem>();
    public virtual BaBsForm? CorrectedForm { get; private set; }
    public virtual ICollection<BaBsForm> Corrections { get; private set; } = new List<BaBsForm>();

    private BaBsForm() { }

    /// <summary>
    /// Ba Formu oluşturur (Alış bildirimi) / Creates Ba Form (Purchase notification)
    /// </summary>
    public static BaBsForm CreateBaForm(
        string formNumber,
        int year,
        int month,
        string taxId,
        string companyName)
    {
        return Create(formNumber, BaBsFormType.Ba, year, month, taxId, companyName);
    }

    /// <summary>
    /// Bs Formu oluşturur (Satış bildirimi) / Creates Bs Form (Sales notification)
    /// </summary>
    public static BaBsForm CreateBsForm(
        string formNumber,
        int year,
        int month,
        string taxId,
        string companyName)
    {
        return Create(formNumber, BaBsFormType.Bs, year, month, taxId, companyName);
    }

    private static BaBsForm Create(
        string formNumber,
        BaBsFormType formType,
        int year,
        int month,
        string taxId,
        string companyName)
    {
        if (string.IsNullOrWhiteSpace(formNumber))
            throw new ArgumentException("Form numarası gereklidir", nameof(formNumber));

        if (string.IsNullOrWhiteSpace(taxId))
            throw new ArgumentException("Vergi kimlik numarası gereklidir", nameof(taxId));

        var periodStart = new DateTime(year, month, 1);
        var periodEnd = periodStart.AddMonths(1).AddDays(-1);

        // Ba-Bs son beyan tarihi: Takip eden ayın sonuna kadar
        var filingDeadline = periodStart.AddMonths(2).AddDays(-1);

        return new BaBsForm
        {
            FormNumber = formNumber,
            FormType = formType,
            PeriodYear = year,
            PeriodMonth = month,
            PeriodStart = periodStart,
            PeriodEnd = periodEnd,
            FilingDeadline = filingDeadline,
            TaxId = taxId,
            CompanyName = companyName,
            TotalRecordCount = 0,
            TotalAmountExcludingVat = Money.Zero("TRY"),
            TotalVat = Money.Zero("TRY"),
            TotalAmountIncludingVat = Money.Zero("TRY"),
            Status = BaBsFormStatus.Draft
        };
    }

    /// <summary>
    /// Form kalemi ekler / Adds form item
    /// </summary>
    public BaBsFormItem AddItem(
        string counterpartyTaxId,
        string counterpartyName,
        string? countryCode,
        int documentCount,
        Money amountExcludingVat,
        Money vatAmount,
        BaBsDocumentType documentType = BaBsDocumentType.Invoice)
    {
        // 5.000 TL sınırı kontrolü (Ba-Bs yasal sınır)
        var totalWithVat = amountExcludingVat.Add(vatAmount);
        if (totalWithVat.Amount < 5000)
        {
            throw new InvalidOperationException(
                "Ba-Bs bildirimi 5.000 TL ve üzeri işlemler için zorunludur. " +
                $"Toplam tutar: {totalWithVat.Amount:N2} TL");
        }

        var item = BaBsFormItem.Create(
            this,
            counterpartyTaxId,
            counterpartyName,
            countryCode,
            documentCount,
            amountExcludingVat,
            vatAmount,
            documentType);

        Items.Add(item);
        RecalculateTotals();

        return item;
    }

    /// <summary>
    /// Faturalardan otomatik kalem oluşturur / Auto-creates items from invoices
    /// </summary>
    public void AddItemFromInvoice(
        string counterpartyTaxId,
        string counterpartyName,
        string? invoiceNumber,
        DateTime invoiceDate,
        Money amountExcludingVat,
        Money vatAmount,
        string? countryCode = "TR")
    {
        // Aynı mükelleften mevcut kalem var mı kontrol et
        var existingItem = Items.FirstOrDefault(i => i.CounterpartyTaxId == counterpartyTaxId);

        if (existingItem != null)
        {
            // Mevcut kaleme ekle
            existingItem.AddDocument(amountExcludingVat, vatAmount);
        }
        else
        {
            // Yeni kalem oluştur (5000 TL sınırı olmadan, sonra filtrelenecek)
            var item = BaBsFormItem.CreateForAggregation(
                this,
                counterpartyTaxId,
                counterpartyName,
                countryCode,
                amountExcludingVat,
                vatAmount);

            Items.Add(item);
        }

        RecalculateTotals();
    }

    /// <summary>
    /// 5.000 TL altı kalemleri filtreler / Filters items below 5,000 TL threshold
    /// </summary>
    public void FilterBelowThreshold()
    {
        var itemsToRemove = Items
            .Where(i => i.TotalAmountIncludingVat.Amount < 5000)
            .ToList();

        foreach (var item in itemsToRemove)
        {
            Items.Remove(item);
        }

        RecalculateTotals();
    }

    /// <summary>
    /// Toplamları yeniden hesaplar / Recalculates totals
    /// </summary>
    public void RecalculateTotals()
    {
        TotalRecordCount = Items.Count;

        var currency = "TRY";
        TotalAmountExcludingVat = Money.Create(
            Items.Sum(i => i.AmountExcludingVat.Amount),
            currency);
        TotalVat = Money.Create(
            Items.Sum(i => i.VatAmount.Amount),
            currency);
        TotalAmountIncludingVat = Money.Create(
            Items.Sum(i => i.TotalAmountIncludingVat.Amount),
            currency);

        // Sıra numaralarını güncelle
        var sequence = 1;
        foreach (var item in Items.OrderBy(i => i.CounterpartyName))
        {
            item.SetSequenceNumber(sequence++);
        }
    }

    /// <summary>
    /// Hazır olarak işaretler / Marks as ready
    /// </summary>
    public void MarkAsReady(string preparedBy)
    {
        if (Status != BaBsFormStatus.Draft)
            throw new InvalidOperationException("Sadece taslak formlar hazır olarak işaretlenebilir");

        if (!Items.Any())
            throw new InvalidOperationException("En az bir kalem gereklidir");

        FilterBelowThreshold(); // 5000 TL altı kalemleri filtrele
        RecalculateTotals();

        PreparedBy = preparedBy;
        PreparationDate = DateTime.UtcNow;
        Status = BaBsFormStatus.Ready;
    }

    /// <summary>
    /// Onaylar / Approves the form
    /// </summary>
    public void Approve(string approvedBy)
    {
        if (Status != BaBsFormStatus.Ready)
            throw new InvalidOperationException("Sadece hazır formlar onaylanabilir");

        ApprovedBy = approvedBy;
        ApprovalDate = DateTime.UtcNow;
        Status = BaBsFormStatus.Approved;
    }

    /// <summary>
    /// GİB'e gönderir / Files to GIB
    /// </summary>
    public void File(DateTime filingDate, string? gibSubmissionReference = null)
    {
        if (Status != BaBsFormStatus.Approved)
            throw new InvalidOperationException("Sadece onaylı formlar gönderilebilir");

        FilingDate = filingDate;
        GibSubmissionReference = gibSubmissionReference;
        Status = BaBsFormStatus.Filed;
    }

    /// <summary>
    /// GİB onayını kaydeder / Records GIB approval
    /// </summary>
    public void RecordGibApproval(string approvalNumber)
    {
        if (Status != BaBsFormStatus.Filed)
            throw new InvalidOperationException("Sadece gönderilmiş formlar onaylanabilir");

        GibApprovalNumber = approvalNumber;
        Status = BaBsFormStatus.Accepted;
    }

    /// <summary>
    /// GİB reddini kaydeder / Records GIB rejection
    /// </summary>
    public void RecordGibRejection(string reason)
    {
        if (Status != BaBsFormStatus.Filed)
            throw new InvalidOperationException("Sadece gönderilmiş formlar reddedilebilir");

        Notes = $"GİB red nedeni: {reason}. {Notes}";
        Status = BaBsFormStatus.Rejected;
    }

    /// <summary>
    /// Düzeltme formu oluşturur / Creates correction form
    /// </summary>
    public BaBsForm CreateCorrection(string formNumber, string correctionReason)
    {
        if (Status != BaBsFormStatus.Accepted && Status != BaBsFormStatus.Filed)
            throw new InvalidOperationException("Sadece kabul edilmiş veya gönderilmiş formlar düzeltilebilir");

        var correction = new BaBsForm
        {
            FormNumber = formNumber,
            FormType = FormType,
            PeriodYear = PeriodYear,
            PeriodMonth = PeriodMonth,
            PeriodStart = PeriodStart,
            PeriodEnd = PeriodEnd,
            FilingDeadline = FilingDeadline,
            TaxId = TaxId,
            TaxOffice = TaxOffice,
            CompanyName = CompanyName,
            IsCorrection = true,
            CorrectedFormId = Id,
            CorrectionSequence = CorrectionSequence + 1,
            CorrectionReason = correctionReason,
            TotalRecordCount = 0,
            TotalAmountExcludingVat = Money.Zero("TRY"),
            TotalVat = Money.Zero("TRY"),
            TotalAmountIncludingVat = Money.Zero("TRY"),
            Status = BaBsFormStatus.Draft
        };

        // Mevcut kalemleri kopyala
        foreach (var item in Items)
        {
            var newItem = BaBsFormItem.Create(
                correction,
                item.CounterpartyTaxId,
                item.CounterpartyName,
                item.CountryCode,
                item.DocumentCount,
                item.AmountExcludingVat,
                item.VatAmount,
                item.DocumentType);

            correction.Items.Add(newItem);
        }

        correction.RecalculateTotals();

        return correction;
    }

    /// <summary>
    /// Formu doğrular / Validates the form
    /// </summary>
    public BaBsValidationResult Validate()
    {
        var result = new BaBsValidationResult { IsValid = true };

        // Temel doğrulamalar
        if (!Items.Any())
        {
            result.AddError("En az bir kalem gereklidir");
        }

        // VKN doğrulaması
        foreach (var item in Items)
        {
            if (string.IsNullOrWhiteSpace(item.CounterpartyTaxId))
            {
                result.AddError($"Kayıt {item.SequenceNumber}: Vergi kimlik numarası boş olamaz");
            }
            else if (item.CounterpartyTaxId.Length != 10 && item.CounterpartyTaxId.Length != 11)
            {
                result.AddWarning($"Kayıt {item.SequenceNumber}: Vergi kimlik numarası 10 veya 11 haneli olmalıdır");
            }

            if (item.TotalAmountIncludingVat.Amount < 5000)
            {
                result.AddWarning($"Kayıt {item.SequenceNumber}: Toplam tutar 5.000 TL altında ({item.TotalAmountIncludingVat.Amount:N2} TL)");
            }
        }

        // Toplam tutarları kontrol et
        var calculatedExclVat = Items.Sum(i => i.AmountExcludingVat.Amount);
        if (Math.Abs(TotalAmountExcludingVat.Amount - calculatedExclVat) > 0.01m)
        {
            result.AddError("Toplam tutar hesaplama hatası");
        }

        // Dönem kontrolü
        if (FilingDeadline < DateTime.Today)
        {
            result.AddWarning("Beyan süresi geçmiş");
        }

        return result;
    }

    /// <summary>
    /// İptal eder / Cancels the form
    /// </summary>
    public void Cancel(string reason)
    {
        if (Status == BaBsFormStatus.Accepted)
            throw new InvalidOperationException("Kabul edilmiş form iptal edilemez, düzeltme formu oluşturun");

        Notes = $"İptal nedeni: {reason}. {Notes}";
        Status = BaBsFormStatus.Cancelled;
    }

    // Setter methods
    public void SetTaxOffice(string? taxOffice) => TaxOffice = taxOffice;
    public void SetAccountingPeriodId(int? periodId) => AccountingPeriodId = periodId;
    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Ba-Bs Form kalemi / Ba-Bs Form item
/// </summary>
public class BaBsFormItem : BaseEntity
{
    /// <summary>
    /// Form ID / Form ID
    /// </summary>
    public int BaBsFormId { get; private set; }

    /// <summary>
    /// Sıra numarası / Sequence number
    /// </summary>
    public int SequenceNumber { get; private set; }

    /// <summary>
    /// Karşı taraf VKN/TCKN / Counterparty tax ID
    /// </summary>
    public string CounterpartyTaxId { get; private set; } = string.Empty;

    /// <summary>
    /// Karşı taraf unvanı / Counterparty name
    /// </summary>
    public string CounterpartyName { get; private set; } = string.Empty;

    /// <summary>
    /// Ülke kodu / Country code
    /// </summary>
    public string? CountryCode { get; private set; }

    /// <summary>
    /// Belge türü / Document type
    /// </summary>
    public BaBsDocumentType DocumentType { get; private set; }

    /// <summary>
    /// Belge sayısı / Document count
    /// </summary>
    public int DocumentCount { get; private set; }

    /// <summary>
    /// KDV hariç tutar / Amount excluding VAT
    /// </summary>
    public Money AmountExcludingVat { get; private set; } = null!;

    /// <summary>
    /// KDV tutarı / VAT amount
    /// </summary>
    public Money VatAmount { get; private set; } = null!;

    /// <summary>
    /// KDV dahil toplam tutar / Total amount including VAT
    /// </summary>
    public Money TotalAmountIncludingVat { get; private set; } = null!;

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    // Navigation
    public virtual BaBsForm BaBsForm { get; private set; } = null!;

    private BaBsFormItem() { }

    public static BaBsFormItem Create(
        BaBsForm form,
        string counterpartyTaxId,
        string counterpartyName,
        string? countryCode,
        int documentCount,
        Money amountExcludingVat,
        Money vatAmount,
        BaBsDocumentType documentType = BaBsDocumentType.Invoice)
    {
        var totalWithVat = amountExcludingVat.Add(vatAmount);

        return new BaBsFormItem
        {
            BaBsFormId = form.Id,
            BaBsForm = form,
            SequenceNumber = form.Items.Count + 1,
            CounterpartyTaxId = counterpartyTaxId.Replace(" ", "").Replace("-", ""),
            CounterpartyName = counterpartyName,
            CountryCode = countryCode ?? "TR",
            DocumentType = documentType,
            DocumentCount = documentCount,
            AmountExcludingVat = amountExcludingVat,
            VatAmount = vatAmount,
            TotalAmountIncludingVat = totalWithVat
        };
    }

    public static BaBsFormItem CreateForAggregation(
        BaBsForm form,
        string counterpartyTaxId,
        string counterpartyName,
        string? countryCode,
        Money amountExcludingVat,
        Money vatAmount)
    {
        return new BaBsFormItem
        {
            BaBsFormId = form.Id,
            BaBsForm = form,
            SequenceNumber = form.Items.Count + 1,
            CounterpartyTaxId = counterpartyTaxId.Replace(" ", "").Replace("-", ""),
            CounterpartyName = counterpartyName,
            CountryCode = countryCode ?? "TR",
            DocumentType = BaBsDocumentType.Invoice,
            DocumentCount = 1,
            AmountExcludingVat = amountExcludingVat,
            VatAmount = vatAmount,
            TotalAmountIncludingVat = amountExcludingVat.Add(vatAmount)
        };
    }

    /// <summary>
    /// Belge ekler (toplama için) / Adds document (for aggregation)
    /// </summary>
    public void AddDocument(Money amountExcludingVat, Money vatAmount)
    {
        DocumentCount++;
        AmountExcludingVat = AmountExcludingVat.Add(amountExcludingVat);
        VatAmount = VatAmount.Add(vatAmount);
        TotalAmountIncludingVat = AmountExcludingVat.Add(VatAmount);
    }

    public void SetSequenceNumber(int sequence) => SequenceNumber = sequence;
    public void SetNotes(string? notes) => Notes = notes;

    public void Update(
        string counterpartyName,
        int documentCount,
        Money amountExcludingVat,
        Money vatAmount)
    {
        CounterpartyName = counterpartyName;
        DocumentCount = documentCount;
        AmountExcludingVat = amountExcludingVat;
        VatAmount = vatAmount;
        TotalAmountIncludingVat = amountExcludingVat.Add(vatAmount);
    }
}

/// <summary>
/// Ba-Bs doğrulama sonucu / Ba-Bs validation result
/// </summary>
public class BaBsValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; } = new();
    public List<string> Warnings { get; } = new();

    public void AddError(string message)
    {
        IsValid = false;
        Errors.Add(message);
    }

    public void AddWarning(string message)
    {
        Warnings.Add(message);
    }
}

#region Enums

/// <summary>
/// Ba-Bs form türü / Ba-Bs form type
/// </summary>
public enum BaBsFormType
{
    /// <summary>
    /// Ba Formu - Mal ve Hizmet Alımlarına İlişkin Bildirim
    /// Form A - Purchase Notification
    /// </summary>
    Ba = 1,

    /// <summary>
    /// Bs Formu - Mal ve Hizmet Satışlarına İlişkin Bildirim
    /// Form B - Sales Notification
    /// </summary>
    Bs = 2
}

/// <summary>
/// Ba-Bs form durumu / Ba-Bs form status
/// </summary>
public enum BaBsFormStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 0,

    /// <summary>Hazır / Ready</summary>
    Ready = 1,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 2,

    /// <summary>Gönderildi / Filed</summary>
    Filed = 3,

    /// <summary>Kabul Edildi / Accepted</summary>
    Accepted = 4,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 5,

    /// <summary>İptal Edildi / Cancelled</summary>
    Cancelled = 6
}

/// <summary>
/// Ba-Bs belge türü / Ba-Bs document type
/// </summary>
public enum BaBsDocumentType
{
    /// <summary>Fatura / Invoice</summary>
    Invoice = 1,

    /// <summary>Serbest Meslek Makbuzu / Professional Service Receipt</summary>
    ProfessionalServiceReceipt = 2,

    /// <summary>Gider Pusulası / Expense Voucher</summary>
    ExpenseVoucher = 3,

    /// <summary>Müstahsil Makbuzu / Producer Receipt</summary>
    ProducerReceipt = 4,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

#endregion
