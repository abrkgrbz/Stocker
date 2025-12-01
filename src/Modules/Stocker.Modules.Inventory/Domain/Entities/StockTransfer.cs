using Stocker.SharedKernel.Common;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Stock transfer between warehouses or locations
/// Tracks the movement of inventory from one place to another
/// </summary>
public class StockTransfer : BaseEntity
{
    public string TransferNumber { get; private set; }
    public DateTime TransferDate { get; private set; }
    public int SourceWarehouseId { get; private set; }
    public int DestinationWarehouseId { get; private set; }
    public TransferStatus Status { get; private set; }
    public TransferType TransferType { get; private set; }
    public string? Description { get; private set; }
    public string? Notes { get; private set; }
    public DateTime? ExpectedArrivalDate { get; private set; }
    public DateTime? ShippedDate { get; private set; }
    public DateTime? ReceivedDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public DateTime? CancelledDate { get; private set; }
    public string? CancellationReason { get; private set; }
    public int CreatedByUserId { get; private set; }
    public int? ApprovedByUserId { get; private set; }
    public int? ShippedByUserId { get; private set; }
    public int? ReceivedByUserId { get; private set; }

    public virtual Warehouse SourceWarehouse { get; private set; }
    public virtual Warehouse DestinationWarehouse { get; private set; }
    public virtual ICollection<StockTransferItem> Items { get; private set; }

    protected StockTransfer() { }

    public StockTransfer(
        string transferNumber,
        DateTime transferDate,
        int sourceWarehouseId,
        int destinationWarehouseId,
        TransferType transferType,
        int createdByUserId)
    {
        TransferNumber = transferNumber;
        TransferDate = transferDate;
        SourceWarehouseId = sourceWarehouseId;
        DestinationWarehouseId = destinationWarehouseId;
        TransferType = transferType;
        Status = TransferStatus.Draft;
        CreatedByUserId = createdByUserId;
        Items = new List<StockTransferItem>();
    }

    public void SetDescription(string? description)
    {
        Description = description;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void SetExpectedArrival(DateTime? expectedArrivalDate)
    {
        ExpectedArrivalDate = expectedArrivalDate;
    }

    public StockTransferItem AddItem(
        int productId,
        decimal requestedQuantity,
        int? sourceLocationId = null,
        int? destinationLocationId = null)
    {
        if (Status != TransferStatus.Draft)
            throw new InvalidOperationException("Can only add items to draft transfers");

        var item = new StockTransferItem(
            Id,
            productId,
            requestedQuantity,
            sourceLocationId,
            destinationLocationId);

        Items.Add(item);
        return item;
    }

    public void RemoveItem(int itemId)
    {
        if (Status != TransferStatus.Draft)
            throw new InvalidOperationException("Can only remove items from draft transfers");

        var item = Items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            Items.Remove(item);
        }
    }

    public void Submit()
    {
        if (Status != TransferStatus.Draft)
            throw new InvalidOperationException("Can only submit draft transfers");

        if (!Items.Any())
            throw new InvalidOperationException("Cannot submit transfer without items");

        Status = TransferStatus.Pending;
    }

    public void Approve(int approvedByUserId)
    {
        if (Status != TransferStatus.Pending)
            throw new InvalidOperationException("Can only approve pending transfers");

        Status = TransferStatus.Approved;
        ApprovedByUserId = approvedByUserId;
    }

    public void Reject(int rejectedByUserId, string? reason = null)
    {
        if (Status != TransferStatus.Pending)
            throw new InvalidOperationException("Can only reject pending transfers");

        Status = TransferStatus.Rejected;
        CancellationReason = reason;
    }

    public void Ship(int shippedByUserId)
    {
        if (Status != TransferStatus.Approved)
            throw new InvalidOperationException("Can only ship approved transfers");

        Status = TransferStatus.InTransit;
        ShippedDate = DateTime.UtcNow;
        ShippedByUserId = shippedByUserId;

        // Mark all items as shipped
        foreach (var item in Items)
        {
            item.Ship(item.RequestedQuantity);
        }
    }

