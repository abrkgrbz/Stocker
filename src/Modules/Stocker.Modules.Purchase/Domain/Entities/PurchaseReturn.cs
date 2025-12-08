using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

public class PurchaseReturn : TenantAggregateRoot
{
    public string ReturnNumber { get; private set; } = string.Empty;
    public DateTime ReturnDate { get; private set; }
    public Guid SupplierId { get; private set; }
    public string? SupplierName { get; private set; }
    public Guid? PurchaseOrderId { get; private set; }
    public string? PurchaseOrderNumber { get; private set; }
    public Guid? PurchaseInvoiceId { get; private set; }
    public string? PurchaseInvoiceNumber { get; private set; }
    public Guid? GoodsReceiptId { get; private set; }
    public string? GoodsReceiptNumber { get; private set; }
    public Guid WarehouseId { get; private set; }
    public string? WarehouseName { get; private set; }
    public PurchaseReturnStatus Status { get; private set; }
    public PurchaseReturnType Type { get; private set; }
    public PurchaseReturnReason Reason { get; private set; }

    // Amounts
    public decimal SubTotal { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; } = 1;

    // Credit/Refund
    public RefundMethod RefundMethod { get; private set; }
    public decimal RefundedAmount { get; private set; }
    public decimal RefundAmount { get; private set; }
    public bool IsRefundCompleted { get; private set; }
    public DateTime? RefundDate { get; private set; }
    public string? RefundReference { get; private set; }

    // Shipping
    public string? ShippingMethod { get; private set; }
    public string? ShippingCarrier { get; private set; }
    public string? TrackingNumber { get; private set; }
    public DateTime? ShippedDate { get; private set; }
    public decimal? ShippingCost { get; private set; }

    // RMA (Return Merchandise Authorization)
    public string? RmaNumber { get; private set; }
    public DateTime? RmaDate { get; private set; }
    public DateTime? RmaExpiryDate { get; private set; }

    // Approval
    public Guid? RequestedById { get; private set; }
    public string? RequestedByName { get; private set; }
    public Guid? ApprovedById { get; private set; }
    public string? ApprovedByName { get; private set; }
    public DateTime? ApprovalDate { get; private set; }

    // Notes
    public string? ReasonDescription { get; private set; }
    public string? Notes { get; private set; }
    public string? InternalNotes { get; private set; }
    public string? SupplierResponse { get; private set; }

    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<PurchaseReturnItem> _items = new();
    public IReadOnlyCollection<PurchaseReturnItem> Items => _items.AsReadOnly();

    protected PurchaseReturn() : base() { }

    public static PurchaseReturn Create(
        string returnNumber,
        Guid supplierId,
        string? supplierName,
        Guid warehouseId,
        string? warehouseName,
        PurchaseReturnReason reason,
        Guid tenantId,
        PurchaseReturnType type = PurchaseReturnType.Standard)
    {
        var returnEntity = new PurchaseReturn();
        returnEntity.Id = Guid.NewGuid();
        returnEntity.SetTenantId(tenantId);
        returnEntity.ReturnNumber = returnNumber;
        returnEntity.ReturnDate = DateTime.UtcNow;
        returnEntity.SupplierId = supplierId;
        returnEntity.SupplierName = supplierName;
        returnEntity.WarehouseId = warehouseId;
        returnEntity.WarehouseName = warehouseName;
        returnEntity.Reason = reason;
        returnEntity.Type = type;
        returnEntity.Status = PurchaseReturnStatus.Draft;
        returnEntity.Currency = "TRY";
        returnEntity.SubTotal = 0;
        returnEntity.VatAmount = 0;
        returnEntity.TotalAmount = 0;
        returnEntity.RefundMethod = Purchase.Domain.Entities.RefundMethod.Credit;
        returnEntity.RefundedAmount = 0;
        returnEntity.IsRefundCompleted = false;
        returnEntity.CreatedAt = DateTime.UtcNow;
        return returnEntity;
    }

