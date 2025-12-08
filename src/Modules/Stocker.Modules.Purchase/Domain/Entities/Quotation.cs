using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Teklif Talebi / RFQ (Request For Quote)
/// </summary>
public class Quotation : TenantAggregateRoot
{
    public string QuotationNumber { get; private set; } = string.Empty;
    public DateTime QuotationDate { get; private set; }
    public DateTime? ValidUntil { get; private set; }
    public QuotationStatus Status { get; private set; }
    public QuotationType Type { get; private set; }

    // Request info
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public QuotationPriority Priority { get; private set; }

    // Requester info
    public Guid? RequesterId { get; private set; }
    public string? RequesterName { get; private set; }
    public Guid? DepartmentId { get; private set; }
    public string? DepartmentName { get; private set; }

    // Source reference
    public Guid? PurchaseRequestId { get; private set; }
    public string? PurchaseRequestNumber { get; private set; }

    // Amounts (calculated from selected quote)
    public decimal? EstimatedAmount { get; private set; }
    public decimal? SelectedAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";

    // Selected quote
    public Guid? SelectedSupplierId { get; private set; }
    public string? SelectedSupplierName { get; private set; }
    public Guid? SelectedQuoteResponseId { get; private set; }

    // Converted to
    public Guid? PurchaseOrderId { get; private set; }
    public string? PurchaseOrderNumber { get; private set; }

    // Notes
    public string? Notes { get; private set; }
    public string? InternalNotes { get; private set; }
    public string? Terms { get; private set; }

    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public DateTime? ClosedDate { get; private set; }
    public string? CancellationReason { get; private set; }

    private readonly List<QuotationItem> _items = new();
    public IReadOnlyCollection<QuotationItem> Items => _items.AsReadOnly();

    private readonly List<QuotationSupplier> _suppliers = new();
    public IReadOnlyCollection<QuotationSupplier> Suppliers => _suppliers.AsReadOnly();

    protected Quotation() : base() { }

    public static Quotation Create(
        string quotationNumber,
        string title,
        Guid tenantId,
        QuotationType type = QuotationType.Standard,
        QuotationPriority priority = QuotationPriority.Normal,
        string currency = "TRY",
        DateTime? validUntil = null)
    {
        var quotation = new Quotation();
        quotation.Id = Guid.NewGuid();
        quotation.SetTenantId(tenantId);
        quotation.QuotationNumber = quotationNumber;
        quotation.Title = title;
        quotation.QuotationDate = DateTime.UtcNow;
        quotation.ValidUntil = validUntil ?? DateTime.UtcNow.AddDays(14);
        quotation.Type = type;
        quotation.Priority = priority;
        quotation.Status = QuotationStatus.Draft;
        quotation.Currency = currency;
        quotation.CreatedAt = DateTime.UtcNow;
        return quotation;
    }

