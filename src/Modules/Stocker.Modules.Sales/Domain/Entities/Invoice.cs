using Stocker.Modules.Sales.Domain.ValueObjects;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents an invoice generated from a sales order
/// </summary>
public class Invoice : TenantAggregateRoot
{
    private readonly List<InvoiceItem> _items = new();

    public string InvoiceNumber { get; private set; } = string.Empty;
    public DateTime InvoiceDate { get; private set; }
    public DateTime? DueDate { get; private set; }
    #region Kaynak Belge İlişkileri (Source Document Relations)
    
    public Guid? SalesOrderId { get; private set; }
    public string? SalesOrderNumber { get; private set; }
    public Guid? ShipmentId { get; private set; }
    public string? ShipmentNumber { get; private set; }
    public Guid? DeliveryNoteId { get; private set; }
    public string? DeliveryNoteNumber { get; private set; }
    public Guid? QuotationId { get; private set; }
    
    #endregion
    
    #region Müşteri Bilgileri (Customer Information - Snapshot)
    
    public Guid? CustomerId { get; private set; }
    public string? CustomerName { get; private set; }
    public string? CustomerEmail { get; private set; }
    public string? CustomerPhone { get; private set; }
    public string? CustomerTaxNumber { get; private set; }
    public string? CustomerTaxOffice { get; private set; }
    public string? CustomerAddress { get; private set; }
    
    /// <summary>Fatura adresi snapshot'ı (yapılandırılmış)</summary>
    public ShippingAddressSnapshot? BillingAddressSnapshot { get; private set; }
    
