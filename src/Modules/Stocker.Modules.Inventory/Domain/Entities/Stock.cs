using Stocker.SharedKernel.Common;

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
    
    public void IncreaseStock(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");
            
        Quantity += quantity;
        LastMovementDate = DateTime.UtcNow;
    }
    
    public void DecreaseStock(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");
            
        if (quantity > AvailableQuantity)
            throw new InvalidOperationException("Insufficient available stock");
            
        Quantity -= quantity;
        LastMovementDate = DateTime.UtcNow;
    }
    
    public void ReserveStock(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");
            
        if (quantity > AvailableQuantity)
            throw new InvalidOperationException("Insufficient available stock for reservation");
            
        ReservedQuantity += quantity;
    }
    
    public void ReleaseReservation(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");
            
        if (quantity > ReservedQuantity)
            throw new InvalidOperationException("Cannot release more than reserved quantity");
            
        ReservedQuantity -= quantity;
    }
    
    public void AdjustStock(decimal newQuantity)
    {
        Quantity = newQuantity;
        LastMovementDate = DateTime.UtcNow;
        LastCountDate = DateTime.UtcNow;
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