using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Fatura (Invoice)
/// Türkiye e-Fatura ve e-Arşiv standartlarına uygun
/// GİB (Gelir İdaresi Başkanlığı) UBL-TR 1.2 formatına uygun
/// </summary>
public class Invoice : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Fatura Numarası (Invoice Number)
    /// Format: ABC2024000000001 (3 harf + 4 yıl + 9 numara)
    /// </summary>
    public string InvoiceNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Fatura Seri (Invoice Series)
    /// </summary>
    public string Series { get; private set; } = string.Empty;

    /// <summary>
    /// Fatura Sıra No (Invoice Sequence Number)
    /// </summary>
    public int SequenceNumber { get; private set; }

    /// <summary>
    /// Fatura Tarihi (Invoice Date)
    /// </summary>
    public DateTime InvoiceDate { get; private set; }

    /// <summary>
    /// Düzenleme Saati (Issue Time)
    /// </summary>
    public TimeSpan IssueTime { get; private set; }

    /// <summary>
    /// Fatura Türü (Invoice Type)
    /// </summary>
    public InvoiceType InvoiceType { get; private set; }

    /// <summary>
    /// e-Fatura Türü (E-Invoice Type)
    /// </summary>
    public EInvoiceType EInvoiceType { get; private set; }

    /// <summary>
    /// Fatura Senaryosu (Invoice Scenario)
    /// </summary>
    public InvoiceScenario Scenario { get; private set; }

    /// <summary>
    /// Fatura Durumu (Invoice Status)
    /// </summary>
    public InvoiceStatus Status { get; private set; }

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Döviz Kuru (Exchange Rate)
    /// </summary>
    public decimal ExchangeRate { get; private set; } = 1;

    #endregion

    #region Cari Hesap Bilgileri (Current Account Information)

    /// <summary>
    /// Cari Hesap ID (Current Account ID)
    /// </summary>
    public int CurrentAccountId { get; private set; }

    /// <summary>
    /// Cari Hesap Adı (Account Name - Denormalized)
    /// </summary>
    public string CurrentAccountName { get; private set; } = string.Empty;

    /// <summary>
    /// Vergi Numarası (Tax Number)
    /// </summary>
    public string? TaxNumber { get; private set; }

    /// <summary>
    /// TC Kimlik No (Identity Number)
    /// </summary>
    public string? IdentityNumber { get; private set; }

    /// <summary>
    /// Vergi Dairesi (Tax Office)
    /// </summary>
    public string? TaxOffice { get; private set; }

    #endregion

    #region Adres Bilgileri (Address Information)

    /// <summary>
    /// Fatura Adresi (Billing Address)
    /// </summary>
    public string? BillingAddress { get; private set; }

    /// <summary>
    /// İlçe (District)
    /// </summary>
    public string? BillingDistrict { get; private set; }

    /// <summary>
    /// İl (City)
    /// </summary>
    public string? BillingCity { get; private set; }

    /// <summary>
    /// Ülke (Country)
    /// </summary>
    public string? BillingCountry { get; private set; }

    /// <summary>
    /// Posta Kodu (Postal Code)
    /// </summary>
    public string? BillingPostalCode { get; private set; }

    /// <summary>
    /// Teslimat Adresi (Delivery Address)
    /// </summary>
    public string? DeliveryAddress { get; private set; }

    /// <summary>
    /// Teslimat İlçe (Delivery District)
    /// </summary>
    public string? DeliveryDistrict { get; private set; }

    /// <summary>
    /// Teslimat İl (Delivery City)
    /// </summary>
    public string? DeliveryCity { get; private set; }

    /// <summary>
    /// Teslimat Ülke (Delivery Country)
    /// </summary>
    public string? DeliveryCountry { get; private set; }

    #endregion

    #region Tutar Bilgileri (Amount Information)

    /// <summary>
    /// Mal/Hizmet Toplam Tutarı (Line Extension Amount)
    /// </summary>
    public Money LineExtensionAmount { get; private set; } = null!;

    /// <summary>
    /// İskonto Öncesi Toplam (Gross Amount)
    /// </summary>
    public Money GrossAmount { get; private set; } = null!;

    /// <summary>
    /// Toplam İskonto (Total Discount)
    /// </summary>
    public Money TotalDiscount { get; private set; } = null!;

    /// <summary>
    /// İskonto Sonrası Tutar (Net Amount Before Tax)
    /// </summary>
    public Money NetAmountBeforeTax { get; private set; } = null!;

    /// <summary>
    /// Toplam KDV (Total VAT)
    /// </summary>
    public Money TotalVat { get; private set; } = null!;

    /// <summary>
    /// KDV Tevkifat Tutarı (VAT Withholding Amount)
    /// </summary>
    public Money VatWithholdingAmount { get; private set; } = null!;

    /// <summary>
    /// Diğer Vergiler Toplamı (Total Other Taxes)
    /// </summary>
    public Money TotalOtherTaxes { get; private set; } = null!;

    /// <summary>
    /// Stopaj Tutarı (Withholding Tax Amount)
    /// </summary>
    public Money WithholdingTaxAmount { get; private set; } = null!;

    /// <summary>
    /// Genel Toplam (Grand Total - Payable Amount)
    /// </summary>
    public Money GrandTotal { get; private set; } = null!;

    /// <summary>
    /// TL Karşılığı Genel Toplam (Grand Total in TRY)
    /// </summary>
    public Money GrandTotalTRY { get; private set; } = null!;

    /// <summary>
    /// Ödenen Tutar (Paid Amount)
    /// </summary>
    public Money PaidAmount { get; private set; } = null!;

    /// <summary>
    /// Kalan Tutar (Remaining Amount)
    /// </summary>
    public Money RemainingAmount { get; private set; } = null!;

    #endregion

    #region Vade ve Ödeme Bilgileri (Due Date and Payment Information)

    /// <summary>
    /// Vade Tarihi (Due Date)
    /// </summary>
    public DateTime? DueDate { get; private set; }

    /// <summary>
    /// Ödeme Yöntemi (Payment Method)
    /// </summary>
    public PaymentType? PaymentMethod { get; private set; }

    /// <summary>
    /// Ödeme Koşulları (Payment Terms)
    /// </summary>
    public string? PaymentTerms { get; private set; }

    /// <summary>
    /// Ödeme Notu (Payment Note)
    /// </summary>
    public string? PaymentNote { get; private set; }

    #endregion

    #region e-Fatura Bilgileri (E-Invoice Information)

    /// <summary>
    /// GİB UUID (Unique Identifier)
    /// </summary>
    public Guid? GibUuid { get; private set; }

    /// <summary>
    /// GİB Zarf ID (Envelope ID)
    /// </summary>
    public string? GibEnvelopeId { get; private set; }

    /// <summary>
    /// GİB Durum Kodu (GIB Status Code)
    /// </summary>
    public string? GibStatusCode { get; private set; }

    /// <summary>
    /// GİB Durum Açıklaması (GIB Status Description)
    /// </summary>
    public string? GibStatusDescription { get; private set; }

    /// <summary>
    /// GİB Gönderim Tarihi (GIB Send Date)
    /// </summary>
    public DateTime? GibSendDate { get; private set; }

    /// <summary>
    /// GİB Yanıt Tarihi (GIB Response Date)
    /// </summary>
    public DateTime? GibResponseDate { get; private set; }

    /// <summary>
    /// Alıcı Posta Kutusu (Receiver Mailbox / Alias)
    /// </summary>
    public string? ReceiverAlias { get; private set; }

    /// <summary>
    /// İmza Sertifikası Seri No (Signature Certificate Serial)
    /// </summary>
    public string? SignatureCertificateSerial { get; private set; }

    /// <summary>
    /// İmza Tarihi (Signature Date)
    /// </summary>
    public DateTime? SignatureDate { get; private set; }

    #endregion

    #region Tevkifat Bilgileri (Withholding Information)

    /// <summary>
    /// Tevkifat Uygulansın mı? (Apply VAT Withholding)
    /// </summary>
    public bool ApplyVatWithholding { get; private set; }

    /// <summary>
    /// Tevkifat Oranı (VAT Withholding Rate)
    /// </summary>
    public VatWithholdingRate VatWithholdingRate { get; private set; }

    /// <summary>
    /// Tevkifat Kodu (Withholding Code)
    /// </summary>
    public WithholdingCode? WithholdingCode { get; private set; }

    /// <summary>
    /// Tevkifat Nedeni (Withholding Reason)
    /// </summary>
    public string? WithholdingReason { get; private set; }

    #endregion

    #region İstisna Bilgileri (Exemption Information)

    /// <summary>
    /// KDV İstisnası Var mı? (Has VAT Exemption)
    /// </summary>
    public bool HasVatExemption { get; private set; }

    /// <summary>
    /// İstisna Nedeni (Exemption Reason)
    /// </summary>
    public VatExemptionReason? VatExemptionReason { get; private set; }

    /// <summary>
    /// İstisna Açıklaması (Exemption Description)
    /// </summary>
    public string? VatExemptionDescription { get; private set; }

    #endregion

    #region İrsaliye Bilgileri (Waybill Information)

    /// <summary>
    /// İrsaliye Numarası (Waybill Number)
    /// </summary>
    public string? WaybillNumber { get; private set; }

    /// <summary>
    /// İrsaliye Tarihi (Waybill Date)
    /// </summary>
    public DateTime? WaybillDate { get; private set; }

    /// <summary>
    /// Sipariş Numarası (Order Number)
    /// </summary>
    public string? OrderNumber { get; private set; }

    /// <summary>
    /// Sipariş Tarihi (Order Date)
    /// </summary>
    public DateTime? OrderDate { get; private set; }

    #endregion

    #region Referans Bilgileri (Reference Information)

    /// <summary>
    /// İlişkili Fatura ID (Related Invoice ID - for returns)
    /// </summary>
    public int? RelatedInvoiceId { get; private set; }

    /// <summary>
    /// İlişkili Fatura Numarası (Related Invoice Number)
    /// </summary>
    public string? RelatedInvoiceNumber { get; private set; }

    /// <summary>
    /// Satış Siparişi ID (Sales Order ID)
    /// </summary>
    public int? SalesOrderId { get; private set; }

    /// <summary>
    /// Satınalma Siparişi ID (Purchase Order ID)
    /// </summary>
    public int? PurchaseOrderId { get; private set; }

    /// <summary>
    /// Proje ID (Project ID)
    /// </summary>
    public int? ProjectId { get; private set; }

    #endregion

    #region Diğer Bilgiler (Other Information)

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Dahili Notlar (Internal Notes)
    /// </summary>
    public string? InternalNotes { get; private set; }

    /// <summary>
    /// PDF Dosya Yolu (PDF File Path)
    /// </summary>
    public string? PdfFilePath { get; private set; }

    /// <summary>
    /// XML Dosya Yolu (XML File Path)
    /// </summary>
    public string? XmlFilePath { get; private set; }

    /// <summary>
    /// Yazdırıldı mı? (Is Printed)
    /// </summary>
    public bool IsPrinted { get; private set; }

    /// <summary>
    /// Yazdırma Sayısı (Print Count)
    /// </summary>
    public int PrintCount { get; private set; }

    /// <summary>
    /// E-posta Gönderildi mi? (Is Email Sent)
    /// </summary>
    public bool IsEmailSent { get; private set; }

    /// <summary>
    /// E-posta Gönderim Tarihi (Email Send Date)
    /// </summary>
    public DateTime? EmailSendDate { get; private set; }

    /// <summary>
    /// Oluşturan Kullanıcı ID (Created By User ID)
    /// </summary>
    public int? CreatedByUserId { get; private set; }

    /// <summary>
    /// Onaylayan Kullanıcı ID (Approved By User ID)
    /// </summary>
    public int? ApprovedByUserId { get; private set; }

    /// <summary>
    /// Onay Tarihi (Approval Date)
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Muhasebe Fişi ID (Journal Entry ID)
    /// </summary>
    public int? JournalEntryId { get; private set; }

    #endregion

    #region Navigation Properties

    public virtual CurrentAccount CurrentAccount { get; private set; } = null!;
    public virtual Invoice? RelatedInvoice { get; private set; }
    public virtual JournalEntry? JournalEntry { get; private set; }
    public virtual ICollection<InvoiceLine> Lines { get; private set; } = new List<InvoiceLine>();
    public virtual ICollection<InvoiceTax> Taxes { get; private set; } = new List<InvoiceTax>();
    public virtual ICollection<Payment> Payments { get; private set; } = new List<Payment>();

    #endregion

    protected Invoice() { }

    public Invoice(
        string invoiceNumber,
        string series,
        int sequenceNumber,
        DateTime invoiceDate,
        InvoiceType invoiceType,
        EInvoiceType eInvoiceType,
        InvoiceScenario scenario,
        int currentAccountId,
        string currentAccountName,
        string currency = "TRY")
    {
        InvoiceNumber = invoiceNumber;
        Series = series;
        SequenceNumber = sequenceNumber;
        InvoiceDate = invoiceDate;
        IssueTime = DateTime.Now.TimeOfDay;
        InvoiceType = invoiceType;
        EInvoiceType = eInvoiceType;
        Scenario = scenario;
        CurrentAccountId = currentAccountId;
        CurrentAccountName = currentAccountName;
        Currency = currency;
        ExchangeRate = currency == "TRY" ? 1 : 0;
        Status = InvoiceStatus.Draft;

        // Initialize money fields
        InitializeMoneyFields(currency);

        // Raise domain event
        RaiseDomainEvent(new InvoiceCreatedDomainEvent(
            Id,
            TenantId,
            invoiceNumber,
            invoiceDate,
            invoiceType.ToString(),
            currentAccountId,
            0, // TotalAmount will be calculated later
            currency));
    }

    private void InitializeMoneyFields(string currency)
    {
        LineExtensionAmount = Money.Zero(currency);
        GrossAmount = Money.Zero(currency);
        TotalDiscount = Money.Zero(currency);
        NetAmountBeforeTax = Money.Zero(currency);
        TotalVat = Money.Zero(currency);
        VatWithholdingAmount = Money.Zero(currency);
        TotalOtherTaxes = Money.Zero(currency);
        WithholdingTaxAmount = Money.Zero(currency);
        GrandTotal = Money.Zero(currency);
        GrandTotalTRY = Money.Zero("TRY");
        PaidAmount = Money.Zero(currency);
        RemainingAmount = Money.Zero(currency);
    }

    #region Line Management

    public void AddLine(InvoiceLine line)
    {
        Lines.Add(line);
        RecalculateTotals();
    }

    public void RemoveLine(InvoiceLine line)
    {
        Lines.Remove(line);
        RecalculateTotals();
    }

    public void ClearLines()
    {
        Lines.Clear();
        RecalculateTotals();
    }

    #endregion

    #region Calculations

    public void RecalculateTotals()
    {
        // Calculate line totals
        var lineTotal = Lines.Sum(l => l.LineTotal.Amount);
        var grossTotal = Lines.Sum(l => l.GrossAmount.Amount);
        var discountTotal = Lines.Sum(l => l.DiscountAmount.Amount);
        var netTotal = Lines.Sum(l => l.NetAmount.Amount);
        var vatTotal = Lines.Sum(l => l.VatAmount.Amount);

        LineExtensionAmount = Money.Create(lineTotal, Currency);
        GrossAmount = Money.Create(grossTotal, Currency);
        TotalDiscount = Money.Create(discountTotal, Currency);
        NetAmountBeforeTax = Money.Create(netTotal, Currency);
        TotalVat = Money.Create(vatTotal, Currency);

        // Calculate VAT withholding if applicable
        if (ApplyVatWithholding && VatWithholdingRate != VatWithholdingRate.None)
        {
            var withholdingRate = (int)VatWithholdingRate / 100m;
            VatWithholdingAmount = Money.Create(vatTotal * withholdingRate, Currency);
        }
        else
        {
            VatWithholdingAmount = Money.Zero(Currency);
        }

        // Calculate other taxes
        var otherTaxesTotal = Taxes.Where(t => t.TaxType != TaxType.VAT).Sum(t => t.TaxAmount.Amount);
        TotalOtherTaxes = Money.Create(otherTaxesTotal, Currency);

        // Calculate grand total
        var grandTotal = netTotal + vatTotal - VatWithholdingAmount.Amount + otherTaxesTotal - WithholdingTaxAmount.Amount;
        GrandTotal = Money.Create(grandTotal, Currency);

        // Calculate TRY equivalent
        GrandTotalTRY = Money.Create(grandTotal * ExchangeRate, "TRY");

        // Calculate remaining amount
        RemainingAmount = Money.Create(grandTotal - PaidAmount.Amount, Currency);
    }

    public void SetExchangeRate(decimal rate)
    {
        ExchangeRate = rate;
        GrandTotalTRY = Money.Create(GrandTotal.Amount * rate, "TRY");
    }

    #endregion

    #region Status Management

    public void Submit()
    {
        if (Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Only draft invoices can be submitted");

        if (!Lines.Any())
            throw new InvalidOperationException("Invoice must have at least one line");

        Status = InvoiceStatus.PendingApproval;
    }

    public void Approve(int approvedByUserId)
    {
        if (Status != InvoiceStatus.PendingApproval)
            throw new InvalidOperationException("Only pending invoices can be approved");

        Status = InvoiceStatus.Approved;
        ApprovedByUserId = approvedByUserId;
        ApprovalDate = DateTime.UtcNow;

        RaiseDomainEvent(new InvoiceApprovedDomainEvent(
            Id,
            TenantId,
            InvoiceNumber,
            approvedByUserId,
            ApprovalDate.Value));
    }

    public void SendToTaxAuthority(Guid uuid, string envelopeId, string receiverAlias)
    {
        if (Status != InvoiceStatus.Approved)
            throw new InvalidOperationException("Only approved invoices can be sent to tax authority");

        GibUuid = uuid;
        GibEnvelopeId = envelopeId;
        ReceiverAlias = receiverAlias;
        GibSendDate = DateTime.UtcNow;
        Status = InvoiceStatus.SentToTaxAuthority;

        RaiseDomainEvent(new InvoiceSentToGibDomainEvent(
            Id,
            TenantId,
            InvoiceNumber,
            uuid,
            envelopeId,
            receiverAlias,
            GibSendDate.Value));
    }

    public void MarkAcceptedByTaxAuthority(string statusCode, string statusDescription)
    {
        GibStatusCode = statusCode;
        GibStatusDescription = statusDescription;
        GibResponseDate = DateTime.UtcNow;
        Status = InvoiceStatus.AcceptedByTaxAuthority;

        RaiseDomainEvent(new InvoiceAcceptedByGibDomainEvent(
            Id,
            TenantId,
            InvoiceNumber,
            GibUuid!.Value,
            statusCode,
            statusDescription,
            GibResponseDate.Value));
    }

    public void MarkRejectedByTaxAuthority(string statusCode, string statusDescription)
    {
        GibStatusCode = statusCode;
        GibStatusDescription = statusDescription;
        GibResponseDate = DateTime.UtcNow;
        Status = InvoiceStatus.RejectedByTaxAuthority;

        RaiseDomainEvent(new InvoiceRejectedByGibDomainEvent(
            Id,
            TenantId,
            InvoiceNumber,
            GibUuid!.Value,
            statusCode,
            statusDescription,
            GibResponseDate.Value));
    }

    public void MarkAcceptedByRecipient()
    {
        Status = InvoiceStatus.AcceptedByRecipient;
    }

    public void MarkRejectedByRecipient(string reason)
    {
        Status = InvoiceStatus.RejectedByRecipient;
        Notes = string.IsNullOrEmpty(Notes) ? $"Rejected: {reason}" : $"{Notes}\nRejected: {reason}";
    }

    public void Cancel(string cancelledBy, string? reason = null)
    {
        if (Status == InvoiceStatus.Cancelled)
            throw new InvalidOperationException("Invoice is already cancelled");

        Status = InvoiceStatus.Cancelled;

        RaiseDomainEvent(new InvoiceCancelledDomainEvent(
            Id,
            TenantId,
            InvoiceNumber,
            cancelledBy,
            reason ?? "No reason provided",
            DateTime.UtcNow));
    }

    #endregion

    #region Payment Management

    public void RecordPayment(Money amount, int? paymentId = null)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        var previousPaidAmount = PaidAmount.Amount;
        PaidAmount = Money.Create(PaidAmount.Amount + amount.Amount, Currency);
        RemainingAmount = Money.Create(GrandTotal.Amount - PaidAmount.Amount, Currency);

        if (RemainingAmount.Amount <= 0)
        {
            Status = InvoiceStatus.Paid;
            RaiseDomainEvent(new InvoicePaidDomainEvent(
                Id,
                TenantId,
                InvoiceNumber,
                paymentId ?? 0,
                CurrentAccountId,
                amount.Amount,
                0, // Fully paid
                Currency));
        }
        else if (PaidAmount.Amount > 0)
        {
            Status = InvoiceStatus.PartiallyPaid;
            RaiseDomainEvent(new InvoicePartiallyPaidDomainEvent(
                Id,
                TenantId,
                InvoiceNumber,
                paymentId ?? 0,
                CurrentAccountId,
                amount.Amount,
                PaidAmount.Amount,
                RemainingAmount.Amount,
                Currency));
        }
    }

    #endregion

    #region Additional Methods

    public void SetTaxInfo(string? taxNumber, string? identityNumber, string? taxOffice)
    {
        TaxNumber = taxNumber;
        IdentityNumber = identityNumber;
        TaxOffice = taxOffice;
    }

    public void SetBillingAddress(string? address, string? district, string? city, string? country, string? postalCode)
    {
        BillingAddress = address;
        BillingDistrict = district;
        BillingCity = city;
        BillingCountry = country;
        BillingPostalCode = postalCode;
    }

    public void SetDeliveryAddress(string? address, string? district, string? city, string? country)
    {
        DeliveryAddress = address;
        DeliveryDistrict = district;
        DeliveryCity = city;
        DeliveryCountry = country;
    }

    public void SetVatWithholding(bool apply, VatWithholdingRate rate, WithholdingCode? code = null, string? reason = null)
    {
        ApplyVatWithholding = apply;
        VatWithholdingRate = rate;
        WithholdingCode = code;
        WithholdingReason = reason;
        RecalculateTotals();
    }

    public void SetVatExemption(bool hasExemption, VatExemptionReason? reason = null, string? description = null)
    {
        HasVatExemption = hasExemption;
        VatExemptionReason = reason;
        VatExemptionDescription = description;
    }

    public void SetPaymentInfo(DateTime? dueDate, PaymentType? paymentMethod, string? paymentTerms, string? paymentNote)
    {
        DueDate = dueDate;
        PaymentMethod = paymentMethod;
        PaymentTerms = paymentTerms;
        PaymentNote = paymentNote;
    }

    public void SetWaybillInfo(string? waybillNumber, DateTime? waybillDate)
    {
        WaybillNumber = waybillNumber;
        WaybillDate = waybillDate;
    }

    public void SetOrderInfo(string? orderNumber, DateTime? orderDate)
    {
        OrderNumber = orderNumber;
        OrderDate = orderDate;
    }

    public void SetRelatedInvoice(int? relatedInvoiceId, string? relatedInvoiceNumber)
    {
        RelatedInvoiceId = relatedInvoiceId;
        RelatedInvoiceNumber = relatedInvoiceNumber;
    }

    public void SetNotes(string? notes, string? internalNotes)
    {
        Notes = notes;
        InternalNotes = internalNotes;
    }

    public void SetFiles(string? pdfFilePath, string? xmlFilePath)
    {
        PdfFilePath = pdfFilePath;
        XmlFilePath = xmlFilePath;
    }

    public void MarkAsPrinted()
    {
        IsPrinted = true;
        PrintCount++;
    }

    public void MarkAsEmailSent()
    {
        IsEmailSent = true;
        EmailSendDate = DateTime.UtcNow;
    }

    public void SetSignatureInfo(string certificateSerial, DateTime signatureDate)
    {
        SignatureCertificateSerial = certificateSerial;
        SignatureDate = signatureDate;
    }

    public void LinkToJournalEntry(int journalEntryId)
    {
        JournalEntryId = journalEntryId;
    }

    #endregion
}
