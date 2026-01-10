using Stocker.SharedKernel.Common;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Physical stock counting/inventory reconciliation
/// Used for periodic inventory audits and cycle counting
/// </summary>
public class StockCount : BaseEntity
{
    public string CountNumber { get; private set; }
    public DateTime CountDate { get; private set; }
    public int WarehouseId { get; private set; }
    public int? LocationId { get; private set; }
    public StockCountType CountType { get; private set; }
    public StockCountStatus Status { get; private set; }
    public string? Description { get; private set; }
    public string? Notes { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public string? CancellationReason { get; private set; }
    public int CreatedByUserId { get; private set; }
    public int? CountedByUserId { get; private set; }
    public int? ApprovedByUserId { get; private set; }
    public bool AutoAdjust { get; private set; }

    public virtual Warehouse Warehouse { get; private set; }
    public virtual Location? Location { get; private set; }
    public virtual ICollection<StockCountItem> Items { get; private set; }

    protected StockCount() { }

    public StockCount(
        string countNumber,
        DateTime countDate,
        int warehouseId,
        StockCountType countType,
        int createdByUserId)
    {
        CountNumber = countNumber;
        CountDate = countDate;
        WarehouseId = warehouseId;
        CountType = countType;
        Status = StockCountStatus.Draft;
        CreatedByUserId = createdByUserId;
        AutoAdjust = false;
        Items = new List<StockCountItem>();
    }

    /// <summary>
    /// Stok sayımı oluşturulduktan sonra domain event fırlatır.
    /// </summary>
    public void RaiseCreatedEvent()
    {
        RaiseDomainEvent(new StockCountCreatedDomainEvent(
            Id,
            TenantId,
            CountNumber,
            WarehouseId,
            CountType.ToString(),
            Items.Count));
    }

    public void SetLocation(int? locationId)
    {
        if (Status != StockCountStatus.Draft)
            throw new InvalidOperationException("Can only set location for draft counts");

        LocationId = locationId;
    }

    public void SetDescription(string? description)
    {
        Description = description;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void SetAutoAdjust(bool autoAdjust)
    {
        AutoAdjust = autoAdjust;
    }

    public StockCountItem AddItem(int productId, decimal systemQuantity)
    {
        if (Status != StockCountStatus.Draft && Status != StockCountStatus.InProgress)
            throw new InvalidOperationException("Can only add items to draft or in-progress counts");

        var existingItem = Items.FirstOrDefault(i => i.ProductId == productId);
        if (existingItem != null)
            throw new InvalidOperationException("Product already exists in count");

        var item = new StockCountItem(Id, productId, systemQuantity);
        Items.Add(item);
        return item;
    }

    public void RemoveItem(int itemId)
    {
        if (Status != StockCountStatus.Draft)
            throw new InvalidOperationException("Can only remove items from draft counts");

        var item = Items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            Items.Remove(item);
        }
    }

    public void Start(int countedByUserId)
    {
        if (Status != StockCountStatus.Draft)
            throw new InvalidOperationException("Can only start draft counts");

        if (!Items.Any())
            throw new InvalidOperationException("Cannot start count without items");

        Status = StockCountStatus.InProgress;
        StartedAt = DateTime.UtcNow;
        CountedByUserId = countedByUserId;

        RaiseDomainEvent(new StockCountStartedDomainEvent(
            Id,
            TenantId,
            CountNumber,
            WarehouseId,
            countedByUserId,
            StartedAt.Value));
    }

    public void Complete()
    {
        if (Status != StockCountStatus.InProgress)
            throw new InvalidOperationException("Can only complete in-progress counts");

        if (Items.Any(i => !i.IsCounted))
            throw new InvalidOperationException("All items must be counted before completing");

        Status = StockCountStatus.Completed;
        CompletedAt = DateTime.UtcNow;

        RaiseDomainEvent(new StockCountCompletedDomainEvent(
            Id,
            TenantId,
            CountNumber,
            WarehouseId,
            GetTotalSystemQuantity(),
            GetTotalCountedQuantity(),
            GetTotalDifference(),
            GetItemsWithDifferenceCount()));
    }

    public void Approve(int approvedByUserId)
    {
        if (Status != StockCountStatus.Completed)
            throw new InvalidOperationException("Can only approve completed counts");

        Status = StockCountStatus.Approved;
        ApprovedAt = DateTime.UtcNow;
        ApprovedByUserId = approvedByUserId;

        RaiseDomainEvent(new StockCountApprovedDomainEvent(
            Id,
            TenantId,
            CountNumber,
            approvedByUserId,
            ApprovedAt.Value));
    }

    public void Reject(string? reason = null)
    {
        if (Status != StockCountStatus.Completed)
            throw new InvalidOperationException("Can only reject completed counts");

        Status = StockCountStatus.Rejected;
        CancellationReason = reason;

        RaiseDomainEvent(new StockCountRejectedDomainEvent(
            Id,
            TenantId,
            CountNumber,
            reason));
    }

    public void Cancel(string? reason = null)
    {
        if (Status == StockCountStatus.Approved || Status == StockCountStatus.Cancelled || Status == StockCountStatus.Adjusted)
            throw new InvalidOperationException("Cannot cancel approved, adjusted, or already cancelled counts");

        Status = StockCountStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
        CancellationReason = reason;

        RaiseDomainEvent(new StockCountCancelledDomainEvent(
            Id,
            TenantId,
            CountNumber,
            reason,
            CancelledAt.Value));
    }

    public void MarkAsAdjusted()
    {
        if (Status != StockCountStatus.Approved)
            throw new InvalidOperationException("Can only mark approved counts as adjusted");

        Status = StockCountStatus.Adjusted;

        RaiseDomainEvent(new StockCountAdjustedDomainEvent(
            Id,
            TenantId,
            CountNumber,
            WarehouseId,
            GetTotalDifference()));
    }

    public decimal GetTotalSystemQuantity() => Items.Sum(i => i.SystemQuantity);
    public decimal GetTotalCountedQuantity() => Items.Sum(i => i.CountedQuantity ?? 0);
    public decimal GetTotalDifference() => Items.Sum(i => i.Difference);
    public int GetItemsWithDifferenceCount() => Items.Count(i => i.HasDifference);
}

/// <summary>
/// Individual item in a stock count
/// </summary>
public class StockCountItem : BaseEntity
{
    public int StockCountId { get; private set; }
    public int ProductId { get; private set; }
    public int? LocationId { get; private set; }
    public decimal SystemQuantity { get; private set; }
    public decimal? CountedQuantity { get; private set; }
    public decimal Difference => (CountedQuantity ?? 0) - SystemQuantity;
    public bool HasDifference => CountedQuantity.HasValue && CountedQuantity.Value != SystemQuantity;
    public bool IsCounted => CountedQuantity.HasValue;
    public string? SerialNumber { get; private set; }
    public string? LotNumber { get; private set; }
    public string? Notes { get; private set; }
    public DateTime? CountedAt { get; private set; }
    public bool IsAdjusted { get; private set; }

    public virtual StockCount StockCount { get; private set; }
    public virtual Product Product { get; private set; }
    public virtual Location? Location { get; private set; }

    protected StockCountItem() { }

    public StockCountItem(int stockCountId, int productId, decimal systemQuantity)
    {
        StockCountId = stockCountId;
        ProductId = productId;
        SystemQuantity = systemQuantity;
        IsAdjusted = false;
    }

    public void SetLocation(int? locationId)
    {
        LocationId = locationId;
    }

    public void SetSerialNumber(string? serialNumber)
    {
        SerialNumber = serialNumber;
    }

    public void SetLotNumber(string? lotNumber)
    {
        LotNumber = lotNumber;
    }

    public void Count(decimal countedQuantity, string? notes = null)
    {
        CountedQuantity = countedQuantity;
        CountedAt = DateTime.UtcNow;
        Notes = notes;
    }

    public void ClearCount()
    {
        CountedQuantity = null;
        CountedAt = null;
    }

    public void MarkAsAdjusted()
    {
        IsAdjusted = true;
    }
}
