using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

public class PurchaseInvoice : TenantAggregateRoot
{
    public string InvoiceNumber { get; private set; } = string.Empty;
    public string? SupplierInvoiceNumber { get; private set; }
    public DateTime InvoiceDate { get; private set; }
    public DateTime? DueDate { get; private set; }
    public Guid SupplierId { get; private set; }
    public string? SupplierName { get; private set; }
    public string? SupplierTaxNumber { get; private set; }
    public PurchaseInvoiceStatus Status { get; private set; }
    public PurchaseInvoiceType Type { get; private set; }

    // References
    public Guid? PurchaseOrderId { get; private set; }
    public string? PurchaseOrderNumber { get; private set; }
    public Guid? GoodsReceiptId { get; private set; }
    public string? GoodsReceiptNumber { get; private set; }

    // Amounts
    public decimal SubTotal { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal DiscountRate { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal WithholdingTaxAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public decimal PaidAmount { get; private set; }
    public decimal RemainingAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; }

    // Payment
    public int PaymentTermDays { get; private set; }
    public bool IsFullyPaid { get; private set; }
    public DateTime? LastPaymentDate { get; private set; }

    // E-Invoice (e-Fatura)
    public bool IsEInvoice { get; private set; }
    public string? EInvoiceId { get; private set; }
    public string? EInvoiceUUID { get; private set; }
    public EInvoiceStatus? EInvoiceStatus { get; private set; }
    public DateTime? EInvoiceDate { get; private set; }

    // Approval
    public bool RequiresApproval { get; private set; }
    public Guid? ApprovedById { get; private set; }
    public string? ApprovedByName { get; private set; }
    public DateTime? ApprovalDate { get; private set; }

    // Notes
    public string? Notes { get; private set; }
    public string? InternalNotes { get; private set; }

    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<PurchaseInvoiceItem> _items = new();
    public IReadOnlyCollection<PurchaseInvoiceItem> Items => _items.AsReadOnly();

    protected PurchaseInvoice() : base() { }

    public static PurchaseInvoice Create(
        string invoiceNumber,
        Guid supplierId,
        string? supplierName,
        Guid tenantId,
        PurchaseInvoiceType type = PurchaseInvoiceType.Standard,
        string currency = "TRY")
    {
        var invoice = new PurchaseInvoice();
        invoice.Id = Guid.NewGuid();
        invoice.SetTenantId(tenantId);
        invoice.InvoiceNumber = invoiceNumber;
        invoice.InvoiceDate = DateTime.UtcNow;
        invoice.SupplierId = supplierId;
        invoice.SupplierName = supplierName;
        invoice.Type = type;
        invoice.Status = PurchaseInvoiceStatus.Draft;
        invoice.Currency = currency;
        invoice.ExchangeRate = 1;
        invoice.SubTotal = 0;
        invoice.DiscountAmount = 0;
        invoice.DiscountRate = 0;
        invoice.VatAmount = 0;
        invoice.WithholdingTaxAmount = 0;
        invoice.TotalAmount = 0;
        invoice.PaidAmount = 0;
        invoice.RemainingAmount = 0;
        invoice.PaymentTermDays = 30;
        invoice.IsFullyPaid = false;
        invoice.IsEInvoice = false;
        invoice.RequiresApproval = false;
        invoice.CreatedAt = DateTime.UtcNow;
        return invoice;
    }

    public void AddItem(PurchaseInvoiceItem item)
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
        var itemDiscounts = _items.Sum(i => i.DiscountAmount);
        var orderDiscount = SubTotal * DiscountRate / 100;
        DiscountAmount = itemDiscounts + orderDiscount;
        TotalAmount = SubTotal + VatAmount - orderDiscount - WithholdingTaxAmount;
        RemainingAmount = TotalAmount - PaidAmount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetSupplierInvoiceNumber(string supplierInvoiceNumber)
    {
        SupplierInvoiceNumber = supplierInvoiceNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetInvoiceDate(DateTime invoiceDate)
    {
        InvoiceDate = invoiceDate;
        if (PaymentTermDays > 0)
            DueDate = invoiceDate.AddDays(PaymentTermDays);
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDueDate(DateTime dueDate)
    {
        DueDate = dueDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPaymentTerms(int days)
    {
        PaymentTermDays = days;
        DueDate = InvoiceDate.AddDays(days);
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetWithholdingTax(decimal amount)
    {
        WithholdingTaxAmount = amount;
        RecalculateTotals();
    }

    public void ApplyDiscount(decimal discountRate)
    {
        if (discountRate < 0 || discountRate > 100)
            throw new ArgumentException("Discount rate must be between 0 and 100");
        DiscountRate = discountRate;
        RecalculateTotals();
    }

    public void SetExchangeRate(decimal rate)
    {
        if (rate <= 0)
            throw new ArgumentException("Exchange rate must be greater than 0");
        ExchangeRate = rate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToPurchaseOrder(Guid orderId, string? orderNumber)
    {
        PurchaseOrderId = orderId;
        PurchaseOrderNumber = orderNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToGoodsReceipt(Guid receiptId, string? receiptNumber)
    {
        GoodsReceiptId = receiptId;
        GoodsReceiptNumber = receiptNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetEInvoiceInfo(string eInvoiceId, string? uuid)
    {
        IsEInvoice = true;
        EInvoiceId = eInvoiceId;
        EInvoiceUUID = uuid;
        EInvoiceStatus = Purchase.Domain.Entities.EInvoiceStatus.Received;
        EInvoiceDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetNotes(string? notes, string? internalNotes)
    {
        Notes = notes;
        InternalNotes = internalNotes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Submit()
    {
        if (Status != PurchaseInvoiceStatus.Draft)
            throw new InvalidOperationException("Only draft invoices can be submitted");

        if (!_items.Any())
            throw new InvalidOperationException("Cannot submit an invoice without items");

        Status = RequiresApproval ? PurchaseInvoiceStatus.PendingApproval : PurchaseInvoiceStatus.Approved;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedById, string? approvedByName)
    {
        if (Status != PurchaseInvoiceStatus.PendingApproval)
            throw new InvalidOperationException("Only pending approval invoices can be approved");

        Status = PurchaseInvoiceStatus.Approved;
        ApprovedById = approvedById;
        ApprovedByName = approvedByName;
        ApprovalDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        if (Status != PurchaseInvoiceStatus.PendingApproval)
            throw new InvalidOperationException("Only pending approval invoices can be rejected");

        Status = PurchaseInvoiceStatus.Rejected;
        InternalNotes = $"Rejected: {reason}. {InternalNotes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordPayment(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Payment amount must be greater than 0");

        PaidAmount += amount;
        RemainingAmount = TotalAmount - PaidAmount;
        IsFullyPaid = RemainingAmount <= 0;
        LastPaymentDate = DateTime.UtcNow;

        if (IsFullyPaid)
            Status = PurchaseInvoiceStatus.Paid;
        else if (PaidAmount > 0)
            Status = PurchaseInvoiceStatus.PartiallyPaid;

        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == PurchaseInvoiceStatus.Paid || Status == PurchaseInvoiceStatus.Cancelled)
            throw new InvalidOperationException("Cannot cancel a paid or already cancelled invoice");

        Status = PurchaseInvoiceStatus.Cancelled;
        InternalNotes = $"Cancelled: {reason}. {InternalNotes}";
        UpdatedAt = DateTime.UtcNow;
    }
}

public class PurchaseInvoiceItem : TenantAggregateRoot
{
    public Guid PurchaseInvoiceId { get; private set; }
    public Guid? PurchaseOrderItemId { get; private set; }
    public Guid? GoodsReceiptItemId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string Unit { get; private set; } = "Adet";
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal DiscountRate { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal VatRate { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal SubTotal { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string? Description { get; private set; }
    public int LineNumber { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual PurchaseInvoice PurchaseInvoice { get; private set; } = null!;

    protected PurchaseInvoiceItem() : base() { }

    public static PurchaseInvoiceItem Create(
        Guid purchaseInvoiceId,
        Guid productId,
        string productCode,
        string productName,
        string unit,
        decimal quantity,
        decimal unitPrice,
        decimal vatRate,
        int lineNumber,
        Guid tenantId)
    {
        var item = new PurchaseInvoiceItem();
        item.Id = Guid.NewGuid();
        item.SetTenantId(tenantId);
        item.PurchaseInvoiceId = purchaseInvoiceId;
        item.ProductId = productId;
        item.ProductCode = productCode;
        item.ProductName = productName;
        item.Unit = unit;
        item.Quantity = quantity;
        item.UnitPrice = unitPrice;
        item.VatRate = vatRate;
        item.LineNumber = lineNumber;
        item.DiscountRate = 0;
        item.CreatedAt = DateTime.UtcNow;
        item.CalculateAmounts();
        return item;
    }

    public void Update(decimal quantity, decimal unitPrice, decimal vatRate, decimal discountRate)
    {
        Quantity = quantity;
        UnitPrice = unitPrice;
        VatRate = vatRate;
        DiscountRate = discountRate;
        CalculateAmounts();
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToPurchaseOrderItem(Guid? purchaseOrderItemId)
    {
        PurchaseOrderItemId = purchaseOrderItemId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkToGoodsReceiptItem(Guid? goodsReceiptItemId)
    {
        GoodsReceiptItemId = goodsReceiptItemId;
        UpdatedAt = DateTime.UtcNow;
    }

    private void CalculateAmounts()
    {
        SubTotal = UnitPrice * Quantity;
        DiscountAmount = SubTotal * DiscountRate / 100;
        var discountedAmount = SubTotal - DiscountAmount;
        VatAmount = discountedAmount * VatRate / 100;
        TotalAmount = discountedAmount + VatAmount;
    }
}

public enum PurchaseInvoiceStatus
{
    Draft,
    PendingApproval,
    Approved,
    Rejected,
    PartiallyPaid,
    Paid,
    Cancelled
}

public enum PurchaseInvoiceType
{
    Standard,
    Credit,
    Debit,
    Proforma,
    Advance
}

public enum EInvoiceStatus
{
    Pending,
    Received,
    Accepted,
    Rejected,
    Cancelled
}
