using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Konsinye stok entity'si - Tedarikçi konsinye mal takibi
/// Consignment entity - Supplier consignment inventory tracking
/// </summary>
public class Consignment : TenantAggregateRoot
{
    private readonly List<ConsignmentItem> _items = new();
    private readonly List<ConsignmentTransaction> _transactions = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Konsinye numarası / Consignment number
    /// </summary>
    public string ConsignmentNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Tedarikçi ID / Supplier ID
    /// </summary>
    public Guid SupplierId { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public ConsignmentStatus Status { get; private set; }

    /// <summary>
    /// Konsinye tipi / Consignment type
    /// </summary>
    public ConsignmentType ConsignmentType { get; private set; }

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    #endregion

    #region Sözleşme Bilgileri (Agreement Information)

    /// <summary>
    /// Sözleşme numarası / Agreement number
    /// </summary>
    public string? AgreementNumber { get; private set; }

    /// <summary>
    /// Sözleşme başlangıç tarihi / Agreement start date
    /// </summary>
    public DateTime AgreementStartDate { get; private set; }

    /// <summary>
    /// Sözleşme bitiş tarihi / Agreement end date
    /// </summary>
    public DateTime? AgreementEndDate { get; private set; }

    /// <summary>
    /// Sözleşme URL / Agreement URL
    /// </summary>
    public string? AgreementUrl { get; private set; }

    #endregion

    #region Depo Bilgileri (Warehouse Information)

    /// <summary>
    /// Depo ID / Warehouse ID
    /// </summary>
    public Guid? WarehouseId { get; private set; }

    /// <summary>
    /// Depo adı / Warehouse name
    /// </summary>
    public string? WarehouseName { get; private set; }

    /// <summary>
    /// Lokasyon / Location
    /// </summary>
    public string? Location { get; private set; }

    #endregion

    #region Ödeme Koşulları (Payment Terms)

    /// <summary>
    /// Ödeme vadesi (gün) / Payment terms (days)
    /// </summary>
    public int PaymentTermDays { get; private set; }

    /// <summary>
    /// Ödeme sıklığı / Payment frequency
    /// </summary>
    public PaymentFrequency PaymentFrequency { get; private set; }

    /// <summary>
    /// Satış sonrası mı? / Is after sale?
    /// </summary>
    public bool PayAfterSale { get; private set; }

    /// <summary>
    /// Minimum satış miktarı / Minimum sale quantity
    /// </summary>
    public decimal? MinimumSaleQuantity { get; private set; }

    /// <summary>
    /// Komisyon oranı (%) / Commission rate (%)
    /// </summary>
    public decimal? CommissionRate { get; private set; }

    #endregion

    #region Tutar Bilgileri (Amount Information)

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Toplam konsinye değeri / Total consignment value
    /// </summary>
    public decimal TotalConsignmentValue { get; private set; }

    /// <summary>
    /// Satılan değer / Sold value
    /// </summary>
    public decimal SoldValue { get; private set; }

    /// <summary>
    /// İade edilen değer / Returned value
    /// </summary>
    public decimal ReturnedValue { get; private set; }

    /// <summary>
    /// Kalan stok değeri / Remaining stock value
    /// </summary>
    public decimal RemainingStockValue => TotalConsignmentValue - SoldValue - ReturnedValue;

    /// <summary>
    /// Borç bakiyesi / Payable balance
    /// </summary>
    public decimal PayableBalance { get; private set; }

    /// <summary>
    /// Ödenen tutar / Paid amount
    /// </summary>
    public decimal PaidAmount { get; private set; }

    #endregion

    #region Stok İstatistikleri (Stock Statistics)

    /// <summary>
    /// Toplam miktar / Total quantity
    /// </summary>
    public decimal TotalQuantity { get; private set; }

    /// <summary>
    /// Satılan miktar / Sold quantity
    /// </summary>
    public decimal SoldQuantity { get; private set; }

    /// <summary>
    /// İade edilen miktar / Returned quantity
    /// </summary>
    public decimal ReturnedQuantity { get; private set; }

    /// <summary>
    /// Kalan miktar / Remaining quantity
    /// </summary>
    public decimal RemainingQuantity => TotalQuantity - SoldQuantity - ReturnedQuantity;

    /// <summary>
    /// Hasarlı miktar / Damaged quantity
    /// </summary>
    public decimal DamagedQuantity { get; private set; }

    #endregion

    #region Sayım Bilgileri (Inventory Count Information)

    /// <summary>
    /// Son sayım tarihi / Last count date
    /// </summary>
    public DateTime? LastCountDate { get; private set; }

    /// <summary>
    /// Sayım sıklığı (gün) / Count frequency (days)
    /// </summary>
    public int? CountFrequencyDays { get; private set; }

    /// <summary>
    /// Sonraki sayım tarihi / Next count date
    /// </summary>
    public DateTime? NextCountDate { get; private set; }

    #endregion

    #region İletişim Bilgileri (Contact Information)

    /// <summary>
    /// Tedarikçi temsilcisi / Supplier contact
    /// </summary>
    public string? SupplierContact { get; private set; }

    /// <summary>
    /// Tedarikçi telefon / Supplier phone
    /// </summary>
    public string? SupplierPhone { get; private set; }

    /// <summary>
    /// Tedarikçi e-posta / Supplier email
    /// </summary>
    public string? SupplierEmail { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Etiketler / Tags
    /// </summary>
    public string? Tags { get; private set; }

    /// <summary>
    /// Oluşturma tarihi / Creation date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Güncelleme tarihi / Update date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Supplier Supplier { get; private set; } = null!;
    public virtual IReadOnlyCollection<ConsignmentItem> Items => _items.AsReadOnly();
    public virtual IReadOnlyCollection<ConsignmentTransaction> Transactions => _transactions.AsReadOnly();

    protected Consignment() : base() { }

    public static Consignment Create(
        string consignmentNumber,
        Guid supplierId,
        ConsignmentType type,
        DateTime agreementStartDate,
        Guid tenantId,
        DateTime? agreementEndDate = null)
    {
        var consignment = new Consignment();
        consignment.Id = Guid.NewGuid();
        consignment.SetTenantId(tenantId);
        consignment.ConsignmentNumber = consignmentNumber;
        consignment.SupplierId = supplierId;
        consignment.ConsignmentType = type;
        consignment.AgreementStartDate = agreementStartDate;
        consignment.AgreementEndDate = agreementEndDate;
        consignment.Status = ConsignmentStatus.Draft;
        consignment.Currency = "TRY";
        consignment.PaymentTermDays = 30;
        consignment.PaymentFrequency = PaymentFrequency.Monthly;
        consignment.PayAfterSale = true;
        consignment.CreatedAt = DateTime.UtcNow;
        return consignment;
    }

    public ConsignmentItem AddItem(
        Guid productId,
        string productName,
        decimal quantity,
        string unit,
        decimal unitPrice)
    {
        var item = new ConsignmentItem(Id, productId, productName, quantity, unit, unitPrice);
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

    public ConsignmentTransaction RecordSale(
        Guid itemId,
        decimal quantity,
        decimal salePrice,
        string? reference = null)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException("Item not found");

        var transaction = new ConsignmentTransaction(
            Id, itemId, ConsignmentTransactionType.Sale,
            quantity, salePrice, reference);
        _transactions.Add(transaction);

        item.RecordSale(quantity);
        RecalculateTotals();

        return transaction;
    }

    public ConsignmentTransaction RecordReturn(
        Guid itemId,
        decimal quantity,
        string? reason = null)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException("Item not found");

        var transaction = new ConsignmentTransaction(
            Id, itemId, ConsignmentTransactionType.Return,
            quantity, item.UnitPrice, reason);
        _transactions.Add(transaction);

        item.RecordReturn(quantity);
        RecalculateTotals();

        return transaction;
    }

    public ConsignmentTransaction RecordDamage(
        Guid itemId,
        decimal quantity,
        string? description = null)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException("Item not found");

        var transaction = new ConsignmentTransaction(
            Id, itemId, ConsignmentTransactionType.Damage,
            quantity, item.UnitPrice, description);
        _transactions.Add(transaction);

        item.RecordDamage(quantity);
        RecalculateTotals();

        return transaction;
    }

