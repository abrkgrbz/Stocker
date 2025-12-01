using Stocker.SharedKernel.Common;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Lot/Batch tracking for products with expiration dates or batch manufacturing
/// Essential for food, pharmaceuticals, and regulated industries
/// </summary>
public class LotBatch : BaseEntity
{
    public string LotNumber { get; private set; }
    public int ProductId { get; private set; }
    public int? SupplierId { get; private set; }
    public LotBatchStatus Status { get; private set; }
    public DateTime? ManufacturedDate { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public DateTime? ReceivedDate { get; private set; }
    public decimal InitialQuantity { get; private set; }
    public decimal CurrentQuantity { get; private set; }
    public decimal ReservedQuantity { get; private set; }
    public decimal AvailableQuantity => CurrentQuantity - ReservedQuantity;
    public string? SupplierLotNumber { get; private set; }
    public Guid? PurchaseOrderId { get; private set; }
    public string? CertificateNumber { get; private set; }
    public string? Notes { get; private set; }
    public bool IsQuarantined { get; private set; }
    public DateTime? QuarantinedDate { get; private set; }
    public string? QuarantineReason { get; private set; }
    public int? InspectedByUserId { get; private set; }
    public DateTime? InspectedDate { get; private set; }
    public string? InspectionNotes { get; private set; }

    public virtual Product Product { get; private set; }
    public virtual Supplier? Supplier { get; private set; }
    public virtual ICollection<Stock> Stocks { get; private set; }

    protected LotBatch() { }

    public LotBatch(
        string lotNumber,
        int productId,
        decimal initialQuantity,
        DateTime? expiryDate = null)
    {
        LotNumber = lotNumber;
        ProductId = productId;
        InitialQuantity = initialQuantity;
        CurrentQuantity = initialQuantity;
        ReservedQuantity = 0;
        ExpiryDate = expiryDate;
        Status = LotBatchStatus.Pending;
        IsQuarantined = false;
        Stocks = new List<Stock>();
    }

    public void SetSupplierInfo(int? supplierId, string? supplierLotNumber, Guid? purchaseOrderId = null)
    {
        SupplierId = supplierId;
        SupplierLotNumber = supplierLotNumber;
        PurchaseOrderId = purchaseOrderId;
    }

    public void SetDates(DateTime? manufacturedDate, DateTime? expiryDate)
    {
        ManufacturedDate = manufacturedDate;
        ExpiryDate = expiryDate;
    }

    public void SetCertificate(string? certificateNumber)
    {
        CertificateNumber = certificateNumber;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void Receive()
    {
        if (Status != LotBatchStatus.Pending)
            throw new InvalidOperationException($"Cannot receive lot in status {Status}");

        Status = LotBatchStatus.Received;
        ReceivedDate = DateTime.UtcNow;
    }

    public void Inspect(int inspectedByUserId, bool passed, string? notes = null)
    {
        if (Status != LotBatchStatus.Received && Status != LotBatchStatus.Quarantined)
            throw new InvalidOperationException($"Cannot inspect lot in status {Status}");

        InspectedByUserId = inspectedByUserId;
        InspectedDate = DateTime.UtcNow;
        InspectionNotes = notes;

        if (passed)
        {
            Status = LotBatchStatus.Approved;
            IsQuarantined = false;
        }
        else
        {
            Status = LotBatchStatus.Rejected;
        }
    }

    public void Approve()
    {
        if (Status != LotBatchStatus.Received && Status != LotBatchStatus.Quarantined)
            throw new InvalidOperationException($"Cannot approve lot in status {Status}");

        Status = LotBatchStatus.Approved;
        IsQuarantined = false;
    }

    public void Quarantine(string reason)
    {
        if (Status == LotBatchStatus.Rejected || Status == LotBatchStatus.Exhausted)
            throw new InvalidOperationException($"Cannot quarantine lot in status {Status}");

        IsQuarantined = true;
        QuarantinedDate = DateTime.UtcNow;
        QuarantineReason = reason;
        Status = LotBatchStatus.Quarantined;
    }

    public void ReleaseFromQuarantine()
    {
        if (!IsQuarantined)
            throw new InvalidOperationException("Lot is not in quarantine");

        IsQuarantined = false;
        Status = CurrentQuantity > 0 ? LotBatchStatus.Approved : LotBatchStatus.Exhausted;
    }

    public void Reject(string? reason = null)
    {
        Status = LotBatchStatus.Rejected;
        if (!string.IsNullOrEmpty(reason))
            Notes = string.IsNullOrEmpty(Notes) ? reason : $"{Notes}; Rejected: {reason}";
    }

    public void Reserve(decimal quantity)
    {
        if (Status != LotBatchStatus.Approved)
            throw new InvalidOperationException($"Cannot reserve from lot in status {Status}");

        if (quantity > AvailableQuantity)
            throw new InvalidOperationException("Insufficient available quantity");

        ReservedQuantity += quantity;
    }

    public void ReleaseReservation(decimal quantity)
    {
        if (quantity > ReservedQuantity)
            throw new InvalidOperationException("Cannot release more than reserved quantity");

        ReservedQuantity -= quantity;
    }

    public void Consume(decimal quantity)
    {
        if (Status != LotBatchStatus.Approved)
            throw new InvalidOperationException($"Cannot consume from lot in status {Status}");

        if (quantity > CurrentQuantity)
            throw new InvalidOperationException("Insufficient quantity");

        CurrentQuantity -= quantity;

        if (CurrentQuantity <= 0)
        {
            Status = LotBatchStatus.Exhausted;
        }
    }

    public void AddQuantity(decimal quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");

        CurrentQuantity += quantity;

        if (Status == LotBatchStatus.Exhausted && CurrentQuantity > 0)
        {
            Status = LotBatchStatus.Approved;
        }
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

    public int? GetDaysUntilExpiry()
    {
        if (!ExpiryDate.HasValue)
            return null;

        var days = (ExpiryDate.Value - DateTime.UtcNow).Days;
        return days;
    }

    public int? GetShelfLifeDays()
    {
        if (!ManufacturedDate.HasValue || !ExpiryDate.HasValue)
            return null;

        return (ExpiryDate.Value - ManufacturedDate.Value).Days;
    }

    public int? GetRemainingShelfLifePercentage()
    {
        var shelfLifeDays = GetShelfLifeDays();
        var daysUntilExpiry = GetDaysUntilExpiry();

        if (!shelfLifeDays.HasValue || !daysUntilExpiry.HasValue || shelfLifeDays.Value == 0)
            return null;

        var percentage = (int)((double)daysUntilExpiry.Value / shelfLifeDays.Value * 100);
        return Math.Max(0, Math.Min(100, percentage));
    }
}
