using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

public class PurchaseOrder : TenantAggregateRoot
{
    public string OrderNumber { get; private set; } = string.Empty;
    public DateTime OrderDate { get; private set; }
    public DateTime? ExpectedDeliveryDate { get; private set; }
    public Guid SupplierId { get; private set; }
    public string? SupplierName { get; private set; }
    public string? SupplierCode { get; private set; }
    public Guid? WarehouseId { get; private set; }
    public string? WarehouseName { get; private set; }
    public string? SupplierOrderNumber { get; private set; }
    public PurchaseOrderStatus Status { get; private set; }
    public PurchaseOrderType Type { get; private set; }

    // Amounts
    public decimal SubTotal { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal DiscountRate { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; }

    // Delivery info
    public string? DeliveryAddress { get; private set; }
    public string? DeliveryCity { get; private set; }
    public string? DeliveryDistrict { get; private set; }
    public string? DeliveryPostalCode { get; private set; }
    public string? DeliveryContactPerson { get; private set; }
    public string? DeliveryContactPhone { get; private set; }

    // Payment terms
    public int PaymentTermDays { get; private set; }
    public DateTime? PaymentDueDate { get; private set; }
    public PaymentMethod? PaymentMethod { get; private set; }

    // References
    public Guid? PurchaseRequestId { get; private set; }
    public string? PurchaseRequestNumber { get; private set; }
    public Guid? PurchaserId { get; private set; }
    public string? PurchaserName { get; private set; }

    // Approval
    public bool RequiresApproval { get; private set; }
    public Guid? ApprovedById { get; private set; }
    public string? ApprovedByName { get; private set; }
    public DateTime? ApprovalDate { get; private set; }
    public string? ApprovalNotes { get; private set; }

    // Notes
    public string? InternalNotes { get; private set; }
    public string? SupplierNotes { get; private set; }
    public string? Terms { get; private set; }

    // Tracking
    public decimal ReceivedAmount { get; private set; }
    public decimal PaidAmount { get; private set; }
    public bool IsFullyReceived { get; private set; }
    public bool IsFullyPaid { get; private set; }
    public DateTime? LastReceivedDate { get; private set; }
    public DateTime? ClosedDate { get; private set; }
    public string? CancellationReason { get; private set; }

    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<PurchaseOrderItem> _items = new();
    public IReadOnlyCollection<PurchaseOrderItem> Items => _items.AsReadOnly();

    protected PurchaseOrder() : base() { }

    public static PurchaseOrder Create(
        string orderNumber,
        Guid supplierId,
        string? supplierName,
        Guid tenantId,
        PurchaseOrderType type = PurchaseOrderType.Standard,
        string currency = "TRY",
        Guid? warehouseId = null,
        string? warehouseName = null)
    {
        var order = new PurchaseOrder();
        order.Id = Guid.NewGuid();
        order.SetTenantId(tenantId);
        order.OrderNumber = orderNumber;
        order.OrderDate = DateTime.UtcNow;
        order.SupplierId = supplierId;
        order.SupplierName = supplierName;
        order.WarehouseId = warehouseId;
        order.WarehouseName = warehouseName;
        order.Type = type;
        order.Status = PurchaseOrderStatus.Draft;
        order.Currency = currency;
        order.ExchangeRate = 1;
        order.SubTotal = 0;
        order.DiscountAmount = 0;
        order.DiscountRate = 0;
        order.VatAmount = 0;
        order.TotalAmount = 0;
        order.PaymentTermDays = 30;
        order.RequiresApproval = false;
        order.ReceivedAmount = 0;
        order.PaidAmount = 0;
        order.IsFullyReceived = false;
        order.IsFullyPaid = false;
        order.CreatedAt = DateTime.UtcNow;
        return order;
    }

    public void AddItem(PurchaseOrderItem item)
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

    public void UpdateItem(Guid itemId, decimal quantity, decimal unitPrice, decimal vatRate, decimal discountRate)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            item.Update(quantity, unitPrice, vatRate, discountRate);
            RecalculateTotals();
        }
    }

    private void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.SubTotal);
        VatAmount = _items.Sum(i => i.VatAmount);
        var itemDiscounts = _items.Sum(i => i.DiscountAmount);
        var orderDiscount = SubTotal * DiscountRate / 100;
        DiscountAmount = itemDiscounts + orderDiscount;
        TotalAmount = SubTotal + VatAmount - orderDiscount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetExpectedDeliveryDate(DateTime? deliveryDate)
    {
        ExpectedDeliveryDate = deliveryDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDeliveryAddress(string address, string? city, string? district, string? postalCode)
    {
        DeliveryAddress = address;
        DeliveryCity = city;
        DeliveryDistrict = district;
        DeliveryPostalCode = postalCode;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDeliveryContact(string? contactPerson, string? contactPhone)
    {
        DeliveryContactPerson = contactPerson;
        DeliveryContactPhone = contactPhone;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPaymentTerms(int days, PaymentMethod? method = null)
    {
        PaymentTermDays = days;
        PaymentMethod = method;
        PaymentDueDate = OrderDate.AddDays(days);
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPurchaser(Guid? purchaserId, string? purchaserName)
    {
        PurchaserId = purchaserId;
        PurchaserName = purchaserName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToPurchaseRequest(Guid requestId, string requestNumber)
    {
        PurchaseRequestId = requestId;
        PurchaseRequestNumber = requestNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ApplyDiscount(decimal discountRate)
    {
        if (discountRate < 0 || discountRate > 100)
            throw new ArgumentException("Discount rate must be between 0 and 100");
        DiscountRate = discountRate;
        RecalculateTotals();
    }

    public void SetExchangeRate(decimal exchangeRate)
    {
        if (exchangeRate <= 0)
            throw new ArgumentException("Exchange rate must be greater than 0");
        ExchangeRate = exchangeRate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetNotes(string? internalNotes, string? supplierNotes)
    {
        InternalNotes = internalNotes;
        SupplierNotes = supplierNotes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetTerms(string? terms)
    {
        Terms = terms;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Submit()
    {
        if (Status != PurchaseOrderStatus.Draft)
            throw new InvalidOperationException("Only draft orders can be submitted");

        if (!_items.Any())
            throw new InvalidOperationException("Cannot submit an order without items");

        Status = RequiresApproval ? PurchaseOrderStatus.PendingApproval : PurchaseOrderStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedById, string? approvedByName, string? notes = null)
    {
        if (Status != PurchaseOrderStatus.PendingApproval)
            throw new InvalidOperationException("Only pending approval orders can be approved");

        Status = PurchaseOrderStatus.Confirmed;
        ApprovedById = approvedById;
        ApprovedByName = approvedByName;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNotes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        if (Status != PurchaseOrderStatus.PendingApproval)
            throw new InvalidOperationException("Only pending approval orders can be rejected");

        Status = PurchaseOrderStatus.Rejected;
        CancellationReason = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Send()
    {
        if (Status != PurchaseOrderStatus.Confirmed)
            throw new InvalidOperationException("Only confirmed orders can be sent");

        Status = PurchaseOrderStatus.Sent;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsPartiallyReceived(decimal receivedAmount)
    {
        if (Status != PurchaseOrderStatus.Sent && Status != PurchaseOrderStatus.PartiallyReceived)
            throw new InvalidOperationException("Order must be sent before receiving");

        Status = PurchaseOrderStatus.PartiallyReceived;
        ReceivedAmount += receivedAmount;
        LastReceivedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsFullyReceived()
    {
        Status = PurchaseOrderStatus.Received;
        IsFullyReceived = true;
        ReceivedAmount = TotalAmount;
        LastReceivedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordPayment(decimal amount)
    {
        PaidAmount += amount;
        IsFullyPaid = PaidAmount >= TotalAmount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        if (!IsFullyReceived)
            throw new InvalidOperationException("Cannot complete an order that is not fully received");

        Status = PurchaseOrderStatus.Completed;
        ClosedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == PurchaseOrderStatus.Completed || Status == PurchaseOrderStatus.Cancelled)
            throw new InvalidOperationException("Cannot cancel a completed or already cancelled order");

        Status = PurchaseOrderStatus.Cancelled;
        CancellationReason = reason;
        ClosedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Close()
    {
        Status = PurchaseOrderStatus.Closed;
        ClosedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}

public enum PurchaseOrderStatus
{
    Draft,
    PendingApproval,
    Confirmed,
    Rejected,
    Sent,
    PartiallyReceived,
    Received,
    Completed,
    Cancelled,
    Closed
}

public enum PurchaseOrderType
{
    Standard,
    Blanket,
    Contract,
    Consignment,
    DropShip,
    Rush
}

public enum PaymentMethod
{
    Cash,
    BankTransfer,
    CreditCard,
    Check,
    DeferredPayment,
    LetterOfCredit,
    Other
}
