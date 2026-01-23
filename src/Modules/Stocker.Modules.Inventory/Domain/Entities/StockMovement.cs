using Stocker.SharedKernel.Common;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Domain.Entities;

public class StockMovement : BaseEntity
{
    public string DocumentNumber { get; private set; }
    public DateTime MovementDate { get; private set; }
    public int ProductId { get; private set; }
    public int WarehouseId { get; private set; }
    public int? FromLocationId { get; private set; }
    public int? ToLocationId { get; private set; }
    public StockMovementType MovementType { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitCost { get; private set; }
    public decimal TotalCost => Quantity * UnitCost;
    public string? SerialNumber { get; private set; }
    public string? LotNumber { get; private set; }
    public string? ReferenceDocumentType { get; private set; }
    public string? ReferenceDocumentNumber { get; private set; }
    public int? ReferenceDocumentId { get; private set; }
    public string? Description { get; private set; }
    public int UserId { get; private set; }
    public bool IsReversed { get; private set; }
    public int? ReversedMovementId { get; private set; }

    /// <summary>
    /// Monotonically increasing sequence number per product+warehouse combination.
    /// Provides clock-skew-independent ordering of stock movements.
    /// Used instead of MovementDate for determining movement order when clock drift is a concern.
    /// </summary>
    public long SequenceNumber { get; private set; }

    public virtual Product Product { get; private set; }
    public virtual Warehouse Warehouse { get; private set; }
    public virtual Location? FromLocation { get; private set; }
    public virtual Location? ToLocation { get; private set; }
    public virtual StockMovement? ReversedMovement { get; private set; }

    protected StockMovement() { }

    public StockMovement(
        string documentNumber,
        DateTime movementDate,
        int productId,
        int warehouseId,
        StockMovementType movementType,
        decimal quantity,
        decimal unitCost,
        int userId)
    {
        DocumentNumber = documentNumber;
        MovementDate = movementDate;
        ProductId = productId;
        WarehouseId = warehouseId;
        MovementType = movementType;
        Quantity = quantity;
        UnitCost = unitCost;
        UserId = userId;
        IsReversed = false;
    }

    /// <summary>
    /// Stok hareketi oluşturulduktan sonra domain event fırlatır.
    /// Bu metod repository veya application layer tarafından çağrılmalıdır.
    /// </summary>
    public void RaiseCreatedEvent()
    {
        RaiseDomainEvent(new StockMovementCreatedDomainEvent(
            Id,
            TenantId,
            DocumentNumber,
            MovementDate,
            ProductId,
            WarehouseId,
            MovementType,
            Quantity,
            UnitCost,
            TotalCost,
            LotNumber,
            SerialNumber,
            ReferenceDocumentType,
            ReferenceDocumentNumber));
    }

    /// <summary>
    /// Sets the sequence number for clock-skew-independent ordering.
    /// Should be called by the application layer with the next sequence for this product+warehouse.
    /// </summary>
    public void SetSequenceNumber(long sequenceNumber)
    {
        if (sequenceNumber <= 0)
            throw new ArgumentException("Sequence number must be positive", nameof(sequenceNumber));
        SequenceNumber = sequenceNumber;
    }

    public void SetLocations(int? fromLocationId, int? toLocationId)
    {
        FromLocationId = fromLocationId;
        ToLocationId = toLocationId;
    }

    public void SetSerialNumber(string serialNumber)
    {
        SerialNumber = serialNumber;
    }

    public void SetLotNumber(string lotNumber)
    {
        LotNumber = lotNumber;
    }

    public void SetReference(string documentType, string documentNumber, int? documentId = null)
    {
        ReferenceDocumentType = documentType;
        ReferenceDocumentNumber = documentNumber;
        ReferenceDocumentId = documentId;
    }

    public void SetDescription(string description)
    {
        Description = description;
    }

    public void Reverse(int reversedMovementId, string reversedBy, string? reason = null)
    {
        if (IsReversed)
            throw new InvalidOperationException("Movement has already been reversed");

        IsReversed = true;
        ReversedMovementId = reversedMovementId;

        RaiseDomainEvent(new StockMovementReversedDomainEvent(
            Id,
            TenantId,
            DocumentNumber,
            reversedMovementId,
            ProductId,
            WarehouseId,
            MovementType,
            Quantity,
            reversedBy,
            reason));
    }

    public bool IsIncoming()
    {
        return MovementType == StockMovementType.Purchase ||
               MovementType == StockMovementType.SalesReturn ||
               MovementType == StockMovementType.Transfer && ToLocationId.HasValue ||
               MovementType == StockMovementType.Production ||
               MovementType == StockMovementType.AdjustmentIncrease;
    }

    public bool IsOutgoing()
    {
        return MovementType == StockMovementType.Sales ||
               MovementType == StockMovementType.PurchaseReturn ||
               MovementType == StockMovementType.Transfer && FromLocationId.HasValue ||
               MovementType == StockMovementType.Consumption ||
               MovementType == StockMovementType.AdjustmentDecrease ||
               MovementType == StockMovementType.Damage ||
               MovementType == StockMovementType.Loss;
    }
}
