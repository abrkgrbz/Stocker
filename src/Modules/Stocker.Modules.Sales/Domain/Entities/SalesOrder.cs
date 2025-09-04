using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Sales.Domain.Entities;

public class SalesOrder : BaseEntity
{
    public string OrderNumber { get; private set; }
    public DateTime OrderDate { get; private set; }
    public DateTime? DeliveryDate { get; private set; }
    public int CustomerId { get; private set; }
    public int? BranchId { get; private set; }
    public int? WarehouseId { get; private set; }
    public string? CustomerOrderNumber { get; private set; }
    public Money SubTotal { get; private set; }
    public Money DiscountAmount { get; private set; }
    public Money VatAmount { get; private set; }
    public Money TotalAmount { get; private set; }
    public string Currency { get; private set; }
    public decimal ExchangeRate { get; private set; }
    public string Status { get; private set; }
    public string? ShippingAddress { get; private set; }
    public string? BillingAddress { get; private set; }
    public string? Notes { get; private set; }
    public int? SalesPersonId { get; private set; }
    public bool IsApproved { get; private set; }
    public int? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public bool IsCancelled { get; private set; }
    public string? CancellationReason { get; private set; }
    
    public virtual ICollection<SalesOrderItem> Items { get; private set; }
    
    protected SalesOrder() { }
    
    public SalesOrder(
        string orderNumber,
        DateTime orderDate,
        int customerId,
        int? branchId,
        int? warehouseId,
        string currency = "TRY")
    {
        OrderNumber = orderNumber;
        OrderDate = orderDate;
        CustomerId = customerId;
        BranchId = branchId;
        WarehouseId = warehouseId;
        Currency = currency;
        ExchangeRate = 1;
        Status = "Draft";
        SubTotal = Money.Create(0, currency);
        DiscountAmount = Money.Create(0, currency);
        VatAmount = Money.Create(0, currency);
        TotalAmount = Money.Create(0, currency);
        IsApproved = false;
        IsCancelled = false;
        Items = new List<SalesOrderItem>();
    }
    
    public void AddItem(SalesOrderItem item)
    {
        Items.Add(item);
        RecalculateTotals();
    }
    
    public void RemoveItem(SalesOrderItem item)
    {
        Items.Remove(item);
        RecalculateTotals();
    }
    
    public void SetDeliveryDate(DateTime deliveryDate)
    {
        DeliveryDate = deliveryDate;
    }
    
    public void SetAddresses(string? shippingAddress, string? billingAddress)
    {
        ShippingAddress = shippingAddress;
        BillingAddress = billingAddress;
    }
    
    public void SetSalesPerson(int salesPersonId)
    {
        SalesPersonId = salesPersonId;
    }
    
    public void SetNotes(string notes)
    {
        Notes = notes;
    }
    
    public void ApplyDiscount(Money discountAmount)
    {
        DiscountAmount = discountAmount;
        RecalculateTotals();
    }
    
    public void Approve(int userId)
    {
        if (IsApproved)
            throw new InvalidOperationException("Order is already approved");
            
        if (IsCancelled)
            throw new InvalidOperationException("Cannot approve a cancelled order");
            
        IsApproved = true;
        ApprovedBy = userId;
        ApprovedDate = DateTime.UtcNow;
        Status = "Approved";
    }
    
    public void Cancel(string reason)
    {
        if (IsCancelled)
            throw new InvalidOperationException("Order is already cancelled");
            
        IsCancelled = true;
        CancellationReason = reason;
        Status = "Cancelled";
    }
    
    public void UpdateStatus(string status)
    {
        Status = status;
    }
    
    private void RecalculateTotals()
    {
        SubTotal = Money.Create(Items.Sum(i => i.TotalAmount.Amount), Currency);
        VatAmount = Money.Create(Items.Sum(i => i.VatAmount.Amount), Currency);
        TotalAmount = Money.Create(
            SubTotal.Amount + VatAmount.Amount - DiscountAmount.Amount,
            Currency);
    }
}