    public void AddItem(PurchaseReturnItem item)
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
        SubTotal = _items.Sum(i => i.SubTotal);
        VatAmount = _items.Sum(i => i.VatAmount);
        TotalAmount = _items.Sum(i => i.TotalAmount);
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToPurchaseOrder(Guid orderId, string? orderNumber)
    {
        PurchaseOrderId = orderId;
        PurchaseOrderNumber = orderNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToPurchaseInvoice(Guid invoiceId, string? invoiceNumber)
    {
        PurchaseInvoiceId = invoiceId;
        PurchaseInvoiceNumber = invoiceNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToGoodsReceipt(Guid receiptId, string? receiptNumber)
    {
        GoodsReceiptId = receiptId;
        GoodsReceiptNumber = receiptNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRmaInfo(string rmaNumber, DateTime? expiryDate = null)
    {
        RmaNumber = rmaNumber;
        RmaDate = DateTime.UtcNow;
        RmaExpiryDate = expiryDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetShippingInfo(string? method, string? trackingNumber, decimal? cost)
    {
        ShippingMethod = method;
        TrackingNumber = trackingNumber;
        ShippingCost = cost;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRefundMethod(RefundMethod method)
    {
        RefundMethod = method;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetReasonDescription(string description)
    {
        ReasonDescription = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRequester(Guid requestedById, string? requestedByName)
    {
        RequestedById = requestedById;
        RequestedByName = requestedByName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Submit()
    {
        if (Status != PurchaseReturnStatus.Draft)
            throw new InvalidOperationException("Only draft returns can be submitted");

        if (!_items.Any())
            throw new InvalidOperationException("Cannot submit a return without items");

        Status = PurchaseReturnStatus.Pending;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedById, string? approvedByName)
    {
        if (Status != PurchaseReturnStatus.Pending)
            throw new InvalidOperationException("Only pending returns can be approved");

        Status = PurchaseReturnStatus.Approved;
        ApprovedById = approvedById;
        ApprovedByName = approvedByName;
        ApprovalDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        if (Status != PurchaseReturnStatus.Pending)
            throw new InvalidOperationException("Only pending returns can be rejected");

        Status = PurchaseReturnStatus.Rejected;
        Notes = $"Rejected: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void Ship()
    {
        if (Status != PurchaseReturnStatus.Approved)
            throw new InvalidOperationException("Only approved returns can be shipped");

        Status = PurchaseReturnStatus.Shipped;
        ShippedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordSupplierReceipt(string? supplierResponse = null)
    {
        if (Status != PurchaseReturnStatus.Shipped)
            throw new InvalidOperationException("Only shipped returns can be marked as received by supplier");

        Status = PurchaseReturnStatus.ReceivedBySupplier;
        SupplierResponse = supplierResponse;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ProcessRefund(decimal amount, string? reference)
    {
        if (Status != PurchaseReturnStatus.ReceivedBySupplier && Status != PurchaseReturnStatus.Approved)
            throw new InvalidOperationException("Return must be received by supplier or approved before processing refund");

        RefundedAmount += amount;
        RefundReference = reference;
        IsRefundCompleted = RefundedAmount >= TotalAmount;

        if (IsRefundCompleted)
        {
            RefundDate = DateTime.UtcNow;
            Status = PurchaseReturnStatus.Completed;
        }
        else
        {
            Status = PurchaseReturnStatus.PartiallyRefunded;
        }

        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        Status = PurchaseReturnStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == PurchaseReturnStatus.Completed || Status == PurchaseReturnStatus.Cancelled)
            throw new InvalidOperationException("Cannot cancel a completed or already cancelled return");

        Status = PurchaseReturnStatus.Cancelled;
        Notes = $"Cancelled: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }
}

public class PurchaseReturnItem : TenantAggregateRoot
{
    public Guid PurchaseReturnId { get; private set; }
    public Guid? PurchaseOrderItemId { get; private set; }
    public Guid? GoodsReceiptItemId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string Unit { get; private set; } = "Adet";
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal VatRate { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal SubTotal { get; private set; }
    public decimal TotalAmount { get; private set; }
    public PurchaseReturnItemReason Reason { get; private set; }
    public ItemCondition Condition { get; private set; }
    public string? BatchNumber { get; private set; }
    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }
    public string? ReasonDescription { get; private set; }
    public int LineNumber { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual PurchaseReturn PurchaseReturn { get; private set; } = null!;

    protected PurchaseReturnItem() : base() { }

    public static PurchaseReturnItem Create(
        Guid purchaseReturnId,
        Guid productId,
        string productCode,
        string productName,
        string unit,
        decimal quantity,
        decimal unitPrice,
        decimal vatRate,
        PurchaseReturnItemReason reason,
        ItemCondition condition,
        int lineNumber,
        Guid tenantId)
    {
        var item = new PurchaseReturnItem();
        item.Id = Guid.NewGuid();
        item.SetTenantId(tenantId);
        item.PurchaseReturnId = purchaseReturnId;
        item.ProductId = productId;
        item.ProductCode = productCode;
        item.ProductName = productName;
        item.Unit = unit;
        item.Quantity = quantity;
        item.UnitPrice = unitPrice;
        item.VatRate = vatRate;
        item.Reason = reason;
        item.Condition = condition;
        item.LineNumber = lineNumber;
        item.CreatedAt = DateTime.UtcNow;
        item.CalculateAmounts();
        return item;
    }

    public void Update(decimal quantity, decimal unitPrice, decimal vatRate)
    {
        Quantity = quantity;
        UnitPrice = unitPrice;
        VatRate = vatRate;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetBatchInfo(string? batchNumber, string? serialNumber)
    {
        BatchNumber = batchNumber;
        SerialNumber = serialNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetReasonDescription(string? description)
    {
        ReasonDescription = description;
        UpdatedAt = DateTime.UtcNow;
    }

    private void CalculateAmounts()
    {
        SubTotal = UnitPrice * Quantity;
        VatAmount = SubTotal * VatRate / 100;
        TotalAmount = SubTotal + VatAmount;
    }
}

public enum PurchaseReturnStatus
{
    Draft,
    Pending,
    Approved,
    Rejected,
    Shipped,
    ReceivedBySupplier,
    PartiallyRefunded,
    Completed,
    Cancelled
}

public enum PurchaseReturnType
{
    Standard,
    Defective,
    Warranty,
    Exchange,
    CreditNote
}

public enum PurchaseReturnReason
{
    Defective,
    WrongItem,
    Damaged,
    NotAsDescribed,
    Expired,
    QualityIssue,
    OverDelivery,
    Duplicate,
    NotNeeded,
    Other
}

public enum PurchaseReturnItemReason
{
    Defective,
    Damaged,
    WrongItem,
    WrongQuantity,
    QualityIssue,
    Expired,
    Other
}

public enum RefundMethod
{
    Credit,
    BankTransfer,
    Check,
    Replacement,
    CreditNote,
    Other
}
