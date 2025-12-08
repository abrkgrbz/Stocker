using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

public class GoodsReceipt : TenantAggregateRoot
{
    public string ReceiptNumber { get; private set; } = string.Empty;
    public DateTime ReceiptDate { get; private set; }
    public Guid PurchaseOrderId { get; private set; }
    public string? PurchaseOrderNumber { get; private set; }
    public Guid SupplierId { get; private set; }
    public string? SupplierName { get; private set; }
    public Guid WarehouseId { get; private set; }
    public string? WarehouseName { get; private set; }
    public GoodsReceiptStatus Status { get; private set; }
    public GoodsReceiptType Type { get; private set; }

    // Delivery info
    public string? DeliveryNoteNumber { get; private set; }
    public DateTime? DeliveryDate { get; private set; }
    public string? VehiclePlate { get; private set; }
    public string? DriverName { get; private set; }

    // Amounts
    public decimal TotalQuantity { get; private set; }
    public decimal AcceptedQuantity { get; private set; }
    public decimal RejectedQuantity { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";

    // Quality control
    public bool RequiresQualityCheck { get; private set; }
    public bool QualityCheckCompleted { get; private set; }
    public Guid? QualityCheckedById { get; private set; }
    public string? QualityCheckedByName { get; private set; }
    public DateTime? QualityCheckDate { get; private set; }
    public string? QualityNotes { get; private set; }

    // Receiver info
    public Guid? ReceivedById { get; private set; }
    public string? ReceivedByName { get; private set; }
    public string? Notes { get; private set; }

    // Linked invoice
    public Guid? PurchaseInvoiceId { get; private set; }

    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<GoodsReceiptItem> _items = new();
    public IReadOnlyCollection<GoodsReceiptItem> Items => _items.AsReadOnly();

    protected GoodsReceipt() : base() { }

    public static GoodsReceipt Create(
        string receiptNumber,
        Guid purchaseOrderId,
        string? purchaseOrderNumber,
        Guid supplierId,
        string? supplierName,
        Guid warehouseId,
        string? warehouseName,
        Guid tenantId,
        GoodsReceiptType type = GoodsReceiptType.Standard)
    {
        var receipt = new GoodsReceipt();
        receipt.Id = Guid.NewGuid();
        receipt.SetTenantId(tenantId);
        receipt.ReceiptNumber = receiptNumber;
        receipt.ReceiptDate = DateTime.UtcNow;
        receipt.PurchaseOrderId = purchaseOrderId;
        receipt.PurchaseOrderNumber = purchaseOrderNumber;
        receipt.SupplierId = supplierId;
        receipt.SupplierName = supplierName;
        receipt.WarehouseId = warehouseId;
        receipt.WarehouseName = warehouseName;
        receipt.Type = type;
        receipt.Status = GoodsReceiptStatus.Draft;
        receipt.Currency = "TRY";
        receipt.TotalQuantity = 0;
        receipt.AcceptedQuantity = 0;
        receipt.RejectedQuantity = 0;
        receipt.TotalAmount = 0;
        receipt.RequiresQualityCheck = false;
        receipt.QualityCheckCompleted = false;
        receipt.CreatedAt = DateTime.UtcNow;
        return receipt;
    }

    public void AddItem(GoodsReceiptItem item)
    {
        _items.Add(item);
        RecalculateTotals();
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
        TotalQuantity = _items.Sum(i => i.ReceivedQuantity);
        AcceptedQuantity = _items.Sum(i => i.AcceptedQuantity);
        RejectedQuantity = _items.Sum(i => i.RejectedQuantity);
        TotalAmount = _items.Sum(i => i.TotalAmount);
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDeliveryInfo(string? deliveryNoteNumber, DateTime? deliveryDate, string? vehiclePlate, string? driverName)
    {
        DeliveryNoteNumber = deliveryNoteNumber;
        DeliveryDate = deliveryDate;
        VehiclePlate = vehiclePlate;
        DriverName = driverName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetReceiver(Guid receivedById, string? receivedByName)
    {
        ReceivedById = receivedById;
        ReceivedByName = receivedByName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRequiresQualityCheck(bool requires)
    {
        RequiresQualityCheck = requires;
        UpdatedAt = DateTime.UtcNow;
    }

    public void CompleteQualityCheck(Guid checkedById, string? checkedByName, string? notes)
    {
        if (!RequiresQualityCheck)
            throw new InvalidOperationException("This receipt does not require quality check");

        QualityCheckCompleted = true;
        QualityCheckedById = checkedById;
        QualityCheckedByName = checkedByName;
        QualityCheckDate = DateTime.UtcNow;
        QualityNotes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Submit()
    {
        if (Status != GoodsReceiptStatus.Draft)
            throw new InvalidOperationException("Only draft receipts can be submitted");

        if (!_items.Any())
            throw new InvalidOperationException("Cannot submit a receipt without items");

        Status = GoodsReceiptStatus.Pending;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Confirm()
    {
        if (Status != GoodsReceiptStatus.Pending)
            throw new InvalidOperationException("Only pending receipts can be confirmed");

        if (RequiresQualityCheck && !QualityCheckCompleted)
            throw new InvalidOperationException("Quality check must be completed before confirmation");

        Status = GoodsReceiptStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        if (Status != GoodsReceiptStatus.Confirmed)
            throw new InvalidOperationException("Only confirmed receipts can be completed");

        Status = GoodsReceiptStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == GoodsReceiptStatus.Completed || Status == GoodsReceiptStatus.Cancelled)
            throw new InvalidOperationException("Cannot cancel a completed or already cancelled receipt");

        Status = GoodsReceiptStatus.Cancelled;
        Notes = $"Cancelled: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToInvoice(Guid invoiceId)
    {
        PurchaseInvoiceId = invoiceId;
        UpdatedAt = DateTime.UtcNow;
    }
}

public class GoodsReceiptItem : TenantAggregateRoot
{
    public Guid GoodsReceiptId { get; private set; }
    public Guid PurchaseOrderItemId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string Unit { get; private set; } = "Adet";
    public decimal OrderedQuantity { get; private set; }
    public decimal ReceivedQuantity { get; private set; }
    public decimal AcceptedQuantity { get; private set; }
    public decimal RejectedQuantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string? BatchNumber { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public string? SerialNumbers { get; private set; }
    public string? StorageLocation { get; private set; }
    public ItemCondition Condition { get; private set; }
    public string? RejectionReason { get; private set; }
    public string? Notes { get; private set; }
    public int LineNumber { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual GoodsReceipt GoodsReceipt { get; private set; } = null!;

    protected GoodsReceiptItem() : base() { }

    public static GoodsReceiptItem Create(
        Guid goodsReceiptId,
        Guid purchaseOrderItemId,
        Guid productId,
        string productCode,
        string productName,
        string unit,
        decimal orderedQuantity,
        decimal receivedQuantity,
        decimal unitPrice,
        int lineNumber,
        Guid tenantId)
    {
        var item = new GoodsReceiptItem();
        item.Id = Guid.NewGuid();
        item.SetTenantId(tenantId);
        item.GoodsReceiptId = goodsReceiptId;
        item.PurchaseOrderItemId = purchaseOrderItemId;
        item.ProductId = productId;
        item.ProductCode = productCode;
        item.ProductName = productName;
        item.Unit = unit;
        item.OrderedQuantity = orderedQuantity;
        item.ReceivedQuantity = receivedQuantity;
        item.AcceptedQuantity = receivedQuantity;
        item.RejectedQuantity = 0;
        item.UnitPrice = unitPrice;
        item.LineNumber = lineNumber;
        item.Condition = ItemCondition.Good;
        item.CreatedAt = DateTime.UtcNow;
        item.CalculateTotalAmount();
        return item;
    }

    public void SetQuantities(decimal receivedQuantity, decimal acceptedQuantity, decimal rejectedQuantity)
    {
        if (acceptedQuantity + rejectedQuantity > receivedQuantity)
            throw new InvalidOperationException("Accepted + rejected cannot exceed received quantity");

        ReceivedQuantity = receivedQuantity;
        AcceptedQuantity = acceptedQuantity;
        RejectedQuantity = rejectedQuantity;
        CalculateTotalAmount();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetBatchInfo(string? batchNumber, DateTime? expiryDate)
    {
        BatchNumber = batchNumber;
        ExpiryDate = expiryDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetSerialNumbers(string? serialNumbers)
    {
        SerialNumbers = serialNumbers;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetStorageLocation(string? location)
    {
        StorageLocation = location;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCondition(ItemCondition condition, string? rejectionReason = null)
    {
        Condition = condition;
        RejectionReason = rejectionReason;
        UpdatedAt = DateTime.UtcNow;
    }

    private void CalculateTotalAmount()
    {
        TotalAmount = AcceptedQuantity * UnitPrice;
    }
}

public enum GoodsReceiptStatus
{
    Draft,
    Pending,
    Confirmed,
    Completed,
    Cancelled
}

public enum GoodsReceiptType
{
    Standard,
    PartialDelivery,
    ReturnReceipt,
    DirectDelivery,
    Consignment
}

public enum ItemCondition
{
    Good,
    Damaged,
    Defective,
    Expired,
    WrongItem,
    PartiallyDamaged
}
