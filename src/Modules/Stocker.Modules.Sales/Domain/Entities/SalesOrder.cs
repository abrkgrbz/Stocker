using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a sales order in the Sales module
/// </summary>
public class SalesOrder : TenantAggregateRoot
{
    private readonly List<SalesOrderItem> _items = new();

    public string OrderNumber { get; private set; } = string.Empty;
    public DateTime OrderDate { get; private set; }
    public DateTime? DeliveryDate { get; private set; }
    public Guid? CustomerId { get; private set; }
    public string? CustomerName { get; private set; }
    public string? CustomerEmail { get; private set; }
    public Guid? BranchId { get; private set; }
    public Guid? WarehouseId { get; private set; }
    public string? CustomerOrderNumber { get; private set; }
    public decimal SubTotal { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal DiscountRate { get; private set; }
    public decimal VatAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; } = 1;
    public SalesOrderStatus Status { get; private set; }
    public string? ShippingAddress { get; private set; }
    public string? BillingAddress { get; private set; }
    public string? Notes { get; private set; }
    public Guid? SalesPersonId { get; private set; }
    public string? SalesPersonName { get; private set; }
    public bool IsApproved { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public bool IsCancelled { get; private set; }
    public string? CancellationReason { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyList<SalesOrderItem> Items => _items.AsReadOnly();

    private SalesOrder() : base() { }

    public static Result<SalesOrder> Create(
        Guid tenantId,
        string orderNumber,
        DateTime orderDate,
        Guid? customerId = null,
        string? customerName = null,
        string? customerEmail = null,
        string currency = "TRY")
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
            return Result<SalesOrder>.Failure(Error.Validation("SalesOrder.OrderNumber", "Order number is required"));

        var order = new SalesOrder();
        order.Id = Guid.NewGuid();
        order.SetTenantId(tenantId);
        order.OrderNumber = orderNumber;
        order.OrderDate = orderDate;
        order.CustomerId = customerId;
        order.CustomerName = customerName;
        order.CustomerEmail = customerEmail;
        order.Currency = currency;
        order.ExchangeRate = 1;
        order.Status = SalesOrderStatus.Draft;
        order.SubTotal = 0;
        order.DiscountAmount = 0;
        order.DiscountRate = 0;
        order.VatAmount = 0;
        order.TotalAmount = 0;
        order.IsApproved = false;
        order.IsCancelled = false;
        order.CreatedAt = DateTime.UtcNow;

        return Result<SalesOrder>.Success(order);
    }

    public Result AddItem(SalesOrderItem item)
    {
        if (item == null)
            return Result.Failure(Error.Validation("SalesOrder.Item", "Item cannot be null"));

        if (Status != SalesOrderStatus.Draft)
            return Result.Failure(Error.Conflict("SalesOrder.Status", "Cannot add items to a non-draft order"));

        _items.Add(item);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RemoveItem(Guid itemId)
    {
        if (Status != SalesOrderStatus.Draft)
            return Result.Failure(Error.Conflict("SalesOrder.Status", "Cannot remove items from a non-draft order"));

        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return Result.Failure(Error.NotFound("SalesOrder.Item", "Item not found"));

        _items.Remove(item);
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result UpdateCustomer(Guid? customerId, string? customerName, string? customerEmail)
    {
        CustomerId = customerId;
        CustomerName = customerName;
        CustomerEmail = customerEmail;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetDeliveryDate(DateTime deliveryDate)
    {
        if (deliveryDate < OrderDate)
            return Result.Failure(Error.Validation("SalesOrder.DeliveryDate", "Delivery date cannot be before order date"));

        DeliveryDate = deliveryDate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetAddresses(string? shippingAddress, string? billingAddress)
    {
        ShippingAddress = shippingAddress;
        BillingAddress = billingAddress;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetSalesPerson(Guid? salesPersonId, string? salesPersonName)
    {
        SalesPersonId = salesPersonId;
        SalesPersonName = salesPersonName;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result ApplyDiscount(decimal discountAmount, decimal discountRate)
    {
        if (discountAmount < 0)
            return Result.Failure(Error.Validation("SalesOrder.DiscountAmount", "Discount amount cannot be negative"));

        if (discountRate < 0 || discountRate > 100)
            return Result.Failure(Error.Validation("SalesOrder.DiscountRate", "Discount rate must be between 0 and 100"));

        DiscountAmount = discountAmount;
        DiscountRate = discountRate;
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Approve(Guid userId)
    {
        if (IsApproved)
            return Result.Failure(Error.Conflict("SalesOrder.Status", "Order is already approved"));

        if (IsCancelled)
            return Result.Failure(Error.Conflict("SalesOrder.Status", "Cannot approve a cancelled order"));

        if (!_items.Any())
            return Result.Failure(Error.Validation("SalesOrder.Items", "Cannot approve an order without items"));

        IsApproved = true;
        ApprovedBy = userId;
        ApprovedDate = DateTime.UtcNow;
        Status = SalesOrderStatus.Approved;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Confirm()
    {
        if (!IsApproved)
            return Result.Failure(Error.Conflict("SalesOrder.Status", "Order must be approved before confirming"));

        if (Status != SalesOrderStatus.Approved)
            return Result.Failure(Error.Conflict("SalesOrder.Status", "Order must be in approved status"));

        Status = SalesOrderStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Ship()
    {
        if (Status != SalesOrderStatus.Confirmed)
            return Result.Failure(Error.Conflict("SalesOrder.Status", "Order must be confirmed before shipping"));

        Status = SalesOrderStatus.Shipped;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Deliver()
    {
        if (Status != SalesOrderStatus.Shipped)
            return Result.Failure(Error.Conflict("SalesOrder.Status", "Order must be shipped before delivering"));

        Status = SalesOrderStatus.Delivered;
        DeliveryDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Complete()
    {
        if (Status != SalesOrderStatus.Delivered)
            return Result.Failure(Error.Conflict("SalesOrder.Status", "Order must be delivered before completing"));

        Status = SalesOrderStatus.Completed;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Cancel(string reason)
    {
        if (IsCancelled)
            return Result.Failure(Error.Conflict("SalesOrder.Status", "Order is already cancelled"));

        if (Status == SalesOrderStatus.Completed)
            return Result.Failure(Error.Conflict("SalesOrder.Status", "Cannot cancel a completed order"));

        if (string.IsNullOrWhiteSpace(reason))
            return Result.Failure(Error.Validation("SalesOrder.CancellationReason", "Cancellation reason is required"));

        IsCancelled = true;
        CancellationReason = reason;
        Status = SalesOrderStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    private void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.LineTotal);
        VatAmount = _items.Sum(i => i.VatAmount);

        var totalDiscount = DiscountAmount;
        if (DiscountRate > 0)
        {
            totalDiscount += SubTotal * DiscountRate / 100;
        }

        TotalAmount = SubTotal + VatAmount - totalDiscount;
    }
}

public enum SalesOrderStatus
{
    Draft = 0,
    Approved = 1,
    Confirmed = 2,
    Shipped = 3,
    Delivered = 4,
    Completed = 5,
    Cancelled = 6
}
