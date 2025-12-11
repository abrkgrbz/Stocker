using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Borç dekontu entity'si - Tedarikçiden alacak/borç düzeltmeleri
/// Debit Note entity - Credit/debit adjustments from suppliers
/// </summary>
public class DebitNote : TenantAggregateRoot
{
    private readonly List<DebitNoteItem> _items = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Dekont numarası / Debit note number
    /// </summary>
    public string DebitNoteNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Tedarikçi ID / Supplier ID
    /// </summary>
    public Guid SupplierId { get; private set; }

    /// <summary>
    /// Dekont tarihi / Debit note date
    /// </summary>
    public DateTime DebitNoteDate { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public DebitNoteStatus Status { get; private set; }

    /// <summary>
    /// Dekont tipi / Debit note type
    /// </summary>
    public DebitNoteType DebitNoteType { get; private set; }

    /// <summary>
    /// Neden / Reason
    /// </summary>
    public DebitNoteReason Reason { get; private set; }

    #endregion

    #region İlişkili Belgeler (Related Documents)

    /// <summary>
    /// İlişkili fatura ID / Related invoice ID
    /// </summary>
    public Guid? RelatedInvoiceId { get; private set; }

    /// <summary>
    /// İlişkili fatura numarası / Related invoice number
    /// </summary>
    public string? RelatedInvoiceNumber { get; private set; }

    /// <summary>
    /// İlişkili iade ID / Related return ID
    /// </summary>
    public Guid? RelatedReturnId { get; private set; }

    /// <summary>
    /// İlişkili sipariş ID / Related purchase order ID
    /// </summary>
    public Guid? RelatedPurchaseOrderId { get; private set; }

    /// <summary>
    /// Tedarikçi dekont numarası / Supplier debit note number
    /// </summary>
    public string? SupplierDebitNoteNumber { get; private set; }

    #endregion

    #region Tutar Bilgileri (Amount Information)

    /// <summary>
    /// Alt toplam / Subtotal
    /// </summary>
    public decimal Subtotal { get; private set; }

    /// <summary>
    /// KDV tutarı / VAT amount
    /// </summary>
    public decimal VatAmount { get; private set; }

    /// <summary>
    /// Toplam tutar / Total amount
    /// </summary>
    public decimal TotalAmount { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Döviz kuru / Exchange rate
    /// </summary>
    public decimal ExchangeRate { get; private set; } = 1;

    /// <summary>
    /// TL karşılığı / Amount in TRY
    /// </summary>
    public decimal AmountInTRY { get; private set; }

    #endregion

    #region KDV Bilgileri (VAT Information)

    /// <summary>
    /// KDV oranı (%) / VAT rate (%)
    /// </summary>
    public decimal VatRate { get; private set; }

    /// <summary>
    /// KDV dahil mi? / VAT included?
    /// </summary>
    public bool VatIncluded { get; private set; }

    /// <summary>
    /// Stopaj tutarı / Withholding tax amount
    /// </summary>
    public decimal? WithholdingAmount { get; private set; }

    /// <summary>
    /// Stopaj oranı (%) / Withholding rate (%)
    /// </summary>
    public decimal? WithholdingRate { get; private set; }

    #endregion

    #region Onay Bilgileri (Approval Information)

    /// <summary>
    /// Onay durumu / Approval status
    /// </summary>
    public DebitNoteApprovalStatus ApprovalStatus { get; private set; }

    /// <summary>
    /// Onaylayan ID / Approved by ID
    /// </summary>
    public Guid? ApprovedById { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    /// <summary>
    /// Onay notları / Approval notes
    /// </summary>
    public string? ApprovalNotes { get; private set; }

    #endregion

    #region Muhasebe Bilgileri (Accounting Information)

    /// <summary>
    /// Muhasebe işlendi mi? / Accounting posted?
    /// </summary>
    public bool IsAccountingPosted { get; private set; }

    /// <summary>
    /// Muhasebe tarihi / Accounting date
    /// </summary>
    public DateTime? AccountingDate { get; private set; }

    /// <summary>
    /// Muhasebe fişi ID / Journal entry ID
    /// </summary>
    public Guid? JournalEntryId { get; private set; }

    /// <summary>
    /// Muhasebe fişi numarası / Journal entry number
    /// </summary>
    public string? JournalEntryNumber { get; private set; }

    /// <summary>
    /// Maliyet merkezi ID / Cost center ID
    /// </summary>
    public Guid? CostCenterId { get; private set; }

    #endregion

    #region E-Belge Bilgileri (E-Document Information)

    /// <summary>
    /// E-belge mi? / Is e-document?
    /// </summary>
    public bool IsEDocument { get; private set; }

    /// <summary>
    /// E-belge durumu / E-document status
    /// </summary>
    public EDocumentStatus? EDocumentStatus { get; private set; }

    /// <summary>
    /// UUID / UUID
    /// </summary>
    public string? Uuid { get; private set; }

    /// <summary>
    /// E-belge tarihi / E-document date
    /// </summary>
    public DateTime? EDocumentDate { get; private set; }

    #endregion

    #region Ödeme Bilgileri (Payment Information)

    /// <summary>
    /// Ödendi mi? / Is paid?
    /// </summary>
    public bool IsPaid { get; private set; }

    /// <summary>
    /// Ödeme tarihi / Payment date
    /// </summary>
    public DateTime? PaymentDate { get; private set; }

    /// <summary>
    /// Ödeme ID / Payment ID
    /// </summary>
    public Guid? PaymentId { get; private set; }

    /// <summary>
    /// Cari hesaba yansıtıldı mı? / Applied to account?
    /// </summary>
    public bool AppliedToAccount { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Oluşturma tarihi / Creation date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Güncelleme tarihi / Update date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Oluşturan ID / Created by ID
    /// </summary>
    public Guid? CreatedById { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Supplier Supplier { get; private set; } = null!;
    public virtual PurchaseInvoice? RelatedInvoice { get; private set; }
    public virtual PurchaseReturn? RelatedReturn { get; private set; }
    public virtual IReadOnlyCollection<DebitNoteItem> Items => _items.AsReadOnly();

    protected DebitNote() : base() { }

    public static DebitNote Create(
        string debitNoteNumber,
        Guid supplierId,
        DebitNoteType type,
        DebitNoteReason reason,
        Guid tenantId,
        DateTime? debitNoteDate = null)
    {
        var note = new DebitNote();
        note.Id = Guid.NewGuid();
        note.SetTenantId(tenantId);
        note.DebitNoteNumber = debitNoteNumber;
        note.SupplierId = supplierId;
        note.DebitNoteType = type;
        note.Reason = reason;
        note.DebitNoteDate = debitNoteDate ?? DateTime.UtcNow;
        note.Status = DebitNoteStatus.Draft;
        note.ApprovalStatus = DebitNoteApprovalStatus.Pending;
        note.Currency = "TRY";
        note.ExchangeRate = 1;
        note.VatRate = 20; // Default Turkish VAT
        note.CreatedAt = DateTime.UtcNow;
        return note;
    }

    public DebitNoteItem AddItem(
        string description,
        decimal quantity,
        string unit,
        decimal unitPrice,
        decimal vatRate)
    {
        var item = new DebitNoteItem(Id, description, quantity, unit, unitPrice, vatRate);
        _items.Add(item);
        RecalculateTotals();
        return item;
    }

    public void RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
            RecalculateTotals();
        }
    }

    private void RecalculateTotals()
    {
        Subtotal = _items.Sum(i => i.LineTotal);
        VatAmount = _items.Sum(i => i.VatAmount);
        TotalAmount = Subtotal + VatAmount - (WithholdingAmount ?? 0);
        AmountInTRY = TotalAmount * ExchangeRate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRelatedInvoice(Guid? invoiceId, string? invoiceNumber)
    {
        RelatedInvoiceId = invoiceId;
        RelatedInvoiceNumber = invoiceNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRelatedReturn(Guid? returnId)
    {
        RelatedReturnId = returnId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRelatedPurchaseOrder(Guid? orderId)
    {
        RelatedPurchaseOrderId = orderId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCurrency(string currency, decimal exchangeRate)
    {
        Currency = currency;
        ExchangeRate = exchangeRate;
        RecalculateTotals();
    }

    public void SetWithholding(decimal? rate, decimal? amount)
    {
        WithholdingRate = rate;
        WithholdingAmount = amount;
        RecalculateTotals();
    }

    public void Submit()
    {
        if (Status != DebitNoteStatus.Draft)
            throw new InvalidOperationException("Only draft notes can be submitted");

        Status = DebitNoteStatus.Submitted;
        ApprovalStatus = DebitNoteApprovalStatus.UnderReview;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedById, string? notes)
    {
        Status = DebitNoteStatus.Approved;
        ApprovalStatus = DebitNoteApprovalStatus.Approved;
        ApprovedById = approvedById;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNotes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(Guid rejectedById, string reason)
    {
        Status = DebitNoteStatus.Rejected;
        ApprovalStatus = DebitNoteApprovalStatus.Rejected;
        ApprovedById = rejectedById;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNotes = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void PostToAccounting(DateTime accountingDate, Guid journalEntryId, string journalNumber)
    {
        IsAccountingPosted = true;
        AccountingDate = accountingDate;
        JournalEntryId = journalEntryId;
        JournalEntryNumber = journalNumber;
        Status = DebitNoteStatus.Posted;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ApplyToSupplierAccount()
    {
        AppliedToAccount = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordPayment(Guid paymentId, DateTime paymentDate)
    {
        IsPaid = true;
        PaymentId = paymentId;
        PaymentDate = paymentDate;
        Status = DebitNoteStatus.Paid;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetEDocumentInfo(string uuid, EDocumentStatus status, DateTime date)
    {
        IsEDocument = true;
        Uuid = uuid;
        EDocumentStatus = status;
        EDocumentDate = date;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (IsAccountingPosted)
            throw new InvalidOperationException("Cannot cancel posted debit note");

        Status = DebitNoteStatus.Cancelled;
        Notes = $"İptal nedeni: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCostCenter(Guid? costCenterId) => CostCenterId = costCenterId;
    public void SetDescription(string? description) => Description = description;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetSupplierDebitNoteNumber(string? number) => SupplierDebitNoteNumber = number;
}

/// <summary>
/// Borç dekontu kalemi / Debit note item
/// </summary>
public class DebitNoteItem : TenantAggregateRoot
{
    public Guid DebitNoteId { get; private set; }
    public string Description { get; private set; } = string.Empty;

    public Guid? ProductId { get; private set; }
    public string? ProductCode { get; private set; }
    public string? ProductName { get; private set; }

    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public decimal LineTotal => Quantity * UnitPrice;

    public decimal VatRate { get; private set; }
    public decimal VatAmount => LineTotal * VatRate / 100;
    public decimal TotalWithVat => LineTotal + VatAmount;

    public Guid? RelatedInvoiceItemId { get; private set; }
    public Guid? RelatedReturnItemId { get; private set; }

    public string? Notes { get; private set; }

    public virtual DebitNote DebitNote { get; private set; } = null!;

    protected DebitNoteItem() : base() { }

    public DebitNoteItem(
        Guid debitNoteId,
        string description,
        decimal quantity,
        string unit,
        decimal unitPrice,
        decimal vatRate) : base()
    {
        Id = Guid.NewGuid();
        DebitNoteId = debitNoteId;
        Description = description;
        Quantity = quantity;
        Unit = unit;
        UnitPrice = unitPrice;
        VatRate = vatRate;
    }

    public void SetProduct(Guid? productId, string? code, string? name)
    {
        ProductId = productId;
        ProductCode = code;
        ProductName = name;
    }

    public void SetRelatedItems(Guid? invoiceItemId, Guid? returnItemId)
    {
        RelatedInvoiceItemId = invoiceItemId;
        RelatedReturnItemId = returnItemId;
    }

    public void Update(decimal quantity, decimal unitPrice, decimal vatRate)
    {
        Quantity = quantity;
        UnitPrice = unitPrice;
        VatRate = vatRate;
    }

    public void SetNotes(string? notes) => Notes = notes;
}

#region Enums

public enum DebitNoteStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 1,

    /// <summary>Gönderildi / Submitted</summary>
    Submitted = 2,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 3,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 4,

    /// <summary>Muhasebeleştirildi / Posted</summary>
    Posted = 5,

    /// <summary>Ödendi / Paid</summary>
    Paid = 6,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 7
}

public enum DebitNoteType
{
    /// <summary>Alacak dekontu / Credit note (to supplier)</summary>
    CreditNote = 1,

    /// <summary>Borç dekontu / Debit note (from supplier)</summary>
    DebitNote = 2,

    /// <summary>İade dekontu / Return note</summary>
    ReturnNote = 3,

    /// <summary>Fiyat farkı / Price adjustment</summary>
    PriceAdjustment = 4,

    /// <summary>Miktar farkı / Quantity adjustment</summary>
    QuantityAdjustment = 5
}

public enum DebitNoteReason
{
    /// <summary>İade / Return</summary>
    Return = 1,

    /// <summary>Fiyat farkı / Price difference</summary>
    PriceDifference = 2,

    /// <summary>Miktar farkı / Quantity difference</summary>
    QuantityDifference = 3,

    /// <summary>Hasarlı mal / Damaged goods</summary>
    DamagedGoods = 4,

    /// <summary>Kalite sorunu / Quality issue</summary>
    QualityIssue = 5,

    /// <summary>Hatalı fatura / Invoice error</summary>
    InvoiceError = 6,

    /// <summary>İskonto düzeltmesi / Discount correction</summary>
    DiscountCorrection = 7,

    /// <summary>Geç teslimat cezası / Late delivery penalty</summary>
    LateDeliveryPenalty = 8,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum DebitNoteApprovalStatus
{
    /// <summary>Bekliyor / Pending</summary>
    Pending = 1,

    /// <summary>İncelemede / Under review</summary>
    UnderReview = 2,

    /// <summary>Onaylandı / Approved</summary>
    Approved = 3,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 4
}

public enum EDocumentStatus
{
    /// <summary>Bekliyor / Pending</summary>
    Pending = 1,

    /// <summary>Gönderildi / Sent</summary>
    Sent = 2,

    /// <summary>Kabul edildi / Accepted</summary>
    Accepted = 3,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 4,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 5
}

#endregion
