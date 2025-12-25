using Stocker.Modules.Sales.Domain.ValueObjects;
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
    
    #region Adres Snapshot'ları (Address Snapshots)
    
    /// <summary>Sevkiyat adresi - Sipariş anındaki müşteri adresi kopyası</summary>
    public ShippingAddressSnapshot? ShippingAddressSnapshot { get; private set; }
    
    /// <summary>Fatura adresi - Sipariş anındaki fatura adresi kopyası</summary>
    public ShippingAddressSnapshot? BillingAddressSnapshot { get; private set; }
    
    /// <summary>Legacy: String olarak adres (geriye uyumluluk için)</summary>
    public string? ShippingAddress { get; private set; }
    
    /// <summary>Legacy: String olarak fatura adresi (geriye uyumluluk için)</summary>
    public string? BillingAddress { get; private set; }
    
    #endregion
    
    #region Kaynak Belge İlişkileri (Source Document Relations)
    
    /// <summary>Tekliften dönüştürüldüyse teklif ID'si</summary>
    public Guid? QuotationId { get; private set; }
    
    /// <summary>Teklif numarası (snapshot)</summary>
    public string? QuotationNumber { get; private set; }
    
    /// <summary>CRM Fırsat ID'si</summary>
    public Guid? OpportunityId { get; private set; }
    
    /// <summary>Müşteri sözleşmesi ID'si</summary>
    public Guid? CustomerContractId { get; private set; }
    
    #endregion
    
    #region Faturalama Durumu (Invoicing Status)
    
    /// <summary>Faturalama durumu</summary>
    public InvoicingStatus InvoicingStatus { get; private set; }
    
    /// <summary>Toplam faturalanan tutar</summary>
    public decimal TotalInvoicedAmount { get; private set; }
    
    /// <summary>Faturalanamayan tutar</summary>
    public decimal RemainingInvoiceAmount => TotalAmount - TotalInvoicedAmount;
    
    #endregion
    
    #region Sevkiyat Durumu (Fulfillment Status)

    /// <summary>Sevkiyat durumu</summary>
    public FulfillmentStatus FulfillmentStatus { get; private set; }

    /// <summary>Tamamlanan sevkiyat sayısı</summary>
    public int CompletedShipmentCount { get; private set; }

    #endregion

    #region Phase 3: Stock Reservation & Payment Integration

    /// <summary>Total quantity reserved across all items</summary>
    public decimal TotalReservedQuantity { get; private set; }

    /// <summary>Indicates if stock has been reserved for this order</summary>
    public bool IsStockReserved { get; private set; }

    /// <summary>Reservation expiry date</summary>
    public DateTime? ReservationExpiryDate { get; private set; }

    /// <summary>Total paid from linked AdvancePayments</summary>
    public decimal TotalAdvancePaymentAmount { get; private set; }

    /// <summary>Total paid from regular Payments</summary>
    public decimal TotalPaymentAmount { get; private set; }

    /// <summary>Total amount paid (AdvancePayments + Payments)</summary>
    public decimal TotalPaid => TotalAdvancePaymentAmount + TotalPaymentAmount;

    /// <summary>Remaining balance to be paid</summary>
    public decimal RemainingBalance => TotalAmount - TotalPaid;

    /// <summary>Payment status calculated from payments</summary>
    public OrderPaymentStatus PaymentStatus { get; private set; }

    /// <summary>Due date for payment</summary>
    public DateTime? PaymentDueDate { get; private set; }

    /// <summary>Indicates if payment is overdue</summary>
    public bool IsPaymentOverdue => PaymentDueDate.HasValue &&
                                    DateTime.UtcNow > PaymentDueDate.Value &&
                                    PaymentStatus != OrderPaymentStatus.Paid;

    /// <summary>Linked BackOrder count (for completion check)</summary>
    public int UnresolvedBackOrderCount { get; private set; }

    /// <summary>Territory ID for regional sales</summary>
    public Guid? TerritoryId { get; private set; }

    /// <summary>Territory name snapshot</summary>
    public string? TerritoryName { get; private set; }

    #endregion

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
        order.InvoicingStatus = InvoicingStatus.NotInvoiced;
        order.FulfillmentStatus = FulfillmentStatus.Pending;
        order.TotalInvoicedAmount = 0;
        order.CompletedShipmentCount = 0;
        // Phase 3: Initialize payment and reservation fields
        order.TotalAdvancePaymentAmount = 0;
        order.TotalPaymentAmount = 0;
        order.TotalReservedQuantity = 0;
        order.IsStockReserved = false;
        order.PaymentStatus = OrderPaymentStatus.Unpaid;
        order.UnresolvedBackOrderCount = 0;
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

    /// <summary>
    /// Yapılandırılmış adres snapshot'ları ayarlar (önerilen yöntem)
    /// </summary>
    public Result SetAddressSnapshots(
        ShippingAddressSnapshot? shippingAddressSnapshot,
        ShippingAddressSnapshot? billingAddressSnapshot)
    {
        ShippingAddressSnapshot = shippingAddressSnapshot;
        BillingAddressSnapshot = billingAddressSnapshot;
        
        // Legacy alanları da güncelle (geriye uyumluluk)
        ShippingAddress = shippingAddressSnapshot?.ToString();
        BillingAddress = billingAddressSnapshot?.ToString();
        
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Tekliften oluşturulan siparişi işaretler
    /// </summary>
    public Result SetSourceQuotation(Guid quotationId, string? quotationNumber)
    {
        QuotationId = quotationId;
        QuotationNumber = quotationNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Fırsat ilişkisini ayarlar
    /// </summary>
    public Result SetOpportunity(Guid opportunityId)
    {
        OpportunityId = opportunityId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Müşteri sözleşmesini ilişkilendirir
    /// </summary>
    public Result SetCustomerContract(Guid contractId)
    {
        CustomerContractId = contractId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Faturalama tutarını günceller
    /// </summary>
    public Result RecordInvoicedAmount(decimal amount)
    {
        if (amount < 0)
            return Result.Failure(Error.Validation("SalesOrder.InvoicedAmount", "Fatura tutarı negatif olamaz."));

        TotalInvoicedAmount += amount;
        
        if (TotalInvoicedAmount >= TotalAmount)
            InvoicingStatus = InvoicingStatus.FullyInvoiced;
        else if (TotalInvoicedAmount > 0)
            InvoicingStatus = InvoicingStatus.PartiallyInvoiced;
        
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Sevkiyat tamamlandığında çağrılır
    /// </summary>
    public Result RecordShipmentCompleted()
    {
        CompletedShipmentCount++;
        
        // Tüm kalemler teslim edildiyse fulfilled olarak işaretle
        if (_items.All(i => i.IsDelivered))
            FulfillmentStatus = FulfillmentStatus.Fulfilled;
        else if (_items.Any(i => i.DeliveredQuantity > 0))
            FulfillmentStatus = FulfillmentStatus.PartiallyFulfilled;
        
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Sevkiyat durumunu manuel ayarlar
    /// </summary>
    public Result SetFulfillmentStatus(FulfillmentStatus status)
    {
        FulfillmentStatus = status;
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

        // Phase 3: Check for unresolved back orders
        if (UnresolvedBackOrderCount > 0)
            return Result.Failure(Error.Validation("SalesOrder.BackOrders",
                $"Cannot complete order with {UnresolvedBackOrderCount} unresolved back orders"));

        Status = SalesOrderStatus.Completed;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #region Phase 3: Split Shipments & Partial Fulfillment

    /// <summary>
    /// Creates a partial shipment for selected items.
    /// Updates item quantities and creates data for Shipment creation.
    /// </summary>
    public Result<ShipmentCreationData> CreateShipment(
        string shipmentNumber,
        List<(Guid ItemId, decimal Quantity)> itemsToShip,
        DateTime shipmentDate)
    {
        if (Status != SalesOrderStatus.Confirmed && Status != SalesOrderStatus.Shipped)
            return Result<ShipmentCreationData>.Failure(
                Error.Validation("SalesOrder.Status", "Order must be confirmed before creating shipments"));

        if (!itemsToShip.Any())
            return Result<ShipmentCreationData>.Failure(
                Error.Validation("SalesOrder.Shipment", "At least one item must be specified for shipment"));

        var shipmentItems = new List<ShipmentItemData>();

        foreach (var (itemId, quantity) in itemsToShip)
        {
            var item = _items.FirstOrDefault(i => i.Id == itemId);
            if (item == null)
                return Result<ShipmentCreationData>.Failure(
                    Error.NotFound("SalesOrder.Item", $"Item {itemId} not found"));

            var remaining = item.GetRemainingQuantity();
            if (quantity > remaining)
                return Result<ShipmentCreationData>.Failure(
                    Error.Validation("SalesOrder.ShipmentQuantity",
                        $"Cannot ship {quantity} of {item.ProductCode}. Only {remaining} remaining."));

            // Update item's delivered quantity
            var updateResult = item.UpdateDeliveredQuantity(item.DeliveredQuantity + quantity);
            if (!updateResult.IsSuccess)
                return Result<ShipmentCreationData>.Failure(updateResult.Error!);

            shipmentItems.Add(new ShipmentItemData(
                itemId,
                item.ProductId,
                item.ProductCode,
                item.ProductName,
                quantity,
                item.Unit
            ));
        }

        // Update fulfillment status
        if (_items.All(i => i.IsDelivered))
            FulfillmentStatus = FulfillmentStatus.Fulfilled;
        else if (_items.Any(i => i.DeliveredQuantity > 0))
            FulfillmentStatus = FulfillmentStatus.PartiallyFulfilled;

        // Update order status
        if (Status == SalesOrderStatus.Confirmed)
            Status = SalesOrderStatus.Shipped;

        CompletedShipmentCount++;
        UpdatedAt = DateTime.UtcNow;

        var shipmentData = new ShipmentCreationData(
            Id,
            OrderNumber,
            shipmentNumber,
            shipmentDate,
            CustomerId,
            CustomerName,
            ShippingAddress,
            WarehouseId,
            Currency,
            shipmentItems
        );

        return Result<ShipmentCreationData>.Success(shipmentData);
    }

    /// <summary>
    /// Gets items that have remaining quantity to ship
    /// </summary>
    public IEnumerable<SalesOrderItem> GetItemsAvailableForShipment()
    {
        return _items.Where(i => i.GetRemainingQuantity() > 0);
    }

    /// <summary>
    /// Checks if order has any items pending shipment
    /// </summary>
    public bool HasPendingShipments => _items.Any(i => !i.IsDelivered);

    #endregion

    #region Phase 3: Stock Reservation Integration

    /// <summary>
    /// Records that stock has been reserved for this order.
    /// Called after InventoryReservation entities are created.
    /// </summary>
    public Result RecordStockReservation(decimal totalQuantityReserved, DateTime expiryDate)
    {
        if (IsStockReserved)
            return Result.Failure(Error.Conflict("SalesOrder.Reservation", "Stock is already reserved for this order"));

        TotalReservedQuantity = totalQuantityReserved;
        IsStockReserved = true;
        ReservationExpiryDate = expiryDate;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Releases all stock reservations for this order.
    /// Called when order is cancelled or reservations expire.
    /// </summary>
    public Result ReleaseStockReservation()
    {
        if (!IsStockReserved)
            return Result.Failure(Error.Validation("SalesOrder.NoReservation", "No stock reservation exists for this order"));

        TotalReservedQuantity = 0;
        IsStockReserved = false;
        ReservationExpiryDate = null;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates reserved quantity when partial allocation occurs
    /// </summary>
    public Result UpdateReservedQuantity(decimal newQuantity)
    {
        TotalReservedQuantity = newQuantity;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Extends reservation expiry date
    /// </summary>
    public Result ExtendReservation(DateTime newExpiryDate)
    {
        if (!IsStockReserved)
            return Result.Failure(Error.Validation("SalesOrder.NoReservation", "No stock reservation exists for this order"));

        if (newExpiryDate <= ReservationExpiryDate)
            return Result.Failure(Error.Validation("SalesOrder.InvalidExpiry", "New expiry date must be after current expiry"));

        ReservationExpiryDate = newExpiryDate;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Gets the list of items that need stock reservation
    /// </summary>
    public IEnumerable<(Guid? ProductId, string ProductCode, decimal Quantity, string Unit)> GetItemsForReservation()
    {
        return _items.Select(i => (i.ProductId, i.ProductCode, i.Quantity, i.Unit));
    }

    #endregion

    #region Phase 3: Payment Integration

    /// <summary>
    /// Records an advance payment applied to this order
    /// </summary>
    public Result RecordAdvancePayment(decimal amount)
    {
        if (amount <= 0)
            return Result.Failure(Error.Validation("SalesOrder.Payment", "Payment amount must be positive"));

        if (amount > RemainingBalance)
            return Result.Failure(Error.Validation("SalesOrder.Payment", "Payment amount exceeds remaining balance"));

        TotalAdvancePaymentAmount += amount;
        UpdatePaymentStatus();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Records a regular payment for this order
    /// </summary>
    public Result RecordPayment(decimal amount)
    {
        if (amount <= 0)
            return Result.Failure(Error.Validation("SalesOrder.Payment", "Payment amount must be positive"));

        if (amount > RemainingBalance)
            return Result.Failure(Error.Validation("SalesOrder.Payment", "Payment amount exceeds remaining balance"));

        TotalPaymentAmount += amount;
        UpdatePaymentStatus();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Reverses a payment (for refunds or corrections)
    /// </summary>
    public Result ReversePayment(decimal amount, bool isAdvancePayment)
    {
        if (amount <= 0)
            return Result.Failure(Error.Validation("SalesOrder.Payment", "Amount must be positive"));

        if (isAdvancePayment)
        {
            if (amount > TotalAdvancePaymentAmount)
                return Result.Failure(Error.Validation("SalesOrder.Payment", "Reversal amount exceeds advance payment total"));
            TotalAdvancePaymentAmount -= amount;
        }
        else
        {
            if (amount > TotalPaymentAmount)
                return Result.Failure(Error.Validation("SalesOrder.Payment", "Reversal amount exceeds payment total"));
            TotalPaymentAmount -= amount;
        }

        UpdatePaymentStatus();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Sets the payment due date
    /// </summary>
    public Result SetPaymentDueDate(DateTime dueDate)
    {
        PaymentDueDate = dueDate;
        UpdatePaymentStatus();
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    private void UpdatePaymentStatus()
    {
        if (TotalPaid >= TotalAmount)
        {
            PaymentStatus = OrderPaymentStatus.Paid;
        }
        else if (TotalPaid > 0)
        {
            PaymentStatus = OrderPaymentStatus.PartiallyPaid;
        }
        else if (IsPaymentOverdue)
        {
            PaymentStatus = OrderPaymentStatus.Overdue;
        }
        else
        {
            PaymentStatus = OrderPaymentStatus.Unpaid;
        }
    }

    /// <summary>
    /// Checks if order meets minimum payment requirements
    /// </summary>
    public bool MeetsPaymentRequirement(decimal requiredPercentage)
    {
        if (TotalAmount == 0) return true;
        var paidPercentage = (TotalPaid / TotalAmount) * 100;
        return paidPercentage >= requiredPercentage;
    }

    #endregion

    #region Phase 3: BackOrder Integration

    /// <summary>
    /// Records a back order created for this sales order
    /// </summary>
    public Result RecordBackOrderCreated()
    {
        UnresolvedBackOrderCount++;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Records a back order being resolved (fulfilled or cancelled)
    /// </summary>
    public Result RecordBackOrderResolved()
    {
        if (UnresolvedBackOrderCount <= 0)
            return Result.Failure(Error.Validation("SalesOrder.BackOrder", "No unresolved back orders to resolve"));

        UnresolvedBackOrderCount--;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Checks if order can be completed (no pending back orders)
    /// </summary>
    public bool CanComplete => UnresolvedBackOrderCount == 0 && Status == SalesOrderStatus.Delivered;

    #endregion

    #region Phase 3: Territory Integration

    /// <summary>
    /// Assigns the order to a sales territory
    /// </summary>
    public Result SetTerritory(Guid territoryId, string territoryName)
    {
        TerritoryId = territoryId;
        TerritoryName = territoryName;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Removes territory assignment
    /// </summary>
    public Result RemoveTerritory()
    {
        TerritoryId = null;
        TerritoryName = null;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

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

/// <summary>
/// Faturalama durumu / Invoicing status
/// </summary>
public enum InvoicingStatus
{
    /// <summary>Henüz fatura kesilmedi</summary>
    NotInvoiced = 0,
    
    /// <summary>Kısmi fatura kesildi</summary>
    PartiallyInvoiced = 1,
    
    /// <summary>Tam fatura kesildi</summary>
    FullyInvoiced = 2
}

/// <summary>
/// Sevkiyat/teslimat durumu / Fulfillment status
/// </summary>
public enum FulfillmentStatus
{
    /// <summary>Beklemede</summary>
    Pending = 0,

    /// <summary>Hazırlanıyor</summary>
    Preparing = 1,

    /// <summary>Kısmi sevkiyat yapıldı</summary>
    PartiallyFulfilled = 2,

    /// <summary>Tam sevkiyat yapıldı</summary>
    Fulfilled = 3,

    /// <summary>Teslim edildi</summary>
    Delivered = 4
}

/// <summary>
/// Order payment status / Sipariş ödeme durumu
/// </summary>
public enum OrderPaymentStatus
{
    /// <summary>Ödenmemiş</summary>
    Unpaid = 0,

    /// <summary>Kısmi ödeme yapılmış</summary>
    PartiallyPaid = 1,

    /// <summary>Tam ödeme yapılmış</summary>
    Paid = 2,

    /// <summary>Vadesi geçmiş</summary>
    Overdue = 3
}

#region Phase 3: Supporting Data Classes

/// <summary>
/// Data class for shipment creation from SalesOrder
/// </summary>
public class ShipmentCreationData
{
    public Guid SalesOrderId { get; }
    public string SalesOrderNumber { get; }
    public string ShipmentNumber { get; }
    public DateTime ShipmentDate { get; }
    public Guid? CustomerId { get; }
    public string? CustomerName { get; }
    public string? ShippingAddress { get; }
    public Guid? WarehouseId { get; }
    public string Currency { get; }
    public IReadOnlyList<ShipmentItemData> Items { get; }

    public ShipmentCreationData(
        Guid salesOrderId,
        string salesOrderNumber,
        string shipmentNumber,
        DateTime shipmentDate,
        Guid? customerId,
        string? customerName,
        string? shippingAddress,
        Guid? warehouseId,
        string currency,
        List<ShipmentItemData> items)
    {
        SalesOrderId = salesOrderId;
        SalesOrderNumber = salesOrderNumber;
        ShipmentNumber = shipmentNumber;
        ShipmentDate = shipmentDate;
        CustomerId = customerId;
        CustomerName = customerName;
        ShippingAddress = shippingAddress;
        WarehouseId = warehouseId;
        Currency = currency;
        Items = items.AsReadOnly();
    }
}

/// <summary>
/// Data class for shipment item creation
/// </summary>
public class ShipmentItemData
{
    public Guid SalesOrderItemId { get; }
    public Guid? ProductId { get; }
    public string ProductCode { get; }
    public string ProductName { get; }
    public decimal Quantity { get; }
    public string Unit { get; }

    public ShipmentItemData(
        Guid salesOrderItemId,
        Guid? productId,
        string productCode,
        string productName,
        decimal quantity,
        string unit)
    {
        SalesOrderItemId = salesOrderItemId;
        ProductId = productId;
        ProductCode = productCode;
        ProductName = productName;
        Quantity = quantity;
        Unit = unit;
    }
}

#endregion
