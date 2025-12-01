using Stocker.SharedKernel.Common;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Serial number tracking for individual product units
/// Used for warranty tracking, returns, and asset management
/// </summary>
public class SerialNumber : BaseEntity
{
    public string Serial { get; private set; }
    public int ProductId { get; private set; }
    public int? WarehouseId { get; private set; }
    public int? LocationId { get; private set; }
    public SerialNumberStatus Status { get; private set; }
    public DateTime? ManufacturedDate { get; private set; }
    public DateTime? ReceivedDate { get; private set; }
    public DateTime? SoldDate { get; private set; }
    public DateTime? WarrantyStartDate { get; private set; }
    public DateTime? WarrantyEndDate { get; private set; }
    public Guid? CustomerId { get; private set; }
    public Guid? SalesOrderId { get; private set; }
    public Guid? PurchaseOrderId { get; private set; }
    public string? Notes { get; private set; }
    public string? BatchNumber { get; private set; }
    public string? SupplierSerial { get; private set; }

    public virtual Product Product { get; private set; }
    public virtual Warehouse? Warehouse { get; private set; }
    public virtual Location? Location { get; private set; }

    protected SerialNumber() { }

    public SerialNumber(string serial, int productId)
    {
        Serial = serial;
        ProductId = productId;
        Status = SerialNumberStatus.Available;
    }

    public void SetWarehouse(int? warehouseId, int? locationId = null)
    {
        WarehouseId = warehouseId;
        LocationId = locationId;
    }

    public void SetManufacturedDate(DateTime? date)
    {
        ManufacturedDate = date;
    }

    public void SetBatchInfo(string? batchNumber, string? supplierSerial)
    {
        BatchNumber = batchNumber;
        SupplierSerial = supplierSerial;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void Receive(Guid? purchaseOrderId = null)
    {
        if (Status != SerialNumberStatus.Available)
            throw new InvalidOperationException($"Cannot receive serial number in status {Status}");

        Status = SerialNumberStatus.InStock;
        ReceivedDate = DateTime.UtcNow;
        PurchaseOrderId = purchaseOrderId;
    }

    public void Reserve(Guid salesOrderId)
    {
        if (Status != SerialNumberStatus.InStock)
            throw new InvalidOperationException($"Cannot reserve serial number in status {Status}");

        Status = SerialNumberStatus.Reserved;
        SalesOrderId = salesOrderId;
    }

    public void ReleaseReservation()
    {
        if (Status != SerialNumberStatus.Reserved)
            throw new InvalidOperationException($"Cannot release serial number in status {Status}");

        Status = SerialNumberStatus.InStock;
        SalesOrderId = null;
    }

    public void Sell(Guid customerId, Guid salesOrderId, int? warrantyMonths = null)
    {
        if (Status != SerialNumberStatus.Reserved && Status != SerialNumberStatus.InStock)
            throw new InvalidOperationException($"Cannot sell serial number in status {Status}");

        Status = SerialNumberStatus.Sold;
        SoldDate = DateTime.UtcNow;
        CustomerId = customerId;
        SalesOrderId = salesOrderId;
        WarehouseId = null;
        LocationId = null;

        if (warrantyMonths.HasValue && warrantyMonths.Value > 0)
        {
            WarrantyStartDate = DateTime.UtcNow;
            WarrantyEndDate = DateTime.UtcNow.AddMonths(warrantyMonths.Value);
        }
    }

    public void Return(int warehouseId, int? locationId = null)
    {
        if (Status != SerialNumberStatus.Sold)
            throw new InvalidOperationException($"Cannot return serial number in status {Status}");

        Status = SerialNumberStatus.Returned;
        WarehouseId = warehouseId;
        LocationId = locationId;
    }

    public void MarkDefective(string? reason = null)
    {
        Status = SerialNumberStatus.Defective;
        if (!string.IsNullOrEmpty(reason))
            Notes = string.IsNullOrEmpty(Notes) ? reason : $"{Notes}; Defective: {reason}";
    }

    public void MarkInRepair()
    {
        if (Status != SerialNumberStatus.Defective && Status != SerialNumberStatus.Returned)
            throw new InvalidOperationException($"Cannot mark as in repair in status {Status}");

        Status = SerialNumberStatus.InRepair;
    }

    public void CompleteRepair()
    {
        if (Status != SerialNumberStatus.InRepair)
            throw new InvalidOperationException($"Cannot complete repair in status {Status}");

        Status = SerialNumberStatus.InStock;
    }

    public void Scrap(string? reason = null)
    {
        Status = SerialNumberStatus.Scrapped;
        if (!string.IsNullOrEmpty(reason))
            Notes = string.IsNullOrEmpty(Notes) ? reason : $"{Notes}; Scrapped: {reason}";
    }

    public void MarkLost(string? reason = null)
    {
        Status = SerialNumberStatus.Lost;
        if (!string.IsNullOrEmpty(reason))
            Notes = string.IsNullOrEmpty(Notes) ? reason : $"{Notes}; Lost: {reason}";
    }

    public bool IsUnderWarranty()
    {
        if (!WarrantyEndDate.HasValue)
            return false;

        return DateTime.UtcNow <= WarrantyEndDate.Value;
    }

    public int? GetRemainingWarrantyDays()
    {
        if (!WarrantyEndDate.HasValue)
            return null;

        var days = (WarrantyEndDate.Value - DateTime.UtcNow).Days;
        return days > 0 ? days : 0;
    }
}
