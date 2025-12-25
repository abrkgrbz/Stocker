using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a stock reservation for a sales document.
/// Prevents overselling by temporarily holding inventory for orders.
/// Supports soft reservations (can be released) and hard reservations (committed).
/// </summary>
public class InventoryReservation : TenantAggregateRoot
{
    #region Properties

    public string ReservationNumber { get; private set; } = string.Empty;

    // Product & Warehouse
    public Guid ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public Guid? WarehouseId { get; private set; }
    public string? WarehouseCode { get; private set; }
    public Guid? LocationId { get; private set; } // Specific bin/shelf location

    // Quantity
    public decimal ReservedQuantity { get; private set; }
    public decimal AllocatedQuantity { get; private set; } // Quantity actually picked
    public decimal RemainingQuantity => ReservedQuantity - AllocatedQuantity;
    public string Unit { get; private set; } = "Adet";

    // Lot/Serial Tracking
    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }
    public DateTime? ExpiryDate { get; private set; }

    // Source Document
    public ReservationSource Source { get; private set; }
    public Guid? SalesOrderId { get; private set; }
    public string? SalesOrderNumber { get; private set; }
    public Guid? SalesOrderItemId { get; private set; }
    public Guid? OpportunityId { get; private set; }
    public Guid? QuotationId { get; private set; }

    // Status & Timeline
    public ReservationStatus Status { get; private set; }
    public ReservationType Type { get; private set; }
    public DateTime ReservedAt { get; private set; }
    public DateTime ReservedUntil { get; private set; }
    public DateTime? ReleasedAt { get; private set; }
    public DateTime? AllocatedAt { get; private set; }
    public DateTime? FulfilledAt { get; private set; }

    // Priority & Conflict Resolution
    public int Priority { get; private set; } // Higher = more important
    public bool IsAutoRelease { get; private set; } = true; // Auto-release when expired

    // Audit
    public Guid? ReservedBy { get; private set; }
    public string? ReservedByName { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    #endregion

    #region Constructors

    private InventoryReservation() { }

    private InventoryReservation(
        Guid tenantId,
        string reservationNumber,
        Guid productId,
        string productCode,
        string productName,
        decimal quantity,
        string unit,
        DateTime reservedUntil) : base(Guid.NewGuid(), tenantId)
    {
        ReservationNumber = reservationNumber;
        ProductId = productId;
        ProductCode = productCode;
        ProductName = productName;
        ReservedQuantity = quantity;
        Unit = unit;
        ReservedAt = DateTime.UtcNow;
        ReservedUntil = reservedUntil;
        Status = ReservationStatus.Active;
        Type = ReservationType.Soft;
        Priority = 1;
        CreatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Factory Methods

    public static Result<InventoryReservation> Create(
        Guid tenantId,
        string reservationNumber,
        Guid productId,
        string productCode,
        string productName,
        decimal quantity,
        string unit,
        DateTime reservedUntil)
    {
        if (string.IsNullOrWhiteSpace(reservationNumber))
            return Result<InventoryReservation>.Failure(Error.Validation("Reservation.NumberRequired", "Reservation number is required"));

        if (quantity <= 0)
            return Result<InventoryReservation>.Failure(Error.Validation("Reservation.InvalidQuantity", "Quantity must be greater than zero"));

        if (reservedUntil <= DateTime.UtcNow)
            return Result<InventoryReservation>.Failure(Error.Validation("Reservation.InvalidExpiry", "Reserved until date must be in the future"));

        return Result<InventoryReservation>.Success(
            new InventoryReservation(tenantId, reservationNumber, productId, productCode, productName, quantity, unit, reservedUntil));
    }

    public static Result<InventoryReservation> CreateForOrder(
        Guid tenantId,
        string reservationNumber,
        Guid productId,
        string productCode,
        string productName,
        decimal quantity,
        string unit,
        Guid salesOrderId,
        string salesOrderNumber,
        Guid salesOrderItemId,
        DateTime reservedUntil)
    {
        var result = Create(tenantId, reservationNumber, productId, productCode, productName, quantity, unit, reservedUntil);
        if (!result.IsSuccess) return result;

        var reservation = result.Value;
        reservation.Source = ReservationSource.SalesOrder;
        reservation.SalesOrderId = salesOrderId;
        reservation.SalesOrderNumber = salesOrderNumber;
        reservation.SalesOrderItemId = salesOrderItemId;
        reservation.Type = ReservationType.Hard; // Order reservations are hard by default
        reservation.Priority = 10; // Higher priority

        return Result<InventoryReservation>.Success(reservation);
    }

    public static Result<InventoryReservation> CreateForOpportunity(
        Guid tenantId,
        string reservationNumber,
        Guid productId,
        string productCode,
        string productName,
        decimal quantity,
        string unit,
        Guid opportunityId,
        DateTime reservedUntil)
    {
        var result = Create(tenantId, reservationNumber, productId, productCode, productName, quantity, unit, reservedUntil);
        if (!result.IsSuccess) return result;

        var reservation = result.Value;
        reservation.Source = ReservationSource.Opportunity;
        reservation.OpportunityId = opportunityId;
        reservation.Type = ReservationType.Soft; // Opportunity reservations are soft
        reservation.Priority = 5;

        return Result<InventoryReservation>.Success(reservation);
    }

    #endregion

    #region Reservation Management

    public Result Extend(TimeSpan duration)
    {
        if (Status != ReservationStatus.Active)
            return Result.Failure(Error.Validation("Reservation.NotActive", "Can only extend active reservations"));

        if (duration <= TimeSpan.Zero)
            return Result.Failure(Error.Validation("Reservation.InvalidDuration", "Extension duration must be positive"));

        ReservedUntil = ReservedUntil.Add(duration);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result ExtendUntil(DateTime newExpiry)
    {
        if (Status != ReservationStatus.Active)
            return Result.Failure(Error.Validation("Reservation.NotActive", "Can only extend active reservations"));

        if (newExpiry <= ReservedUntil)
            return Result.Failure(Error.Validation("Reservation.InvalidExpiry", "New expiry must be after current expiry"));

        ReservedUntil = newExpiry;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Release(string? reason = null)
    {
        if (Status == ReservationStatus.Released)
            return Result.Failure(Error.Validation("Reservation.AlreadyReleased", "Reservation is already released"));

        if (Status == ReservationStatus.Fulfilled)
            return Result.Failure(Error.Validation("Reservation.AlreadyFulfilled", "Cannot release a fulfilled reservation"));

        Status = ReservationStatus.Released;
        ReleasedAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(reason))
            Notes = reason;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result PartialRelease(decimal quantityToRelease, string? reason = null)
    {
        if (Status != ReservationStatus.Active)
            return Result.Failure(Error.Validation("Reservation.NotActive", "Can only partially release active reservations"));

        if (quantityToRelease <= 0 || quantityToRelease > RemainingQuantity)
            return Result.Failure(Error.Validation("Reservation.InvalidQuantity", "Invalid quantity to release"));

        ReservedQuantity -= quantityToRelease;
        if (!string.IsNullOrWhiteSpace(reason))
            Notes = $"{Notes}\nPartial release: {quantityToRelease} - {reason}".Trim();
        UpdatedAt = DateTime.UtcNow;

        // If all quantity released, mark as released
        if (ReservedQuantity <= 0)
        {
            Status = ReservationStatus.Released;
            ReleasedAt = DateTime.UtcNow;
        }

        return Result.Success();
    }

    public Result Allocate(decimal quantity)
    {
        if (Status != ReservationStatus.Active)
            return Result.Failure(Error.Validation("Reservation.NotActive", "Can only allocate from active reservations"));

        if (quantity <= 0 || quantity > RemainingQuantity)
            return Result.Failure(Error.Validation("Reservation.InvalidQuantity", "Invalid quantity to allocate"));

        AllocatedQuantity += quantity;
        AllocatedAt ??= DateTime.UtcNow;
        Status = ReservationStatus.PartiallyAllocated;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Fulfill()
    {
        if (Status == ReservationStatus.Fulfilled)
            return Result.Failure(Error.Validation("Reservation.AlreadyFulfilled", "Reservation is already fulfilled"));

        if (Status == ReservationStatus.Released)
            return Result.Failure(Error.Validation("Reservation.Released", "Cannot fulfill a released reservation"));

        AllocatedQuantity = ReservedQuantity;
        Status = ReservationStatus.Fulfilled;
        FulfilledAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Expire()
    {
        if (Status != ReservationStatus.Active && Status != ReservationStatus.PartiallyAllocated)
            return Result.Failure(Error.Validation("Reservation.CannotExpire", "Only active reservations can expire"));

        Status = ReservationStatus.Expired;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public bool IsExpired => DateTime.UtcNow > ReservedUntil && Status == ReservationStatus.Active;

    #endregion

    #region Configuration

    public Result SetWarehouse(Guid warehouseId, string? warehouseCode, Guid? locationId = null)
    {
        WarehouseId = warehouseId;
        WarehouseCode = warehouseCode;
        LocationId = locationId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetLotTracking(string? lotNumber, string? serialNumber, DateTime? expiryDate)
    {
        LotNumber = lotNumber;
        SerialNumber = serialNumber;
        ExpiryDate = expiryDate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetPriority(int priority)
    {
        if (priority < 0)
            return Result.Failure(Error.Validation("Reservation.InvalidPriority", "Priority cannot be negative"));

        Priority = priority;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetType(ReservationType type)
    {
        Type = type;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetReservedBy(Guid userId, string? userName)
    {
        ReservedBy = userId;
        ReservedByName = userName;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion
}

#region Enums

public enum ReservationStatus
{
    Active = 0,
    PartiallyAllocated = 1,
    Fulfilled = 2,
    Released = 3,
    Expired = 4,
    Cancelled = 5
}

public enum ReservationType
{
    Soft = 0,   // Can be released automatically or by other high-priority orders
    Hard = 1,   // Must be manually released or fulfilled
    Locked = 2  // Cannot be released until fulfilled
}

public enum ReservationSource
{
    Manual = 0,
    SalesOrder = 1,
    Opportunity = 2,
    Quotation = 3,
    BackOrder = 4,
    Transfer = 5
}

#endregion