    public void Receive(int receivedByUserId)
    {
        if (Status != TransferStatus.InTransit)
            throw new InvalidOperationException("Can only receive in-transit transfers");

        Status = TransferStatus.Received;
        ReceivedDate = DateTime.UtcNow;
        ReceivedByUserId = receivedByUserId;
    }

    public void Complete()
    {
        if (Status != TransferStatus.Received)
            throw new InvalidOperationException("Can only complete received transfers");

        // Check if all items are fully received
        if (Items.Any(i => i.ReceivedQuantity < i.ShippedQuantity))
            Status = TransferStatus.PartiallyReceived;
        else
            Status = TransferStatus.Completed;

        CompletedDate = DateTime.UtcNow;
    }

    public void Cancel(string? reason = null)
    {
        if (Status == TransferStatus.Completed || Status == TransferStatus.Cancelled)
            throw new InvalidOperationException("Cannot cancel completed or already cancelled transfers");

        Status = TransferStatus.Cancelled;
        CancelledDate = DateTime.UtcNow;
        CancellationReason = reason;
    }

    public decimal GetTotalRequestedQuantity() => Items.Sum(i => i.RequestedQuantity);
    public decimal GetTotalShippedQuantity() => Items.Sum(i => i.ShippedQuantity);
    public decimal GetTotalReceivedQuantity() => Items.Sum(i => i.ReceivedQuantity);
}

/// <summary>
/// Individual item in a stock transfer
/// </summary>
public class StockTransferItem : BaseEntity
{
    public int StockTransferId { get; private set; }
    public int ProductId { get; private set; }
    public int? SourceLocationId { get; private set; }
    public int? DestinationLocationId { get; private set; }
    public decimal RequestedQuantity { get; private set; }
    public decimal ShippedQuantity { get; private set; }
    public decimal ReceivedQuantity { get; private set; }
    public decimal DamagedQuantity { get; private set; }
    public string? SerialNumber { get; private set; }
    public string? LotNumber { get; private set; }
    public string? Notes { get; private set; }

    public virtual StockTransfer StockTransfer { get; private set; }
    public virtual Product Product { get; private set; }
    public virtual Location? SourceLocation { get; private set; }
    public virtual Location? DestinationLocation { get; private set; }

    protected StockTransferItem() { }

    public StockTransferItem(
        int stockTransferId,
        int productId,
        decimal requestedQuantity,
        int? sourceLocationId = null,
        int? destinationLocationId = null)
    {
        StockTransferId = stockTransferId;
        ProductId = productId;
        RequestedQuantity = requestedQuantity;
        SourceLocationId = sourceLocationId;
        DestinationLocationId = destinationLocationId;
        ShippedQuantity = 0;
        ReceivedQuantity = 0;
        DamagedQuantity = 0;
    }

    public void UpdateRequestedQuantity(decimal quantity)
    {
        if (ShippedQuantity > 0)
            throw new InvalidOperationException("Cannot update requested quantity after shipping");

        RequestedQuantity = quantity;
    }

    public void SetSerialNumber(string? serialNumber)
    {
        SerialNumber = serialNumber;
    }

    public void SetLotNumber(string? lotNumber)
    {
        LotNumber = lotNumber;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void Ship(decimal quantity)
    {
        if (quantity > RequestedQuantity)
            throw new InvalidOperationException("Cannot ship more than requested quantity");

        ShippedQuantity = quantity;
    }

    public void Receive(decimal quantity, decimal damagedQuantity = 0)
    {
        if (quantity + damagedQuantity > ShippedQuantity)
            throw new InvalidOperationException("Received + damaged cannot exceed shipped quantity");

        ReceivedQuantity = quantity;
        DamagedQuantity = damagedQuantity;
    }
}
