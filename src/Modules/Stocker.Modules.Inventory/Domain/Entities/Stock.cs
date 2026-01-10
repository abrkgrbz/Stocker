using Stocker.SharedKernel.Common;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Domain.Entities;

public class Stock : BaseEntity
{
    public int ProductId { get; private set; }
    public int WarehouseId { get; private set; }
    public int? LocationId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal ReservedQuantity { get; private set; }
    public decimal AvailableQuantity => Quantity - ReservedQuantity;
    public string? SerialNumber { get; private set; }
    public string? LotNumber { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public DateTime LastMovementDate { get; private set; }
    public DateTime LastCountDate { get; private set; }

    public virtual Product Product { get; private set; }
    public virtual Warehouse Warehouse { get; private set; }
    public virtual Location? Location { get; private set; }

    protected Stock() { }

    public Stock(int productId, int warehouseId, decimal quantity = 0)
    {
        ProductId = productId;
        WarehouseId = warehouseId;
        Quantity = quantity;
        ReservedQuantity = 0;
        LastMovementDate = DateTime.UtcNow;
        LastCountDate = DateTime.UtcNow;
    }

    public void SetLocation(int? locationId)
    {
        LocationId = locationId;
    }

    public void SetSerialNumber(string serialNumber)
    {
        SerialNumber = serialNumber;
    }

    public void SetLotNumber(string lotNumber, DateTime? expiryDate = null)
    {
        LotNumber = lotNumber;
        ExpiryDate = expiryDate;
    }

    public void IncreaseStock(decimal quantity, string? lotNumber = null, string? serialNumber = null)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");

        var previousQuantity = Quantity;
        Quantity += quantity;
        LastMovementDate = DateTime.UtcNow;

        // StockIncreasedDomainEvent signature:
        // (int StockId, Guid TenantId, int ProductId, int WarehouseId, int? LocationId,
        //  decimal PreviousQuantity, decimal IncreasedQuantity, decimal NewQuantity, string? LotNumber, string? SerialNumber)
        RaiseDomainEvent(new StockIncreasedDomainEvent(
            Id,
            TenantId,
            ProductId,
            WarehouseId,
            LocationId,
            previousQuantity,
            quantity,
            Quantity,
            lotNumber ?? LotNumber,
            serialNumber ?? SerialNumber));
    }

    public void DecreaseStock(decimal quantity, string? lotNumber = null, string? serialNumber = null)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");

        if (quantity > AvailableQuantity)
            throw new InvalidOperationException("Insufficient available stock");

        var previousQuantity = Quantity;
        Quantity -= quantity;
        LastMovementDate = DateTime.UtcNow;

        // StockDecreasedDomainEvent signature:
        // (int StockId, Guid TenantId, int ProductId, int WarehouseId, int? LocationId,
        //  decimal PreviousQuantity, decimal DecreasedQuantity, decimal NewQuantity, string? LotNumber, string? SerialNumber)
        RaiseDomainEvent(new StockDecreasedDomainEvent(
            Id,
            TenantId,
            ProductId,
            WarehouseId,
            LocationId,
            previousQuantity,
            quantity,
            Quantity,
            lotNumber ?? LotNumber,
            serialNumber ?? SerialNumber));
    }

    public void ReserveStock(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");

        if (quantity > AvailableQuantity)
            throw new InvalidOperationException("Insufficient available stock for reservation");

        ReservedQuantity += quantity;

        // StockReservedDomainEvent signature:
        // (int StockId, Guid TenantId, int ProductId, int WarehouseId, decimal ReservedQuantity, decimal TotalReservedQuantity, decimal AvailableQuantity)
        RaiseDomainEvent(new StockReservedDomainEvent(
            Id,
            TenantId,
            ProductId,
            WarehouseId,
            quantity,
            ReservedQuantity,
            AvailableQuantity));
    }

    public void ReleaseReservation(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");

        if (quantity > ReservedQuantity)
            throw new InvalidOperationException("Cannot release more than reserved quantity");

        ReservedQuantity -= quantity;

        // StockReservationReleasedDomainEvent signature:
        // (int StockId, Guid TenantId, int ProductId, int WarehouseId, decimal ReleasedQuantity, decimal RemainingReservedQuantity, decimal AvailableQuantity)
        RaiseDomainEvent(new StockReservationReleasedDomainEvent(
            Id,
            TenantId,
            ProductId,
            WarehouseId,
            quantity,
            ReservedQuantity,
            AvailableQuantity));
    }

    public void AdjustStock(decimal newQuantity)
    {
        var previousQuantity = Quantity;
        Quantity = newQuantity;
        LastMovementDate = DateTime.UtcNow;
        LastCountDate = DateTime.UtcNow;

        // StockAdjustedDomainEvent signature:
        // (int StockId, Guid TenantId, int ProductId, int WarehouseId, decimal PreviousQuantity, decimal NewQuantity, decimal Variance)
        RaiseDomainEvent(new StockAdjustedDomainEvent(
            Id,
            TenantId,
            ProductId,
            WarehouseId,
            previousQuantity,
            newQuantity,
            newQuantity - previousQuantity));
    }

    public bool IsExpired()
    {
        return ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
    }

    public bool IsExpiringWithinDays(int days)
    {
        if (!ExpiryDate.HasValue)
            return false;

        return ExpiryDate.Value <= DateTime.UtcNow.AddDays(days);
    }
}