    public void Update(
        string title,
        string? description,
        QuotationType type,
        QuotationPriority priority,
        DateTime? validUntil,
        string? notes,
        string? internalNotes,
        string? terms)
    {
        Title = title;
        Description = description;
        Type = type;
        Priority = priority;
        ValidUntil = validUntil;
        Notes = notes;
        InternalNotes = internalNotes;
        Terms = terms;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRequester(Guid requesterId, string requesterName, Guid? departmentId, string? departmentName)
    {
        RequesterId = requesterId;
        RequesterName = requesterName;
        DepartmentId = departmentId;
        DepartmentName = departmentName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPurchaseRequest(Guid purchaseRequestId, string purchaseRequestNumber)
    {
        PurchaseRequestId = purchaseRequestId;
        PurchaseRequestNumber = purchaseRequestNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddItem(QuotationItem item)
    {
        _items.Add(item);
        CalculateEstimatedAmount();
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
            CalculateEstimatedAmount();
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void ClearItems()
    {
        _items.Clear();
        EstimatedAmount = 0;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddSupplier(QuotationSupplier supplier)
    {
        if (!_suppliers.Any(s => s.SupplierId == supplier.SupplierId))
        {
            _suppliers.Add(supplier);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void RemoveSupplier(Guid supplierId)
    {
        var supplier = _suppliers.FirstOrDefault(s => s.SupplierId == supplierId);
        if (supplier != null)
        {
            _suppliers.Remove(supplier);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    private void CalculateEstimatedAmount()
    {
        EstimatedAmount = _items.Sum(i => i.EstimatedUnitPrice * i.Quantity);
    }

    public void SendToSuppliers()
    {
        if (Status != QuotationStatus.Draft)
            throw new InvalidOperationException("Only draft quotations can be sent.");

        if (!_suppliers.Any())
            throw new InvalidOperationException("At least one supplier must be added.");

        if (!_items.Any())
            throw new InvalidOperationException("At least one item must be added.");

        Status = QuotationStatus.Sent;
        foreach (var supplier in _suppliers)
        {
            supplier.MarkAsSent();
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReceiveQuote(Guid supplierId, decimal totalAmount, DateTime? quoteValidUntil)
    {
        var supplier = _suppliers.FirstOrDefault(s => s.SupplierId == supplierId);
        if (supplier == null)
            throw new InvalidOperationException("Supplier not found in this quotation.");

        supplier.ReceiveQuote(totalAmount, quoteValidUntil);

        if (_suppliers.All(s => s.ResponseStatus == QuotationResponseStatus.Received ||
                                s.ResponseStatus == QuotationResponseStatus.Declined))
        {
            Status = QuotationStatus.QuotesReceived;
        }
        else
        {
            Status = QuotationStatus.PartiallyReceived;
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void SelectSupplier(Guid supplierId, decimal selectedAmount)
    {
        var supplier = _suppliers.FirstOrDefault(s => s.SupplierId == supplierId);
        if (supplier == null)
            throw new InvalidOperationException("Supplier not found in this quotation.");

        if (supplier.ResponseStatus != QuotationResponseStatus.Received)
            throw new InvalidOperationException("Cannot select a supplier that hasn't provided a quote.");

        // Clear previous selection
        foreach (var s in _suppliers)
        {
            s.Deselect();
        }

        supplier.Select();
        SelectedSupplierId = supplierId;
        SelectedSupplierName = supplier.SupplierName;
        SelectedQuoteResponseId = supplier.Id;
        SelectedAmount = selectedAmount;
        Status = QuotationStatus.SupplierSelected;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ConvertToPurchaseOrder(Guid purchaseOrderId, string purchaseOrderNumber)
    {
        if (Status != QuotationStatus.SupplierSelected)
            throw new InvalidOperationException("A supplier must be selected before converting to PO.");

        PurchaseOrderId = purchaseOrderId;
        PurchaseOrderNumber = purchaseOrderNumber;
        Status = QuotationStatus.Converted;
        ClosedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == QuotationStatus.Converted || Status == QuotationStatus.Cancelled)
            throw new InvalidOperationException("Cannot cancel a converted or already cancelled quotation.");

        Status = QuotationStatus.Cancelled;
        CancellationReason = reason;
        ClosedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Close()
    {
        if (Status == QuotationStatus.Cancelled || Status == QuotationStatus.Closed)
            throw new InvalidOperationException("Quotation is already closed or cancelled.");

        Status = QuotationStatus.Closed;
        ClosedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Expire()
    {
        if (ValidUntil.HasValue && ValidUntil.Value < DateTime.UtcNow &&
            Status != QuotationStatus.Converted && Status != QuotationStatus.Cancelled)
        {
            Status = QuotationStatus.Expired;
            ClosedDate = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}

public class QuotationItem : TenantEntity
{
    public Guid QuotationId { get; private set; }
    public Guid? ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Unit { get; private set; } = "Adet";
    public decimal Quantity { get; private set; }
    public decimal EstimatedUnitPrice { get; private set; }
    public string? Specifications { get; private set; }
    public DateTime? RequiredDate { get; private set; }
    public string? Notes { get; private set; }
    public int SortOrder { get; private set; }

    protected QuotationItem() : base() { }

    public static QuotationItem Create(
        Guid quotationId,
        Guid tenantId,
        string productCode,
        string productName,
        decimal quantity,
        string unit = "Adet",
        decimal estimatedUnitPrice = 0,
        Guid? productId = null,
        string? description = null,
        string? specifications = null,
        DateTime? requiredDate = null,
        int sortOrder = 0)
    {
        var item = new QuotationItem();
        item.Id = Guid.NewGuid();
        item.SetTenantId(tenantId);
        item.QuotationId = quotationId;
        item.ProductId = productId;
        item.ProductCode = productCode;
        item.ProductName = productName;
        item.Description = description;
        item.Unit = unit;
        item.Quantity = quantity;
        item.EstimatedUnitPrice = estimatedUnitPrice;
        item.Specifications = specifications;
        item.RequiredDate = requiredDate;
        item.SortOrder = sortOrder;
        return item;
    }

    public void Update(
        string productCode,
        string productName,
        string? description,
        string unit,
        decimal quantity,
        decimal estimatedUnitPrice,
        string? specifications,
        DateTime? requiredDate)
    {
        ProductCode = productCode;
        ProductName = productName;
        Description = description;
        Unit = unit;
        Quantity = quantity;
        EstimatedUnitPrice = estimatedUnitPrice;
        Specifications = specifications;
        RequiredDate = requiredDate;
    }
}

public class QuotationSupplier : TenantEntity
{
    public Guid QuotationId { get; private set; }
    public Guid SupplierId { get; private set; }
    public string SupplierCode { get; private set; } = string.Empty;
    public string SupplierName { get; private set; } = string.Empty;
    public string? SupplierEmail { get; private set; }
    public string? ContactPerson { get; private set; }

    // Request tracking
    public DateTime? SentDate { get; private set; }
    public DateTime? ReminderSentDate { get; private set; }
    public int ReminderCount { get; private set; }

    // Response
    public QuotationResponseStatus ResponseStatus { get; private set; }
    public DateTime? ResponseDate { get; private set; }
    public decimal? QuotedAmount { get; private set; }
    public DateTime? QuoteValidUntil { get; private set; }
    public string? ResponseNotes { get; private set; }
    public string? DeclineReason { get; private set; }

    // Selection
    public bool IsSelected { get; private set; }
    public DateTime? SelectionDate { get; private set; }
    public string? SelectionReason { get; private set; }

    // Quote details (for detailed responses)
    private readonly List<QuotationSupplierItem> _responseItems = new();
    public IReadOnlyCollection<QuotationSupplierItem> ResponseItems => _responseItems.AsReadOnly();

    protected QuotationSupplier() : base() { }

    public static QuotationSupplier Create(
        Guid quotationId,
        Guid supplierId,
        string supplierCode,
        string supplierName,
        Guid tenantId,
        string? supplierEmail = null,
        string? contactPerson = null)
    {
        var supplier = new QuotationSupplier();
        supplier.Id = Guid.NewGuid();
        supplier.SetTenantId(tenantId);
        supplier.QuotationId = quotationId;
        supplier.SupplierId = supplierId;
        supplier.SupplierCode = supplierCode;
        supplier.SupplierName = supplierName;
        supplier.SupplierEmail = supplierEmail;
        supplier.ContactPerson = contactPerson;
        supplier.ResponseStatus = QuotationResponseStatus.Pending;
        supplier.ReminderCount = 0;
        return supplier;
    }

    public void MarkAsSent()
    {
        SentDate = DateTime.UtcNow;
        ResponseStatus = QuotationResponseStatus.Sent;
    }

    public void SendReminder()
    {
        ReminderSentDate = DateTime.UtcNow;
        ReminderCount++;
    }

    public void ReceiveQuote(decimal quotedAmount, DateTime? validUntil, string? notes = null)
    {
        QuotedAmount = quotedAmount;
        QuoteValidUntil = validUntil;
        ResponseNotes = notes;
        ResponseDate = DateTime.UtcNow;
        ResponseStatus = QuotationResponseStatus.Received;
    }

    public void Decline(string? reason = null)
    {
        ResponseStatus = QuotationResponseStatus.Declined;
        DeclineReason = reason;
        ResponseDate = DateTime.UtcNow;
    }

    public void Select(string? reason = null)
    {
        IsSelected = true;
        SelectionDate = DateTime.UtcNow;
        SelectionReason = reason;
    }

    public void Deselect()
    {
        IsSelected = false;
        SelectionDate = null;
        SelectionReason = null;
    }

    public void AddResponseItem(QuotationSupplierItem item)
    {
        _responseItems.Add(item);
    }

    public void ClearResponseItems()
    {
        _responseItems.Clear();
    }
}

public class QuotationSupplierItem : TenantEntity
{
    public Guid QuotationSupplierId { get; private set; }
    public Guid QuotationItemId { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal? DiscountRate { get; private set; }
    public decimal? DiscountAmount { get; private set; }
    public decimal VatRate { get; private set; }
    public decimal TotalAmount { get; private set; }
    public int? LeadTimeDays { get; private set; }
    public string? Notes { get; private set; }
    public bool IsAvailable { get; private set; }

    protected QuotationSupplierItem() : base() { }

    public static QuotationSupplierItem Create(
        Guid quotationSupplierId,
        Guid quotationItemId,
        Guid tenantId,
        decimal unitPrice,
        decimal quantity,
        decimal vatRate = 20,
        decimal? discountRate = null,
        int? leadTimeDays = null,
        bool isAvailable = true)
    {
        var item = new QuotationSupplierItem();
        item.Id = Guid.NewGuid();
        item.SetTenantId(tenantId);
        item.QuotationSupplierId = quotationSupplierId;
        item.QuotationItemId = quotationItemId;
        item.UnitPrice = unitPrice;
        item.Quantity = quantity;
        item.VatRate = vatRate;
        item.DiscountRate = discountRate;
        item.LeadTimeDays = leadTimeDays;
        item.IsAvailable = isAvailable;
        item.CalculateTotal();
        return item;
    }

    private void CalculateTotal()
    {
        var subTotal = UnitPrice * Quantity;
        DiscountAmount = DiscountRate.HasValue ? subTotal * (DiscountRate.Value / 100) : 0;
        var afterDiscount = subTotal - (DiscountAmount ?? 0);
        var vatAmount = afterDiscount * (VatRate / 100);
        TotalAmount = afterDiscount + vatAmount;
    }
}

// Enums
public enum QuotationStatus
{
    Draft,
    Sent,
    PartiallyReceived,
    QuotesReceived,
    SupplierSelected,
    Converted,
    Expired,
    Cancelled,
    Closed
}

public enum QuotationType
{
    Standard,
    Urgent,
    Framework,
    Spot
}

public enum QuotationPriority
{
    Low,
    Normal,
    High,
    Urgent
}

public enum QuotationResponseStatus
{
    Pending,
    Sent,
    Received,
    Declined,
    Expired
}
