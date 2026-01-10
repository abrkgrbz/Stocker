using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Domain.Entities;

public class Warehouse : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public int? BranchId { get; private set; }
    public Address? Address { get; private set; }
    public PhoneNumber? Phone { get; private set; }
    public string? Manager { get; private set; }
    public decimal TotalArea { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDefault { get; private set; }

    public virtual ICollection<Location> Locations { get; private set; }
    public virtual ICollection<WarehouseZone> Zones { get; private set; }
    public virtual ICollection<Stock> Stocks { get; private set; }
    public virtual ICollection<StockMovement> StockMovements { get; private set; }

    protected Warehouse() { }

    public Warehouse(string code, string name, int? branchId = null)
    {
        Code = code;
        Name = name;
        BranchId = branchId;
        IsActive = true;
        IsDefault = false;
        Locations = new List<Location>();
        Zones = new List<WarehouseZone>();
        Stocks = new List<Stock>();
        StockMovements = new List<StockMovement>();
    }

    /// <summary>
    /// Depo oluşturulduktan sonra domain event fırlatır.
    /// </summary>
    public void RaiseCreatedEvent()
    {
        RaiseDomainEvent(new WarehouseCreatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name,
            BranchId));
    }

    public void UpdateWarehouse(
        string name,
        string? description,
        Address? address,
        PhoneNumber? phone,
        string? manager)
    {
        Name = name;
        Description = description;
        Address = address;
        Phone = phone;
        Manager = manager;

        RaiseDomainEvent(new WarehouseUpdatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name,
            Manager));
    }

    public void SetAsDefault()
    {
        IsDefault = true;

        RaiseDomainEvent(new WarehouseSetAsDefaultDomainEvent(
            Id,
            TenantId,
            Code,
            Name));
    }

    public void UnsetDefault()
    {
        IsDefault = false;
    }

    public void SetTotalArea(decimal area)
    {
        TotalArea = area;
    }

    public void Activate()
    {
        IsActive = true;

        RaiseDomainEvent(new WarehouseActivatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name));
    }

    public void Deactivate()
    {
        IsActive = false;

        RaiseDomainEvent(new WarehouseDeactivatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name));
    }
}
