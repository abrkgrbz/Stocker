using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Konsinye stok entity'si - Tedarikçiye ait stok takibi
/// Consignment Stock entity - Tracking supplier-owned inventory
/// Türkiye'de yaygın B2B modeli, satışa kadar mülkiyet tedarikçide
/// </summary>
public class ConsignmentStock : BaseEntity
{
    private readonly List<ConsignmentStockMovement> _movements = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Konsinye numarası / Consignment number
    /// </summary>
    public string ConsignmentNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Tedarikçi ID / Supplier ID
    /// </summary>
    public int SupplierId { get; private set; }

    /// <summary>
    /// Sözleşme tarihi / Agreement date
    /// </summary>
    public DateTime AgreementDate { get; private set; }

    /// <summary>
    /// Sözleşme bitiş tarihi / Agreement end date
    /// </summary>
    public DateTime? AgreementEndDate { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public ConsignmentStatus Status { get; private set; }

    #endregion

    #region Ürün Bilgileri (Product Information)

    /// <summary>
    /// Ürün ID / Product ID
    /// </summary>
    public int ProductId { get; private set; }

    /// <summary>
    /// Depo ID / Warehouse ID
    /// </summary>
    public int WarehouseId { get; private set; }

    /// <summary>
    /// Lokasyon ID / Location ID
    /// </summary>
    public int? LocationId { get; private set; }

    /// <summary>
    /// Lot numarası / Lot number
    /// </summary>
    public string? LotNumber { get; private set; }

    #endregion

    #region Miktar Bilgileri (Quantity Information)

    /// <summary>
    /// Başlangıç miktarı / Initial quantity
    /// </summary>
    public decimal InitialQuantity { get; private set; }

    /// <summary>
    /// Mevcut miktar / Current quantity
    /// </summary>
    public decimal CurrentQuantity { get; private set; }

    /// <summary>
    /// Satılan miktar / Sold quantity
    /// </summary>
    public decimal SoldQuantity { get; private set; }

    /// <summary>
    /// İade edilen miktar / Returned quantity
    /// </summary>
    public decimal ReturnedQuantity { get; private set; }

    /// <summary>
    /// Hasarlı miktar / Damaged quantity
    /// </summary>
    public decimal DamagedQuantity { get; private set; }

    /// <summary>
    /// Birim / Unit
    /// </summary>
    public string Unit { get; private set; } = string.Empty;

    #endregion

    #region Fiyat Bilgileri (Price Information)

    /// <summary>
    /// Birim maliyet (tedarikçi fiyatı) / Unit cost (supplier price)
    /// </summary>
    public decimal UnitCost { get; private set; }

    /// <summary>
    /// Satış fiyatı / Selling price
    /// </summary>
    public decimal? SellingPrice { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Komisyon oranı (%) / Commission rate
    /// </summary>
    public decimal? CommissionRate { get; private set; }

    #endregion

    #region Mutabakat Bilgileri (Reconciliation Information)

    /// <summary>
    /// Son mutabakat tarihi / Last reconciliation date
    /// </summary>
    public DateTime? LastReconciliationDate { get; private set; }

    /// <summary>
    /// Mutabakat periyodu (gün) / Reconciliation period (days)
    /// </summary>
    public int ReconciliationPeriodDays { get; private set; } = 30;

    /// <summary>
    /// Bir sonraki mutabakat tarihi / Next reconciliation date
    /// </summary>
    public DateTime? NextReconciliationDate { get; private set; }

    /// <summary>
    /// Toplam satış tutarı / Total sales amount
    /// </summary>
    public decimal TotalSalesAmount { get; private set; }

    /// <summary>
    /// Ödenen tutar / Paid amount
    /// </summary>
    public decimal PaidAmount { get; private set; }

    /// <summary>
    /// Kalan borç / Outstanding amount
    /// </summary>
    public decimal OutstandingAmount => TotalSalesAmount - PaidAmount;

    #endregion

    #region Süre Bilgileri (Duration Information)

    /// <summary>
    /// Maksimum konsinye süresi (gün) / Maximum consignment period (days)
    /// </summary>
    public int? MaxConsignmentDays { get; private set; }

    /// <summary>
    /// Son kullanma tarihi / Expiry date
    /// </summary>
    public DateTime? ExpiryDate { get; private set; }

    /// <summary>
    /// Teslim tarihi / Received date
    /// </summary>
    public DateTime ReceivedDate { get; private set; }

    #endregion

    #region Notlar (Notes)

    /// <summary>
    /// Sözleşme notları / Agreement notes
    /// </summary>
    public string? AgreementNotes { get; private set; }

    /// <summary>
    /// Dahili notlar / Internal notes
    /// </summary>
    public string? InternalNotes { get; private set; }

    #endregion

    // Navigation
    public virtual Supplier Supplier { get; private set; } = null!;
    public virtual Product Product { get; private set; } = null!;
    public virtual Warehouse Warehouse { get; private set; } = null!;
    public virtual Location? Location { get; private set; }
    public IReadOnlyList<ConsignmentStockMovement> Movements => _movements.AsReadOnly();

    protected ConsignmentStock() { }

    public ConsignmentStock(
        string consignmentNumber,
        int supplierId,
        int productId,
        int warehouseId,
        decimal initialQuantity,
        string unit,
        decimal unitCost)
    {
        ConsignmentNumber = consignmentNumber;
        SupplierId = supplierId;
        ProductId = productId;
        WarehouseId = warehouseId;
        InitialQuantity = initialQuantity;
        CurrentQuantity = initialQuantity;
        Unit = unit;
        UnitCost = unitCost;
        AgreementDate = DateTime.UtcNow;
        ReceivedDate = DateTime.UtcNow;
        Status = ConsignmentStatus.Active;
    }

    public ConsignmentStockMovement RecordSale(decimal quantity, decimal sellingPrice, string? referenceNumber = null)
    {
        if (Status != ConsignmentStatus.Active)
            throw new InvalidOperationException("Sadece aktif konsinye stoklardan satış yapılabilir.");

        if (quantity > CurrentQuantity)
            throw new InvalidOperationException("Yetersiz konsinye stok.");

        CurrentQuantity -= quantity;
        SoldQuantity += quantity;
        TotalSalesAmount += quantity * sellingPrice;

        var movement = new ConsignmentStockMovement(
            Id,
            ConsignmentMovementType.Sale,
            quantity,
            sellingPrice,
            referenceNumber);

        _movements.Add(movement);

        if (CurrentQuantity == 0)
            Status = ConsignmentStatus.Depleted;

        return movement;
    }

    public ConsignmentStockMovement RecordReturn(decimal quantity, string reason, string? referenceNumber = null)
    {
        if (Status == ConsignmentStatus.Closed)
            throw new InvalidOperationException("Kapalı konsinye stoğa iade yapılamaz.");

        CurrentQuantity += quantity;
        ReturnedQuantity += quantity;

        if (Status == ConsignmentStatus.Depleted)
            Status = ConsignmentStatus.Active;

        var movement = new ConsignmentStockMovement(
            Id,
            ConsignmentMovementType.Return,
            quantity,
            UnitCost,
            referenceNumber);

        movement.SetNotes(reason);
        _movements.Add(movement);

        return movement;
    }

    public ConsignmentStockMovement RecordDamage(decimal quantity, string reason)
    {
        if (quantity > CurrentQuantity)
            throw new InvalidOperationException("Hasarlı miktar mevcut miktarı aşamaz.");

        CurrentQuantity -= quantity;
        DamagedQuantity += quantity;

        var movement = new ConsignmentStockMovement(
            Id,
            ConsignmentMovementType.Damage,
            quantity,
            UnitCost,
            null);

        movement.SetNotes(reason);
        _movements.Add(movement);

        return movement;
    }

    public ConsignmentStockMovement ReturnToSupplier(decimal quantity, string reason)
    {
        if (quantity > CurrentQuantity)
            throw new InvalidOperationException("İade miktarı mevcut miktarı aşamaz.");

        CurrentQuantity -= quantity;
        ReturnedQuantity += quantity;

        var movement = new ConsignmentStockMovement(
            Id,
            ConsignmentMovementType.SupplierReturn,
            quantity,
            UnitCost,
            null);

        movement.SetNotes(reason);
        _movements.Add(movement);

        if (CurrentQuantity == 0)
            Status = ConsignmentStatus.Returned;

        return movement;
    }

    public void RecordPayment(decimal amount, string? referenceNumber = null)
    {
        PaidAmount += amount;

        var movement = new ConsignmentStockMovement(
            Id,
            ConsignmentMovementType.Payment,
            0,
            amount,
            referenceNumber);

        _movements.Add(movement);
    }

    public void Reconcile()
    {
        LastReconciliationDate = DateTime.UtcNow;
        NextReconciliationDate = DateTime.UtcNow.AddDays(ReconciliationPeriodDays);
    }

    public void Close(string reason)
    {
        if (CurrentQuantity > 0)
            throw new InvalidOperationException("Mevcut miktar sıfırlanmadan konsinye kapatılamaz.");

        InternalNotes = $"Kapatma nedeni: {reason}. {InternalNotes}";
        Status = ConsignmentStatus.Closed;
    }

    public void Suspend(string reason)
    {
        InternalNotes = $"Askıya alma nedeni: {reason}. {InternalNotes}";
        Status = ConsignmentStatus.Suspended;
    }

    public void Reactivate()
    {
        if (Status != ConsignmentStatus.Suspended)
            throw new InvalidOperationException("Sadece askıya alınmış konsinyeler yeniden aktifleştirilebilir.");

        Status = ConsignmentStatus.Active;
    }

    public void SetLocation(int? locationId) => LocationId = locationId;
    public void SetLotNumber(string? lotNumber) => LotNumber = lotNumber;
    public void SetSellingPrice(decimal? price) => SellingPrice = price;
    public void SetCommissionRate(decimal? rate) => CommissionRate = rate;
    public void SetMaxConsignmentDays(int? days)
    {
        MaxConsignmentDays = days;
        if (days.HasValue)
            ExpiryDate = ReceivedDate.AddDays(days.Value);
    }
    public void SetReconciliationPeriod(int days)
    {
        ReconciliationPeriodDays = days;
        NextReconciliationDate = (LastReconciliationDate ?? AgreementDate).AddDays(days);
    }
    public void SetAgreementEndDate(DateTime? date) => AgreementEndDate = date;
    public void SetAgreementNotes(string? notes) => AgreementNotes = notes;
    public void SetInternalNotes(string? notes) => InternalNotes = notes;
}

/// <summary>
/// Konsinye stok hareketi / Consignment stock movement
/// </summary>
public class ConsignmentStockMovement : BaseEntity
{
    public int ConsignmentStockId { get; private set; }
    public ConsignmentMovementType MovementType { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalAmount => Quantity * UnitPrice;
    public DateTime MovementDate { get; private set; }
    public string? ReferenceNumber { get; private set; }
    public string? Notes { get; private set; }

    public virtual ConsignmentStock ConsignmentStock { get; private set; } = null!;

    protected ConsignmentStockMovement() { }

    public ConsignmentStockMovement(
        int consignmentStockId,
        ConsignmentMovementType movementType,
        decimal quantity,
        decimal unitPrice,
        string? referenceNumber = null)
    {
        ConsignmentStockId = consignmentStockId;
        MovementType = movementType;
        Quantity = quantity;
        UnitPrice = unitPrice;
        ReferenceNumber = referenceNumber;
        MovementDate = DateTime.UtcNow;
    }

    public void SetNotes(string? notes) => Notes = notes;
}

#region Enums

public enum ConsignmentStatus
{
    /// <summary>Aktif / Active</summary>
    Active = 1,

    /// <summary>Askıda / Suspended</summary>
    Suspended = 2,

    /// <summary>Tükendi / Depleted</summary>
    Depleted = 3,

    /// <summary>İade edildi / Returned</summary>
    Returned = 4,

    /// <summary>Kapatıldı / Closed</summary>
    Closed = 5
}

public enum ConsignmentMovementType
{
    /// <summary>Giriş / Receipt</summary>
    Receipt = 1,

    /// <summary>Satış / Sale</summary>
    Sale = 2,

    /// <summary>İade (müşteri) / Return (customer)</summary>
    Return = 3,

    /// <summary>Tedarikçiye iade / Supplier return</summary>
    SupplierReturn = 4,

    /// <summary>Hasar / Damage</summary>
    Damage = 5,

    /// <summary>Düzeltme / Adjustment</summary>
    Adjustment = 6,

    /// <summary>Ödeme / Payment</summary>
    Payment = 7
}

#endregion
