using Stocker.SharedKernel.Common;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Stock reservation for sales orders or other purposes
/// Prevents overselling by reserving stock until order is fulfilled or cancelled
/// </summary>
public class StockReservation : BaseEntity
{
    public string ReservationNumber { get; private set; }
    public int ProductId { get; private set; }
    public int WarehouseId { get; private set; }
    public int? LocationId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal FulfilledQuantity { get; private set; }
    public decimal RemainingQuantity => Quantity - FulfilledQuantity;
    public ReservationStatus Status { get; private set; }
    public ReservationType ReservationType { get; private set; }
    public string? ReferenceDocumentType { get; private set; }
    public string? ReferenceDocumentNumber { get; private set; }
    public Guid? ReferenceDocumentId { get; private set; }
    public DateTime ReservationDate { get; private set; }
    public DateTime? ExpirationDate { get; private set; }
    public DateTime? FulfilledDate { get; private set; }
    public DateTime? CancelledDate { get; private set; }
    public string? Notes { get; private set; }
    public int CreatedByUserId { get; private set; }

    public virtual Product Product { get; private set; }
    public virtual Warehouse Warehouse { get; private set; }
    public virtual Location? Location { get; private set; }

    protected StockReservation() { }

    public StockReservation(
        string reservationNumber,
        int productId,
        int warehouseId,
        decimal quantity,
        ReservationType reservationType,
        int createdByUserId,
        DateTime? expirationDate = null)
    {
        ReservationNumber = reservationNumber;
        ProductId = productId;
        WarehouseId = warehouseId;
        Quantity = quantity;
        FulfilledQuantity = 0;
        Status = ReservationStatus.Active;
        ReservationType = reservationType;
        ReservationDate = DateTime.UtcNow;
        ExpirationDate = expirationDate;
        CreatedByUserId = createdByUserId;
    }

    /// <summary>
    /// Rezervasyon oluşturulduktan sonra domain event fırlatır.
    /// Bu metod repository veya application layer tarafından çağrılmalıdır.
    /// </summary>
    public void RaiseCreatedEvent()
    {
        RaiseDomainEvent(new StockReservationCreatedDomainEvent(
            Id,
            TenantId,
            ReservationNumber,
            ProductId,
            WarehouseId,
            LocationId,
            Quantity,
            ReservationType,
            ReservationDate,
            ExpirationDate,
            ReferenceDocumentType,
            ReferenceDocumentNumber));
    }

    public void SetLocation(int? locationId)
    {
        LocationId = locationId;
    }

    public void SetReference(string documentType, string documentNumber, Guid? documentId = null)
    {
        ReferenceDocumentType = documentType;
        ReferenceDocumentNumber = documentNumber;
        ReferenceDocumentId = documentId;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void PartialFulfill(decimal quantity)
    {
        if (Status != ReservationStatus.Active)
            throw new InvalidOperationException("Can only fulfill active reservations");

        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");

        if (quantity > RemainingQuantity)
            throw new InvalidOperationException("Cannot fulfill more than remaining quantity");

        FulfilledQuantity += quantity;

        if (RemainingQuantity == 0)
        {
            Status = ReservationStatus.Fulfilled;
            FulfilledDate = DateTime.UtcNow;
        }
        else
        {
            Status = ReservationStatus.PartiallyFulfilled;
        }
    }

    public void Fulfill()
    {
        if (Status != ReservationStatus.Active && Status != ReservationStatus.PartiallyFulfilled)
            throw new InvalidOperationException("Can only fulfill active or partially fulfilled reservations");

        FulfilledQuantity = Quantity;
        Status = ReservationStatus.Fulfilled;
        FulfilledDate = DateTime.UtcNow;

        RaiseDomainEvent(new StockReservationFulfilledDomainEvent(
            Id,
            TenantId,
            ReservationNumber,
            ProductId,
            WarehouseId,
            Quantity,
            FulfilledDate.Value));
    }

    public void Cancel(string cancelledBy, string? reason = null)
    {
        if (Status == ReservationStatus.Fulfilled || Status == ReservationStatus.Cancelled)
            throw new InvalidOperationException("Cannot cancel fulfilled or already cancelled reservations");

        var releasedQuantity = RemainingQuantity;
        Status = ReservationStatus.Cancelled;
        CancelledDate = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(reason))
            Notes = string.IsNullOrEmpty(Notes) ? reason : $"{Notes}; Cancelled: {reason}";

        RaiseDomainEvent(new StockReservationCancelledDomainEvent(
            Id,
            TenantId,
            ReservationNumber,
            ProductId,
            WarehouseId,
            releasedQuantity,
            cancelledBy,
            CancelledDate.Value));
    }

    public void Expire()
    {
        if (Status != ReservationStatus.Active && Status != ReservationStatus.PartiallyFulfilled)
            throw new InvalidOperationException("Can only expire active or partially fulfilled reservations");

        var releasedQuantity = RemainingQuantity;
        Status = ReservationStatus.Expired;

        RaiseDomainEvent(new StockReservationExpiredDomainEvent(
            Id,
            TenantId,
            ReservationNumber,
            ProductId,
            WarehouseId,
            releasedQuantity,
            ExpirationDate ?? DateTime.UtcNow));
    }

    public bool IsExpired()
    {
        return ExpirationDate.HasValue && ExpirationDate.Value < DateTime.UtcNow;
    }

    public void ExtendExpiration(DateTime newExpirationDate)
    {
        if (Status != ReservationStatus.Active && Status != ReservationStatus.PartiallyFulfilled)
            throw new InvalidOperationException("Can only extend active or partially fulfilled reservations");

        if (newExpirationDate <= DateTime.UtcNow)
            throw new ArgumentException("New expiration date must be in the future");

        ExpirationDate = newExpirationDate;
    }
}
