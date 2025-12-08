using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Auto-generated reorder suggestion for purchase orders
/// </summary>
public class ReorderSuggestion : BaseEntity
{
    public DateTime GeneratedAt { get; private set; }

    // Product Info
    public int ProductId { get; private set; }
    public int? WarehouseId { get; private set; }

    // Current Stock Status
    public decimal CurrentStock { get; private set; }
    public decimal AvailableStock { get; private set; }
    public decimal MinStockLevel { get; private set; }
    public decimal ReorderLevel { get; private set; }

    // Suggestion Details
    public decimal SuggestedQuantity { get; private set; }
    public Money EstimatedCost { get; private set; } = default!;
    public int? SuggestedSupplierId { get; private set; }

    // Trigger Info
    public int? TriggeredByRuleId { get; private set; }
    public string TriggerReason { get; private set; } = default!;
    public int? EstimatedDaysUntilStockout { get; private set; }
    public DateTime? ExpectedStockoutDate { get; private set; }

    // Status
    public ReorderSuggestionStatus Status { get; private set; }
    public string? StatusReason { get; private set; }
    public int? ProcessedByUserId { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public int? PurchaseOrderId { get; private set; }

    // Validity
    public DateTime ExpiresAt { get; private set; }

    // Navigation Properties
    public virtual Product Product { get; private set; } = default!;
    public virtual Warehouse? Warehouse { get; private set; }
    public virtual Supplier? SuggestedSupplier { get; private set; }
    public virtual ReorderRule? TriggeredByRule { get; private set; }

    protected ReorderSuggestion() { }

    public ReorderSuggestion(
        int productId,
        decimal suggestedQuantity,
        Money estimatedCost,
        string triggerReason,
        int? warehouseId = null,
        int? suggestedSupplierId = null,
        int? triggeredByRuleId = null,
        int? estimatedDaysUntilStockout = null,
        DateTime? expectedStockoutDate = null,
        int expiryDays = 7)
    {
        GeneratedAt = DateTime.UtcNow;
        ProductId = productId;
        WarehouseId = warehouseId;
        SuggestedQuantity = suggestedQuantity;
        EstimatedCost = estimatedCost;
        SuggestedSupplierId = suggestedSupplierId;
        TriggeredByRuleId = triggeredByRuleId;
        TriggerReason = triggerReason;
        EstimatedDaysUntilStockout = estimatedDaysUntilStockout;
        ExpectedStockoutDate = expectedStockoutDate;
        Status = ReorderSuggestionStatus.Pending;
        ExpiresAt = DateTime.UtcNow.AddDays(expiryDays);
    }

    public void SetStockInfo(decimal currentStock, decimal availableStock, decimal minStockLevel, decimal reorderLevel)
    {
        CurrentStock = currentStock;
        AvailableStock = availableStock;
        MinStockLevel = minStockLevel;
        ReorderLevel = reorderLevel;
    }

    public void Approve(int userId, decimal? adjustedQuantity = null, int? alternateSupplierId = null, string? reason = null)
    {
        Status = ReorderSuggestionStatus.Approved;
        StatusReason = reason;
        ProcessedByUserId = userId;
        ProcessedAt = DateTime.UtcNow;

        if (adjustedQuantity.HasValue)
            SuggestedQuantity = adjustedQuantity.Value;

        if (alternateSupplierId.HasValue)
            SuggestedSupplierId = alternateSupplierId.Value;
    }

    public void Reject(int userId, string reason)
    {
        Status = ReorderSuggestionStatus.Rejected;
        StatusReason = reason;
        ProcessedByUserId = userId;
        ProcessedAt = DateTime.UtcNow;
    }

    public void MarkAsOrdered(int purchaseOrderId)
    {
        Status = ReorderSuggestionStatus.Ordered;
        PurchaseOrderId = purchaseOrderId;
    }

    public void Expire()
    {
        if (Status == ReorderSuggestionStatus.Pending)
        {
            Status = ReorderSuggestionStatus.Expired;
        }
    }

    public bool IsExpired => DateTime.UtcNow > ExpiresAt && Status == ReorderSuggestionStatus.Pending;
}
