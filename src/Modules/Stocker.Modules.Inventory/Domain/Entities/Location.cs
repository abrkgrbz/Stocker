using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

public class Location : BaseEntity
{
    public int WarehouseId { get; private set; }
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
        if (usedCapacity > Capacity)
            throw new InvalidOperationException("Used capacity cannot exceed total capacity");
            
        UsedCapacity = usedCapacity;
    }
    
    public decimal GetAvailableCapacity() => Capacity - UsedCapacity;
    
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}