using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Purchase.Domain.Entities;

public class PurchaseOrder : BaseEntity
{
    public string OrderNumber { get; private set; }
    public DateTime OrderDate { get; private set; }
    public DateTime? ExpectedDeliveryDate { get; private set; }
    public int SupplierId { get; private set; }
    public int? BranchId { get; private set; }
    public int? WarehouseId { get; private set; }
    public string? SupplierOrderNumber { get; private set; }
    public Money SubTotal { get; private set; }
    public Money DiscountAmount { get; private set; }
    public Money VatAmount { get; private set; }
    public Money TotalAmount { get; private set; }
    public string Currency { get; private set; }
    public decimal ExchangeRate { get; private set; }
    public string Status { get; private set; }
    public string? DeliveryAddress { get; private set; }
    public string? Notes { get; private set; }
    public int? PurchaserId { get; private set; }
    public bool IsApproved { get; private set; }
    public int? ApprovedBy { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public bool IsCancelled { get; private set; }
    public string? CancellationReason { get; private set; }
    public int PaymentTerm { get; private set; }
    
    public virtual ICollection<PurchaseOrderItem> Items { get; private set; }
    
    protected PurchaseOrder() { }
    
    public PurchaseOrder(
        string orderNumber,
        DateTime orderDate,
        int supplierId,
        int? branchId,
        int? warehouseId,
        string currency = "TRY")
    {
        OrderNumber = orderNumber;
        OrderDate = orderDate;
        SupplierId = supplierId;
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
        PaymentTerm = 30;
        Items = new List<PurchaseOrderItem>();
    }
    
    public void AddItem(PurchaseOrderItem item)
    {
        Items.Add(item);
        RecalculateTotals();
    }
    
    public void RemoveItem(PurchaseOrderItem item)
    {
        Items.Remove(item);
        RecalculateTotals();
    }
    
    public void SetExpectedDeliveryDate(DateTime deliveryDate)
    {
        ExpectedDeliveryDate = deliveryDate;
    }
    
    public void SetDeliveryAddress(string deliveryAddress)
    {
        DeliveryAddress = deliveryAddress;
    }
    
    public void SetPurchaser(int purchaserId)
    {
        PurchaserId = purchaserId;
    }
    
    public void SetNotes(string notes)
    {
        Notes = notes;
    }
    
    public void SetPaymentTerm(int days)
    {
        PaymentTerm = days;
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