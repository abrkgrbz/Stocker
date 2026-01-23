using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

public class Location : BaseEntity
{
    public int WarehouseId { get; private set; }
    public int? WarehouseZoneId { get; private set; }
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string? Aisle { get; private set; }
    public string? Shelf { get; private set; }
    public string? Bin { get; private set; }
    public decimal Capacity { get; private set; }
    public decimal UsedCapacity { get; private set; }
    public bool IsActive { get; private set; }

    public virtual Warehouse Warehouse { get; private set; }
    public virtual WarehouseZone? WarehouseZone { get; private set; }
    public virtual ICollection<Stock> Stocks { get; private set; }
    
    protected Location() { }
    
    public Location(int warehouseId, string code, string name)
    {
        WarehouseId = warehouseId;
        Code = code;
        Name = name;
        IsActive = true;
        Capacity = 0;
        UsedCapacity = 0;
        Stocks = new List<Stock>();
    }
    
    public void UpdateLocation(string name, string? description)
    {
        Name = name;
        Description = description;
    }
    
    public void SetLocationDetails(string? aisle, string? shelf, string? bin)
    {
        Aisle = aisle;
        Shelf = shelf;
        Bin = bin;
    }
    
    public void SetCapacity(decimal capacity)
    {
        if (capacity < UsedCapacity)
            throw new InvalidOperationException("Capacity cannot be less than used capacity");
            
        Capacity = capacity;
    }
    
    public void UpdateUsedCapacity(decimal usedCapacity)
    {
        if (Capacity > 0 && usedCapacity > Capacity)
            throw new InvalidOperationException("Used capacity cannot exceed total capacity");

        UsedCapacity = usedCapacity;
    }

    /// <summary>
    /// Increases used capacity when stock is added to this location.
    /// Skips validation if Capacity is 0 (unlimited).
    /// </summary>
    public void IncreaseUsedCapacity(decimal amount)
    {
        if (amount <= 0) return;

        if (Capacity > 0 && (UsedCapacity + amount) > Capacity)
            throw new InvalidOperationException(
                $"Lokasyon kapasitesi aşılıyor. Mevcut: {UsedCapacity}, Eklenecek: {amount}, Kapasite: {Capacity}");

        UsedCapacity += amount;
    }

    /// <summary>
    /// Decreases used capacity when stock is removed from this location.
    /// </summary>
    public void DecreaseUsedCapacity(decimal amount)
    {
        if (amount <= 0) return;

        UsedCapacity = Math.Max(0, UsedCapacity - amount);
    }

    /// <summary>
    /// Checks if the location has enough available capacity for the given amount.
    /// Returns true if Capacity is 0 (unlimited).
    /// </summary>
    public bool HasAvailableCapacity(decimal amount)
    {
        if (Capacity <= 0) return true;
        return (UsedCapacity + amount) <= Capacity;
    }

    public decimal GetAvailableCapacity() => Capacity > 0 ? Capacity - UsedCapacity : decimal.MaxValue;

    public void SetWarehouseZone(int? warehouseZoneId) => WarehouseZoneId = warehouseZoneId;

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}