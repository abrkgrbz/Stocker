using MediatR;
using Stocker.Modules.Sales.Application.Behaviors;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;

public record CreateSalesOrderCommand : IRequest<Result<SalesOrderDto>>, IIdempotentCommand
{
    /// <summary>
    /// Unique request ID for idempotency. Clients should generate and send this ID
    /// to prevent duplicate order creation on retries.
    /// </summary>
    public Guid RequestId { get; set; }

    public DateTime OrderDate { get; init; } = DateTime.UtcNow;
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public Guid? BranchId { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? CustomerOrderNumber { get; init; }
    public string Currency { get; init; } = "TRY";
    public string? ShippingAddress { get; init; }
    public string? BillingAddress { get; init; }
    public string? Notes { get; init; }
    public Guid? SalesPersonId { get; init; }
    public string? SalesPersonName { get; init; }
    public List<CreateSalesOrderItemCommand> Items { get; init; } = new();

    // Address Snapshot Input - structured address data to be preserved at order time
    public AddressSnapshotInput? ShippingAddressSnapshot { get; init; }
    public AddressSnapshotInput? BillingAddressSnapshot { get; init; }

    // Source Document Relations
    public Guid? QuotationId { get; init; }
    public string? QuotationNumber { get; init; }
    public Guid? OpportunityId { get; init; }
    public Guid? CustomerContractId { get; init; }

    #region Discount Options

    /// <summary>
    /// Coupon code for order-level discount. The discount will be validated and calculated server-side.
    /// Do NOT send DiscountAmount or DiscountRate - they will be ignored for security.
    /// </summary>
    public string? CouponCode { get; init; }

    /// <summary>
    /// Multiple coupon codes if stacking is allowed.
    /// </summary>
    public List<string>? CouponCodes { get; init; }

    #endregion

    #region Phase 3: Enhanced Order Creation Options

    /// <summary>
    /// Territory ID to assign to the order (optional - auto-detected from customer address if not provided)
    /// </summary>
    public Guid? TerritoryId { get; init; }

    /// <summary>
    /// If true, validates customer contract credit limit before creating order
    /// </summary>
    public bool ValidateCreditLimit { get; init; } = true;

    /// <summary>
    /// If true, allows order creation during contract grace period
    /// </summary>
    public bool AllowGracePeriod { get; init; } = false;

    /// <summary>
    /// If true, attempts to reserve stock for all items
    /// </summary>
    public bool ReserveStock { get; init; } = true;

    /// <summary>
    /// Stock reservation expiry in hours (default: 48 hours)
    /// </summary>
    public int ReservationExpiryHours { get; init; } = 48;

    /// <summary>
    /// If true, creates back orders for items with insufficient stock
    /// Otherwise fails the order creation if stock is insufficient
    /// </summary>
    public bool AllowBackOrders { get; init; } = false;

    /// <summary>
    /// Payment due days from order date (used for credit terms)
    /// </summary>
    public int? PaymentDueDays { get; init; }

    /// <summary>
    /// Current outstanding balance for the customer (for credit limit calculation)
    /// If not provided, will be calculated from existing unpaid orders
    /// </summary>
    public decimal? CurrentOutstandingBalance { get; init; }

    #endregion
}

/// <summary>
/// Input model for creating address snapshots
/// </summary>
public record AddressSnapshotInput
{
    public string RecipientName { get; init; } = string.Empty;
    public string? RecipientPhone { get; init; }
    public string? CompanyName { get; init; }
    public string AddressLine1 { get; init; } = string.Empty;
    public string? AddressLine2 { get; init; }
    public string? District { get; init; }
    public string? Town { get; init; }
    public string City { get; init; } = string.Empty;
    public string? State { get; init; }
    public string Country { get; init; } = "Türkiye";
    public string? PostalCode { get; init; }
    public string? TaxId { get; init; }
    public string? TaxOffice { get; init; }
}

public record CreateSalesOrderItemCommand
{
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; } = 20;

    /// <summary>
    /// Item-level coupon code. Will be validated and calculated server-side.
    /// </summary>
    public string? CouponCode { get; init; }
}

public record UpdateSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? CustomerEmail { get; init; }
    public DateTime? DeliveryDate { get; init; }
    public string? CustomerOrderNumber { get; init; }
    public string? ShippingAddress { get; init; }
    public string? BillingAddress { get; init; }
    public string? Notes { get; init; }
    public Guid? SalesPersonId { get; init; }
    public string? SalesPersonName { get; init; }

    /// <summary>
    /// Coupon code for order-level discount. Will be validated and calculated server-side.
    /// Note: This replaces any existing discount on the order.
    /// </summary>
    public string? CouponCode { get; init; }

    /// <summary>
    /// Set to true to remove any existing discount from the order.
    /// </summary>
    public bool RemoveDiscount { get; init; }
}

public record AddSalesOrderItemCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid SalesOrderId { get; init; }
    public Guid? ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = "Adet";
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal VatRate { get; init; } = 20;

    /// <summary>
    /// Item-level coupon code. Will be validated and calculated server-side.
    /// </summary>
    public string? CouponCode { get; init; }
}

public record RemoveSalesOrderItemCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid SalesOrderId { get; init; }
    public Guid ItemId { get; init; }
}

public record ApproveSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record ConfirmSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record ShipSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record DeliverSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record CompleteSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
}

public record CancelSalesOrderCommand : IRequest<Result<SalesOrderDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record DeleteSalesOrderCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}
