using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

public class PurchaseRequest : TenantAggregateRoot
{
    public string RequestNumber { get; private set; } = string.Empty;
    public DateTime RequestDate { get; private set; }
    public Guid RequestedById { get; private set; }
    public string? RequestedByName { get; private set; }
    public Guid? DepartmentId { get; private set; }
    public string? DepartmentName { get; private set; }
    public PurchaseRequestStatus Status { get; private set; }
    public PurchaseRequestPriority Priority { get; private set; }
    public DateTime? RequiredDate { get; private set; }
    public string? Purpose { get; private set; }
    public string? Notes { get; private set; }
    public decimal TotalEstimatedAmount { get; private set; }
    public decimal EstimatedTotalAmount => TotalEstimatedAmount;
    public string Currency { get; private set; } = "TRY";

    // Approval workflow
    public Guid? ApprovedById { get; private set; }
    public string? ApprovedByName { get; private set; }
    public DateTime? ApprovalDate { get; private set; }
    public string? ApprovalNotes { get; private set; }
    public Guid? RejectedById { get; private set; }
    public string? RejectedByName { get; private set; }
    public DateTime? RejectionDate { get; private set; }
    public string? RejectionReason { get; private set; }

    // Linked PO
    public Guid? PurchaseOrderId { get; private set; }

    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<PurchaseRequestItem> _items = new();
    public IReadOnlyCollection<PurchaseRequestItem> Items => _items.AsReadOnly();

    protected PurchaseRequest() : base() { }

    public static PurchaseRequest Create(
        string requestNumber,
        Guid requestedById,
        string? requestedByName,
        Guid tenantId,
        Guid? departmentId = null,
        string? departmentName = null,
        string? purpose = null)
    {
        var request = new PurchaseRequest();
        request.Id = Guid.NewGuid();
        request.SetTenantId(tenantId);
        request.RequestNumber = requestNumber;
        request.RequestDate = DateTime.UtcNow;
        request.RequestedById = requestedById;
        request.RequestedByName = requestedByName;
        request.DepartmentId = departmentId;
        request.DepartmentName = departmentName;
        request.Purpose = purpose;
        request.Status = PurchaseRequestStatus.Draft;
        request.Priority = PurchaseRequestPriority.Normal;
        request.Currency = "TRY";
        request.TotalEstimatedAmount = 0;
        request.CreatedAt = DateTime.UtcNow;
        return request;
    }

    public void AddItem(PurchaseRequestItem item)
    {
        _items.Add(item);
        RecalculateTotal();
    }

    public void RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
            RecalculateTotal();
        }
    }

    public void UpdateItem(Guid itemId, decimal quantity, decimal? estimatedPrice)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            item.Update(quantity, estimatedPrice);
            RecalculateTotal();
        }
    }

    private void RecalculateTotal()
    {
        TotalEstimatedAmount = _items.Sum(i => i.EstimatedAmount);
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPriority(PurchaseRequestPriority priority)
    {
        Priority = priority;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRequiredDate(DateTime? requiredDate)
    {
        RequiredDate = requiredDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Submit()
    {
        if (Status != PurchaseRequestStatus.Draft)
            throw new InvalidOperationException("Only draft requests can be submitted");

        if (!_items.Any())
            throw new InvalidOperationException("Cannot submit a request without items");

        Status = PurchaseRequestStatus.Pending;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedById, string? approvedByName, string? notes = null)
    {
        if (Status != PurchaseRequestStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be approved");

        Status = PurchaseRequestStatus.Approved;
        ApprovedById = approvedById;
        ApprovedByName = approvedByName;
        ApprovalDate = DateTime.UtcNow;
        ApprovalNotes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(Guid rejectedById, string? rejectedByName, string reason)
    {
        if (Status != PurchaseRequestStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be rejected");

        Status = PurchaseRequestStatus.Rejected;
        RejectedById = rejectedById;
        RejectedByName = rejectedByName;
        RejectionDate = DateTime.UtcNow;
        RejectionReason = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == PurchaseRequestStatus.Completed || Status == PurchaseRequestStatus.Cancelled)
            throw new InvalidOperationException("Cannot cancel a completed or already cancelled request");

        Status = PurchaseRequestStatus.Cancelled;
        Notes = $"Cancelled: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void ConvertToPurchaseOrder(Guid purchaseOrderId)
    {
        if (Status != PurchaseRequestStatus.Approved)
            throw new InvalidOperationException("Only approved requests can be converted to purchase orders");

        Status = PurchaseRequestStatus.Converted;
        PurchaseOrderId = purchaseOrderId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsCompleted()
    {
        Status = PurchaseRequestStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }
}

public class PurchaseRequestItem : TenantAggregateRoot
{
    public Guid PurchaseRequestId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string Unit { get; private set; } = "Adet";
    public decimal Quantity { get; private set; }
    public decimal? EstimatedUnitPrice { get; private set; }
    public decimal EstimatedAmount { get; private set; }
    public Guid? PreferredSupplierId { get; private set; }
    public string? PreferredSupplierName { get; private set; }
    public string? Specification { get; private set; }
    public string? Notes { get; private set; }
    public int LineNumber { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual PurchaseRequest PurchaseRequest { get; private set; } = null!;

    protected PurchaseRequestItem() : base() { }

    public static PurchaseRequestItem Create(
        Guid purchaseRequestId,
        Guid productId,
        string productCode,
        string productName,
        string unit,
        decimal quantity,
        decimal? estimatedUnitPrice,
        int lineNumber,
        Guid tenantId)
    {
        var item = new PurchaseRequestItem();
        item.Id = Guid.NewGuid();
        item.SetTenantId(tenantId);
        item.PurchaseRequestId = purchaseRequestId;
        item.ProductId = productId;
        item.ProductCode = productCode;
        item.ProductName = productName;
        item.Unit = unit;
        item.Quantity = quantity;
        item.EstimatedUnitPrice = estimatedUnitPrice;
        item.LineNumber = lineNumber;
        item.CreatedAt = DateTime.UtcNow;
        item.CalculateAmount();
        return item;
    }

    public void Update(decimal quantity, decimal? estimatedUnitPrice)
    {
        Quantity = quantity;
        EstimatedUnitPrice = estimatedUnitPrice;
        CalculateAmount();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPreferredSupplier(Guid? supplierId, string? supplierName)
    {
        PreferredSupplierId = supplierId;
        PreferredSupplierName = supplierName;
        UpdatedAt = DateTime.UtcNow;
    }

    private void CalculateAmount()
    {
        EstimatedAmount = EstimatedUnitPrice.HasValue ? Quantity * EstimatedUnitPrice.Value : 0;
    }
}

public enum PurchaseRequestStatus
{
    Draft,
    Pending,
    Approved,
    Rejected,
    Converted,
    Completed,
    Cancelled
}

public enum PurchaseRequestPriority
{
    Low,
    Normal,
    High,
    Urgent
}