    #endregion
    public decimal SubTotal { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal DiscountRate { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public decimal PaidAmount { get; private set; }
    public decimal RemainingAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; } = 1;
    public InvoiceStatus Status { get; private set; }
    public InvoiceType Type { get; private set; }
    public string? Notes { get; private set; }
    #region E-Fatura / E-Arşiv Alanları

    public string? EInvoiceId { get; private set; }
    public bool IsEInvoice { get; private set; }
    public DateTime? EInvoiceDate { get; private set; }
    public string? GibUuid { get; private set; }
    public EInvoiceStatus? EInvoiceStatus { get; private set; }
    public string? EInvoiceErrorMessage { get; private set; }

    // E-Arşiv
    public bool IsEArchive { get; private set; }
    public string? EArchiveNumber { get; private set; }
    public DateTime? EArchiveDate { get; private set; }
    public EArchiveStatus? EArchiveStatus { get; private set; }

    #endregion

    #region Tevkifat (Withholding Tax)

    /// <summary>Tevkifat uygulanıyor mu?</summary>
    public bool HasWithholdingTax { get; private set; }
    /// <summary>Tevkifat oranı (örn: 9/10 için 90)</summary>
    public decimal WithholdingTaxRate { get; private set; }
    /// <summary>Tevkifat tutarı</summary>
    public decimal WithholdingTaxAmount { get; private set; }
    /// <summary>Tevkifat tipi kodu (GİB tevkifat kodu)</summary>
    public string? WithholdingTaxCode { get; private set; }

    #endregion

    #region Fatura Numaralama (VUK Uyumlu)

    /// <summary>Fatura serisi (örn: A, B, GIB2024)</summary>
    public string? InvoiceSeries { get; private set; }
    /// <summary>Seri içindeki sıra numarası</summary>
    public int SequenceNumber { get; private set; }
    /// <summary>Fatura yılı</summary>
    public int InvoiceYear { get; private set; }

    #endregion

    #region Müşteri Vergi Bilgileri (Genişletilmiş)

    /// <summary>Müşteri vergi numarası tipi: VKN (tüzel) veya TCKN (gerçek kişi)</summary>
    public TaxIdType? CustomerTaxIdType { get; private set; }
    /// <summary>Müşteri vergi dairesi</summary>
    public string? CustomerTaxOfficeCode { get; private set; }

    #endregion

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual SalesOrder? SalesOrder { get; private set; }
    public IReadOnlyList<InvoiceItem> Items => _items.AsReadOnly();

    private Invoice() : base() { }

    public static Result<Invoice> Create(
        Guid tenantId,
        string invoiceNumber,
        DateTime invoiceDate,
        InvoiceType type,
        Guid? salesOrderId = null,
        string? salesOrderNumber = null,
        Guid? customerId = null,
        string? customerName = null,
        string? customerEmail = null,
        string? customerPhone = null,
        string? customerTaxNumber = null,
        string? customerTaxOffice = null,
        string? customerAddress = null,
        string currency = "TRY")
    {
        if (string.IsNullOrWhiteSpace(invoiceNumber))
            return Result<Invoice>.Failure(Error.Validation("Invoice.InvoiceNumber", "Invoice number is required"));

        var invoice = new Invoice();
        invoice.Id = Guid.NewGuid();
        invoice.SetTenantId(tenantId);
        invoice.InvoiceNumber = invoiceNumber;
        invoice.InvoiceDate = invoiceDate;
        invoice.Type = type;
        invoice.SalesOrderId = salesOrderId;
        invoice.SalesOrderNumber = salesOrderNumber;
        invoice.CustomerId = customerId;
        invoice.CustomerName = customerName;
        invoice.CustomerEmail = customerEmail;
        invoice.CustomerPhone = customerPhone;
        invoice.CustomerTaxNumber = customerTaxNumber;
        invoice.CustomerTaxOffice = customerTaxOffice;
        invoice.CustomerAddress = customerAddress;
        invoice.Currency = currency;
        invoice.ExchangeRate = 1;
        invoice.Status = InvoiceStatus.Draft;
        invoice.SubTotal = 0;
        invoice.DiscountAmount = 0;
        invoice.DiscountRate = 0;
        invoice.VatAmount = 0;
        invoice.TotalAmount = 0;
        invoice.PaidAmount = 0;
        invoice.RemainingAmount = 0;
        invoice.IsEInvoice = false;
        invoice.CreatedAt = DateTime.UtcNow;

        return Result<Invoice>.Success(invoice);
    }

    public Result AddItem(InvoiceItem item)
    {
        if (item == null)
            return Result.Failure(Error.Validation("Invoice.Item", "Item cannot be null"));

        if (Status != InvoiceStatus.Draft)
            return Result.Failure(Error.Conflict("Invoice.Status", "Cannot add items to a non-draft invoice"));

        _items.Add(item);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RemoveItem(Guid itemId)
    {
        if (Status != InvoiceStatus.Draft)
            return Result.Failure(Error.Conflict("Invoice.Status", "Cannot remove items from a non-draft invoice"));

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return Result.Failure(Error.NotFound("Invoice.Item", "Item not found"));

        _items.Remove(item);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetDueDate(DateTime dueDate)
    {
        if (dueDate < InvoiceDate)
            return Result.Failure(Error.Validation("Invoice.DueDate", "Due date cannot be before invoice date"));

        DueDate = dueDate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result ApplyDiscount(decimal discountAmount, decimal discountRate)
    {
        if (discountAmount < 0)
            return Result.Failure(Error.Validation("Invoice.DiscountAmount", "Discount amount cannot be negative"));

        if (discountRate < 0 || discountRate > 100)
            return Result.Failure(Error.Validation("Invoice.DiscountRate", "Discount rate must be between 0 and 100"));

        DiscountAmount = discountAmount;
        DiscountRate = discountRate;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Issue()
    {
        if (Status != InvoiceStatus.Draft)
            return Result.Failure(Error.Conflict("Invoice.Status", "Only draft invoices can be issued"));

        if (!_items.Any())
            return Result.Failure(Error.Validation("Invoice.Items", "Cannot issue an invoice without items"));

        Status = InvoiceStatus.Issued;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Send()
    {
        if (Status != InvoiceStatus.Issued)
            return Result.Failure(Error.Conflict("Invoice.Status", "Only issued invoices can be sent"));

        Status = InvoiceStatus.Sent;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RecordPayment(decimal amount)
    {
        if (amount <= 0)
            return Result.Failure(Error.Validation("Invoice.Payment", "Payment amount must be greater than 0"));

        if (amount > RemainingAmount)
            return Result.Failure(Error.Validation("Invoice.Payment", "Payment amount cannot exceed remaining amount"));

        PaidAmount += amount;
        RemainingAmount = TotalAmount - PaidAmount;

        if (RemainingAmount <= 0)
        {
            Status = InvoiceStatus.Paid;
        }
        else if (PaidAmount > 0)
        {
            Status = InvoiceStatus.PartiallyPaid;
        }

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetEInvoice(string eInvoiceId)
    {
        if (string.IsNullOrWhiteSpace(eInvoiceId))
            return Result.Failure(Error.Validation("Invoice.EInvoiceId", "E-Invoice ID is required"));

        EInvoiceId = eInvoiceId;
        IsEInvoice = true;
        EInvoiceDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Cancel(string reason)
    {
        if (Status == InvoiceStatus.Cancelled)
            return Result.Failure(Error.Conflict("Invoice.Status", "Invoice is already cancelled"));

        if (PaidAmount > 0)
            return Result.Failure(Error.Conflict("Invoice.Status", "Cannot cancel an invoice with payments"));

        Status = InvoiceStatus.Cancelled;
        Notes = string.IsNullOrEmpty(Notes)
            ? $"Cancelled: {reason}"
            : $"{Notes}\nCancelled: {reason}";
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Void(string reason)
    {
        if (Status == InvoiceStatus.Voided)
            return Result.Failure(Error.Conflict("Invoice.Status", "Invoice is already voided"));

        if (Status == InvoiceStatus.Draft)
            return Result.Failure(Error.Conflict("Invoice.Status", "Draft invoices should be cancelled, not voided"));

        Status = InvoiceStatus.Voided;
        Notes = string.IsNullOrEmpty(Notes)
            ? $"Voided: {reason}"
            : $"{Notes}\nVoided: {reason}";
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #region Tevkifat (Withholding Tax)

    /// <summary>
    /// Tevkifat uygular (KDV Genel Tebliği 117. madde uyumlu)
    /// </summary>
    /// <param name="rate">Tevkifat oranı (örn: 9/10 = 90, 7/10 = 70, 5/10 = 50)</param>
    /// <param name="code">GİB tevkifat kodu</param>
    public Result ApplyWithholdingTax(decimal rate, string code)
    {
        if (rate <= 0 || rate > 100)
            return Result.Failure(Error.Validation("Invoice.WithholdingTaxRate", "Withholding tax rate must be between 0 and 100"));

        if (string.IsNullOrWhiteSpace(code))
            return Result.Failure(Error.Validation("Invoice.WithholdingTaxCode", "Withholding tax code is required"));

        HasWithholdingTax = true;
        WithholdingTaxRate = rate;
        WithholdingTaxCode = code;
        RecalculateWithholdingTax();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Tevkifatı kaldırır
    /// </summary>
    public Result RemoveWithholdingTax()
    {
        HasWithholdingTax = false;
        WithholdingTaxRate = 0;
        WithholdingTaxAmount = 0;
        WithholdingTaxCode = null;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    private void RecalculateWithholdingTax()
    {
        if (HasWithholdingTax && WithholdingTaxRate > 0)
        {
            WithholdingTaxAmount = VatAmount * WithholdingTaxRate / 100;
        }
        else
        {
            WithholdingTaxAmount = 0;
        }
    }

    #endregion

    #region E-Arşiv

    /// <summary>
    /// E-Arşiv fatura olarak işaretler
    /// </summary>
    public Result SetEArchive(string eArchiveNumber)
    {
        if (string.IsNullOrWhiteSpace(eArchiveNumber))
            return Result.Failure(Error.Validation("Invoice.EArchiveNumber", "E-Archive number is required"));

        IsEArchive = true;
        EArchiveNumber = eArchiveNumber;
        EArchiveDate = DateTime.UtcNow;
        EArchiveStatus = Entities.EArchiveStatus.Pending;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// E-Arşiv durumunu günceller
    /// </summary>
    public Result UpdateEArchiveStatus(EArchiveStatus status, string? errorMessage = null)
    {
        EArchiveStatus = status;
        if (status == Entities.EArchiveStatus.Error && !string.IsNullOrEmpty(errorMessage))
        {
            Notes = string.IsNullOrEmpty(Notes)
                ? $"E-Archive Error: {errorMessage}"
                : $"{Notes}\nE-Archive Error: {errorMessage}";
        }
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region GİB UUID

    /// <summary>
    /// GİB UUID'sini ayarlar (e-Fatura benzersiz tanımlayıcı)
    /// </summary>
    public Result SetGibUuid(string gibUuid)
    {
        if (string.IsNullOrWhiteSpace(gibUuid))
            return Result.Failure(Error.Validation("Invoice.GibUuid", "GIB UUID is required"));

        GibUuid = gibUuid;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// E-Fatura durumunu günceller
    /// </summary>
    public Result UpdateEInvoiceStatus(EInvoiceStatus status, string? errorMessage = null)
    {
        EInvoiceStatus = status;
        if (status == Entities.EInvoiceStatus.Error && !string.IsNullOrEmpty(errorMessage))
        {
            EInvoiceErrorMessage = errorMessage;
        }
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Fatura Numaralama

    /// <summary>
    /// VUK uyumlu fatura numaralama bilgisini ayarlar
    /// </summary>
    public Result SetInvoiceNumbering(string series, int sequenceNumber, int year)
    {
        if (string.IsNullOrWhiteSpace(series))
            return Result.Failure(Error.Validation("Invoice.InvoiceSeries", "Invoice series is required"));

        if (sequenceNumber <= 0)
            return Result.Failure(Error.Validation("Invoice.SequenceNumber", "Sequence number must be greater than 0"));

        InvoiceSeries = series;
        SequenceNumber = sequenceNumber;
        InvoiceYear = year;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Müşteri Vergi Tipi

    /// <summary>
    /// Müşterinin vergi kimlik tipini ayarlar
    /// </summary>
    public Result SetCustomerTaxIdType(TaxIdType taxIdType, string? taxOfficeCode = null)
    {
        CustomerTaxIdType = taxIdType;
        CustomerTaxOfficeCode = taxOfficeCode;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Belge İlişkileri (Document Relations)

    /// <summary>
    /// Sevkiyat ilişkisini ayarlar
    /// </summary>
    public Result SetShipment(Guid shipmentId, string shipmentNumber)
    {
        ShipmentId = shipmentId;
        ShipmentNumber = shipmentNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// İrsaliye ilişkisini ayarlar
    /// </summary>
    public Result SetDeliveryNote(Guid deliveryNoteId, string deliveryNoteNumber)
    {
        DeliveryNoteId = deliveryNoteId;
        DeliveryNoteNumber = deliveryNoteNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Teklif ilişkisini ayarlar
    /// </summary>
    public Result SetQuotation(Guid quotationId)
    {
        QuotationId = quotationId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Fatura adresi snapshot'ını ayarlar
    /// </summary>
    public Result SetBillingAddressSnapshot(ShippingAddressSnapshot addressSnapshot)
    {
        BillingAddressSnapshot = addressSnapshot;
        CustomerAddress = addressSnapshot?.ToString();
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    /// <summary>
    /// Siparişten fatura oluşturur
    /// </summary>
    public static Result<Invoice> CreateFromOrder(
        Guid tenantId,
        string invoiceNumber,
        DateTime invoiceDate,
        SalesOrder order,
        InvoiceType type = InvoiceType.Sales)
    {
        var result = Create(
            tenantId: tenantId,
            invoiceNumber: invoiceNumber,
            invoiceDate: invoiceDate,
            type: type,
            salesOrderId: order.Id,
            salesOrderNumber: order.OrderNumber,
            customerId: order.CustomerId,
            customerName: order.CustomerName,
            customerEmail: order.CustomerEmail,
            customerTaxNumber: null,
            customerTaxOffice: null,
            customerAddress: order.BillingAddress ?? order.ShippingAddress,
            currency: order.Currency);

        if (!result.IsSuccess)
            return result;

        var invoice = result.Value!;
        
        // Adres snapshot'ını kopyala
        if (order.BillingAddressSnapshot != null)
            invoice.BillingAddressSnapshot = order.BillingAddressSnapshot;
        else if (order.ShippingAddressSnapshot != null)
            invoice.BillingAddressSnapshot = order.ShippingAddressSnapshot;

        return Result<Invoice>.Success(invoice);
    }

    private void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.LineTotal - i.VatAmount);
        VatAmount = _items.Sum(i => i.VatAmount);

        var totalDiscount = DiscountAmount;
        if (DiscountRate > 0)
        {
            totalDiscount += SubTotal * DiscountRate / 100;
        }

        TotalAmount = SubTotal + VatAmount - totalDiscount;
        RemainingAmount = TotalAmount - PaidAmount;
    }
}

public enum InvoiceStatus
{
    Draft = 0,
    Issued = 1,
    Sent = 2,
    PartiallyPaid = 3,
    Paid = 4,
    Overdue = 5,
    Cancelled = 6,
    Voided = 7
}

public enum InvoiceType
{
    Sales = 0,
    Return = 1,
    Credit = 2,
    Debit = 3,
    Proforma = 4,
    Advance = 5,
    Export = 6
}

/// <summary>E-Fatura durumu (GİB entegrasyonu)</summary>
public enum EInvoiceStatus
{
    Pending = 0,
    Sending = 1,
    Sent = 2,
    Accepted = 3,
    Rejected = 4,
    Error = 5
}

/// <summary>E-Arşiv durumu</summary>
public enum EArchiveStatus
{
    Pending = 0,
    Created = 1,
    Signed = 2,
    Sent = 3,
    Error = 4
}

/// <summary>Vergi kimlik tipi</summary>
public enum TaxIdType
{
    /// <summary>Vergi Kimlik Numarası (Tüzel kişi - 10 hane)</summary>
    VKN = 0,
    /// <summary>TC Kimlik Numarası (Gerçek kişi - 11 hane)</summary>
    TCKN = 1,
    /// <summary>Yabancı vergi numarası</summary>
    Foreign = 2
}

/// <summary>Türkiye KDV Oranları</summary>
public static class TurkishVatRates
{
    public static readonly decimal[] ValidRates = { 0m, 1m, 5m, 8m, 10m, 20m };

    public static bool IsValidRate(decimal rate)
    {
        return ValidRates.Contains(rate);
    }
}