    public void RecordPayment(decimal amount)
    {
        PaidAmount += amount;
        PayableBalance = SoldValue - PaidAmount;

        var transaction = new ConsignmentTransaction(
            Id, null, ConsignmentTransactionType.Payment,
            0, amount, $"Ödeme: {amount:N2} {Currency}");
        _transactions.Add(transaction);

        UpdatedAt = DateTime.UtcNow;
    }

    private void RecalculateTotals()
    {
        TotalQuantity = _items.Sum(i => i.Quantity);
        SoldQuantity = _items.Sum(i => i.SoldQuantity);
        ReturnedQuantity = _items.Sum(i => i.ReturnedQuantity);
        DamagedQuantity = _items.Sum(i => i.DamagedQuantity);

        TotalConsignmentValue = _items.Sum(i => i.TotalValue);
        SoldValue = _items.Sum(i => i.SoldValue);
        ReturnedValue = _items.Sum(i => i.ReturnedValue);
        PayableBalance = SoldValue - PaidAmount;

        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        if (Status != ConsignmentStatus.Draft)
            throw new InvalidOperationException("Only draft consignments can be activated");

        Status = ConsignmentStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Suspend(string reason)
    {
        Status = ConsignmentStatus.Suspended;
        Notes = $"Askıya alındı: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void Close()
    {
        if (RemainingQuantity > 0)
            throw new InvalidOperationException("Cannot close consignment with remaining stock");

        Status = ConsignmentStatus.Closed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Expire()
    {
        Status = ConsignmentStatus.Expired;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordCount(DateTime countDate)
    {
        LastCountDate = countDate;
        if (CountFrequencyDays.HasValue)
            NextCountDate = countDate.AddDays(CountFrequencyDays.Value);
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetWarehouse(Guid? warehouseId, string? name, string? location)
    {
        WarehouseId = warehouseId;
        WarehouseName = name;
        Location = location;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPaymentTerms(int days, PaymentFrequency frequency, bool afterSale, decimal? minQuantity, decimal? commission)
    {
        PaymentTermDays = days;
        PaymentFrequency = frequency;
        PayAfterSale = afterSale;
        MinimumSaleQuantity = minQuantity;
        CommissionRate = commission;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetContact(string? contact, string? phone, string? email)
    {
        SupplierContact = contact;
        SupplierPhone = phone;
        SupplierEmail = email;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAgreement(string? number, string? url)
    {
        AgreementNumber = number;
        AgreementUrl = url;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCountFrequency(int? days) => CountFrequencyDays = days;
    public void SetDescription(string? description) => Description = description;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetTags(string? tags) => Tags = tags;
}

/// <summary>
/// Konsinye kalem / Consignment item
/// </summary>
public class ConsignmentItem : TenantAggregateRoot
{
    public Guid ConsignmentId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public string? ProductCode { get; private set; }
    public string? Barcode { get; private set; }

    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public decimal TotalValue => Quantity * UnitPrice;

    public decimal SoldQuantity { get; private set; }
    public decimal ReturnedQuantity { get; private set; }
    public decimal DamagedQuantity { get; private set; }
    public decimal RemainingQuantity => Quantity - SoldQuantity - ReturnedQuantity - DamagedQuantity;

    public decimal SoldValue => SoldQuantity * UnitPrice;
    public decimal ReturnedValue => ReturnedQuantity * UnitPrice;

    public decimal? MinimumStock { get; private set; }
    public decimal? MaximumStock { get; private set; }

    public DateTime? ExpiryDate { get; private set; }
    public string? BatchNumber { get; private set; }
    public string? SerialNumbers { get; private set; }

    public string? Notes { get; private set; }

    public virtual Consignment Consignment { get; private set; } = null!;

    protected ConsignmentItem() : base() { }

    public ConsignmentItem(
        Guid consignmentId,
        Guid productId,
        string productName,
        decimal quantity,
        string unit,
        decimal unitPrice) : base()
    {
        Id = Guid.NewGuid();
        ConsignmentId = consignmentId;
        ProductId = productId;
        ProductName = productName;
        Quantity = quantity;
        Unit = unit;
        UnitPrice = unitPrice;
    }

    public void RecordSale(decimal quantity)
    {
        if (quantity > RemainingQuantity)
            throw new InvalidOperationException("Not enough stock");

        SoldQuantity += quantity;
    }

    public void RecordReturn(decimal quantity)
    {
        ReturnedQuantity += quantity;
    }

    public void RecordDamage(decimal quantity)
    {
        if (quantity > RemainingQuantity)
            throw new InvalidOperationException("Not enough stock");

        DamagedQuantity += quantity;
    }

    public void AddStock(decimal quantity)
    {
        Quantity += quantity;
    }

    public void UpdatePrice(decimal unitPrice)
    {
        UnitPrice = unitPrice;
    }

    public void SetStockLimits(decimal? min, decimal? max)
    {
        MinimumStock = min;
        MaximumStock = max;
    }

    public void SetBatchInfo(string? batchNumber, DateTime? expiryDate)
    {
        BatchNumber = batchNumber;
        ExpiryDate = expiryDate;
    }

    public void SetProductDetails(string? code, string? barcode)
    {
        ProductCode = code;
        Barcode = barcode;
    }

    public void SetSerialNumbers(string? serials) => SerialNumbers = serials;
    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// Konsinye hareket / Consignment transaction
/// </summary>
public class ConsignmentTransaction : TenantAggregateRoot
{
    public Guid ConsignmentId { get; private set; }
    public Guid? ConsignmentItemId { get; private set; }

    public ConsignmentTransactionType TransactionType { get; private set; }
    public DateTime TransactionDate { get; private set; }

    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalAmount => Quantity * UnitPrice;

    public string? Reference { get; private set; }
    public string? Notes { get; private set; }

    public Guid? RelatedSaleId { get; private set; }
    public Guid? RelatedPaymentId { get; private set; }

    public virtual Consignment Consignment { get; private set; } = null!;
    public virtual ConsignmentItem? ConsignmentItem { get; private set; }

    protected ConsignmentTransaction() : base() { }

    public ConsignmentTransaction(
        Guid consignmentId,
        Guid? itemId,
        ConsignmentTransactionType type,
        decimal quantity,
        decimal unitPrice,
        string? reference = null) : base()
    {
        Id = Guid.NewGuid();
        ConsignmentId = consignmentId;
        ConsignmentItemId = itemId;
        TransactionType = type;
        TransactionDate = DateTime.UtcNow;
        Quantity = quantity;
        UnitPrice = unitPrice;
        Reference = reference;
    }

    public void SetRelatedSale(Guid? saleId) => RelatedSaleId = saleId;
    public void SetRelatedPayment(Guid? paymentId) => RelatedPaymentId = paymentId;
    public void SetNotes(string? notes) => Notes = notes;
}

#region Enums

public enum ConsignmentStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 1,

    /// <summary>Aktif / Active</summary>
    Active = 2,

    /// <summary>Askıda / Suspended</summary>
    Suspended = 3,

    /// <summary>Kapatıldı / Closed</summary>
    Closed = 4,

    /// <summary>Süresi doldu / Expired</summary>
    Expired = 5
}

public enum ConsignmentType
{
    /// <summary>Standart konsinye / Standard consignment</summary>
    Standard = 1,

    /// <summary>Satış noktası / Point of sale</summary>
    PointOfSale = 2,

    /// <summary>Demo / Demo</summary>
    Demo = 3,

    /// <summary>Sezonluk / Seasonal</summary>
    Seasonal = 4,

    /// <summary>Promosyon / Promotional</summary>
    Promotional = 5
}

public enum ConsignmentTransactionType
{
    /// <summary>Giriş / Receipt</summary>
    Receipt = 1,

    /// <summary>Satış / Sale</summary>
    Sale = 2,

    /// <summary>İade / Return</summary>
    Return = 3,

    /// <summary>Hasar / Damage</summary>
    Damage = 4,

    /// <summary>Düzeltme / Adjustment</summary>
    Adjustment = 5,

    /// <summary>Ödeme / Payment</summary>
    Payment = 6,

    /// <summary>Transfer / Transfer</summary>
    Transfer = 7
}

public enum PaymentFrequency
{
    /// <summary>Haftalık / Weekly</summary>
    Weekly = 1,

    /// <summary>İki haftalık / Bi-weekly</summary>
    BiWeekly = 2,

    /// <summary>Aylık / Monthly</summary>
    Monthly = 3,

    /// <summary>Çeyreklik / Quarterly</summary>
    Quarterly = 4,

    /// <summary>Her satışta / Per sale</summary>
    PerSale = 5
}

#endregion
