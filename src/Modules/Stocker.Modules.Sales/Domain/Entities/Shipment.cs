using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Sevkiyat entity'si - Sipariş sevkiyat takibi ve kısmi sevkiyat desteği
/// Shipment entity - Order shipment tracking with partial shipment support
/// Türkiye'de satış akışı: Sipariş → Sevkiyat → İrsaliye → Fatura
/// Turkey sales flow: Order → Shipment → Delivery Note → Invoice
/// </summary>
public class Shipment : TenantAggregateRoot
{
    private readonly List<ShipmentItem> _items = new();

    #region Temel Bilgiler (Basic Information)

    public string ShipmentNumber { get; private set; } = string.Empty;
    public Guid SalesOrderId { get; private set; }
    public string SalesOrderNumber { get; private set; } = string.Empty;
    public DateTime ShipmentDate { get; private set; }
    public DateTime? ExpectedDeliveryDate { get; private set; }
    public DateTime? ActualDeliveryDate { get; private set; }

    #endregion

    #region Müşteri Bilgileri (Customer Information)

    public Guid? CustomerId { get; private set; }
    public string? CustomerName { get; private set; }
    public string? RecipientName { get; private set; }
    public string? RecipientPhone { get; private set; }

    #endregion

    #region Adres Bilgileri (Address Information)

    public string ShippingAddress { get; private set; } = string.Empty;
    public string? ShippingDistrict { get; private set; }
    public string? ShippingCity { get; private set; }
    public string ShippingCountry { get; private set; } = "Türkiye";
    public string? ShippingPostalCode { get; private set; }

    #endregion

    #region Taşıma Bilgileri (Carrier Information)

    public ShipmentType ShipmentType { get; private set; }
    public Guid? CarrierId { get; private set; }
    public string? CarrierName { get; private set; }
    public string? TrackingNumber { get; private set; }
    public string? TrackingUrl { get; private set; }
    public string? VehiclePlate { get; private set; }
    public string? DriverName { get; private set; }
    public string? DriverPhone { get; private set; }

    #endregion

    #region Ölçüm ve Maliyet (Measurement and Cost)

    public decimal TotalWeight { get; private set; }
    public decimal? TotalVolume { get; private set; }
    public int PackageCount { get; private set; }
    public decimal ShippingCost { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal? InsuranceAmount { get; private set; }
    public decimal? CustomerShippingFee { get; private set; }
    public bool IsFreeShipping { get; private set; }

    #endregion

    #region Depo Bilgileri (Warehouse Information)

    public Guid? WarehouseId { get; private set; }
    public string? WarehouseName { get; private set; }
    public Guid? BranchId { get; private set; }

    #endregion

    #region Durum ve İzleme (Status and Tracking)

    public ShipmentStatus Status { get; private set; }
    public bool IsDeliveryNoteCreated { get; private set; }
    public Guid? DeliveryNoteId { get; private set; }
    public bool IsInvoiced { get; private set; }
    public Guid? InvoiceId { get; private set; }
    public string? ProofOfDelivery { get; private set; }
    public string? ReceivedBy { get; private set; }
    public string? DeliveryNotes { get; private set; }

    #endregion

    #region Genel Bilgiler (General Information)

    public string? Notes { get; private set; }
    public string? SpecialInstructions { get; private set; }
    public ShipmentPriority Priority { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public Guid? CreatedBy { get; private set; }

    #endregion

    public IReadOnlyList<ShipmentItem> Items => _items.AsReadOnly();

    private Shipment() { }

    public static Result<Shipment> Create(
        Guid tenantId,
        string shipmentNumber,
        Guid salesOrderId,
        string salesOrderNumber,
        DateTime shipmentDate,
        string shippingAddress,
        ShipmentType shipmentType = ShipmentType.Cargo)
    {
        if (string.IsNullOrWhiteSpace(shipmentNumber))
            return Result<Shipment>.Failure(Error.Validation("Shipment.Number", "Sevkiyat numarası gereklidir."));

        if (salesOrderId == Guid.Empty)
            return Result<Shipment>.Failure(Error.Validation("Shipment.Order", "Sipariş ID gereklidir."));

        if (string.IsNullOrWhiteSpace(shippingAddress))
            return Result<Shipment>.Failure(Error.Validation("Shipment.Address", "Sevkiyat adresi gereklidir."));

        var shipment = new Shipment();
        shipment.Id = Guid.NewGuid();
        shipment.SetTenantId(tenantId);
        shipment.ShipmentNumber = shipmentNumber;
        shipment.SalesOrderId = salesOrderId;
        shipment.SalesOrderNumber = salesOrderNumber;
        shipment.ShipmentDate = shipmentDate;
        shipment.ShippingAddress = shippingAddress;
        shipment.ShipmentType = shipmentType;
        shipment.Status = ShipmentStatus.Draft;
        shipment.Priority = ShipmentPriority.Normal;
        shipment.CreatedAt = DateTime.UtcNow;

        return Result<Shipment>.Success(shipment);
    }

    public static Result<Shipment> CreateFromOrder(
        Guid tenantId,
        string shipmentNumber,
        SalesOrder order,
        DateTime shipmentDate)
    {
        var result = Create(
            tenantId,
            shipmentNumber,
            order.Id,
            order.OrderNumber,
            shipmentDate,
            order.ShippingAddress ?? order.BillingAddress ?? "",
            ShipmentType.Cargo);

        if (!result.IsSuccess)
            return result;

        var shipment = result.Value!;
        shipment.CustomerId = order.CustomerId;
        shipment.CustomerName = order.CustomerName;
        shipment.WarehouseId = order.WarehouseId;
        shipment.BranchId = order.BranchId;
        shipment.Currency = order.Currency;

        return Result<Shipment>.Success(shipment);
    }

    public Result<ShipmentItem> AddItem(
        Guid salesOrderItemId,
        Guid productId,
        string productCode,
        string productName,
        decimal quantity,
        string unit,
        decimal? weight = null)
    {
        if (Status != ShipmentStatus.Draft && Status != ShipmentStatus.Preparing)
            return Result<ShipmentItem>.Failure(Error.Validation("Shipment.Status", "Sadece taslak veya hazırlanan sevkiyatlara kalem eklenebilir."));

        var itemResult = ShipmentItem.Create(
            Id,
            salesOrderItemId,
            productId,
            productCode,
            productName,
            quantity,
            unit,
            weight);

        if (!itemResult.IsSuccess)
            return itemResult;

        _items.Add(itemResult.Value!);
        CalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return itemResult;
    }

    private void CalculateTotals()
    {
        TotalWeight = _items.Sum(i => i.TotalWeight);
        PackageCount = _items.Sum(i => i.PackageCount);
    }

    public Result StartPreparing()
    {
        if (Status != ShipmentStatus.Draft)
            return Result.Failure(Error.Validation("Shipment.Status", "Sadece taslak sevkiyatlar hazırlanmaya başlanabilir."));

        if (!_items.Any())
            return Result.Failure(Error.Validation("Shipment.Items", "En az bir kalem gereklidir."));

        Status = ShipmentStatus.Preparing;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result MarkAsReady()
    {
        if (Status != ShipmentStatus.Preparing)
            return Result.Failure(Error.Validation("Shipment.Status", "Sadece hazırlanan sevkiyatlar hazır olarak işaretlenebilir."));

        Status = ShipmentStatus.Ready;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Ship(string? trackingNumber = null)
    {
        if (Status != ShipmentStatus.Ready)
            return Result.Failure(Error.Validation("Shipment.Status", "Sadece hazır sevkiyatlar sevk edilebilir."));

        if (!string.IsNullOrWhiteSpace(trackingNumber))
            TrackingNumber = trackingNumber;

        Status = ShipmentStatus.Shipped;
        ShipmentDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result MarkAsInTransit()
    {
        if (Status != ShipmentStatus.Shipped)
            return Result.Failure(Error.Validation("Shipment.Status", "Sadece sevk edilmiş gönderiler yola çıkabilir."));

        Status = ShipmentStatus.InTransit;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Deliver(string? receivedBy = null, string? notes = null)
    {
        if (Status != ShipmentStatus.Shipped && Status != ShipmentStatus.InTransit)
            return Result.Failure(Error.Validation("Shipment.Status", "Sadece sevk edilmiş veya yolda olan gönderiler teslim edilebilir."));

        ActualDeliveryDate = DateTime.UtcNow;
        ReceivedBy = receivedBy;
        if (!string.IsNullOrWhiteSpace(notes))
            DeliveryNotes = notes;

        Status = ShipmentStatus.Delivered;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result MarkAsReturned(string reason)
    {
        if (Status != ShipmentStatus.Shipped && Status != ShipmentStatus.InTransit && Status != ShipmentStatus.Delivered)
            return Result.Failure(Error.Validation("Shipment.Status", "Bu durumdaki sevkiyat iade edilemez."));

        Notes = $"İade nedeni: {reason}. {Notes}";
        Status = ShipmentStatus.Returned;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Cancel(string reason)
    {
        if (Status == ShipmentStatus.Delivered)
            return Result.Failure(Error.Validation("Shipment.Status", "Teslim edilmiş sevkiyat iptal edilemez."));

        Notes = $"İptal nedeni: {reason}. {Notes}";
        Status = ShipmentStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public void LinkDeliveryNote(Guid deliveryNoteId)
    {
        DeliveryNoteId = deliveryNoteId;
        IsDeliveryNoteCreated = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkInvoice(Guid invoiceId)
    {
        InvoiceId = invoiceId;
        IsInvoiced = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCustomer(Guid? customerId, string? customerName)
    {
        CustomerId = customerId;
        CustomerName = customerName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRecipient(string? name, string? phone)
    {
        RecipientName = name;
        RecipientPhone = phone;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetShippingAddress(string address, string? district, string? city, string? country, string? postalCode)
    {
        ShippingAddress = address;
        ShippingDistrict = district;
        ShippingCity = city;
        ShippingCountry = country ?? "Türkiye";
        ShippingPostalCode = postalCode;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCarrier(Guid? carrierId, string? carrierName, string? trackingNumber = null)
    {
        CarrierId = carrierId;
        CarrierName = carrierName;
        TrackingNumber = trackingNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetVehicleInfo(string? plate, string? driverName, string? driverPhone)
    {
        VehiclePlate = plate;
        DriverName = driverName;
        DriverPhone = driverPhone;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetWarehouse(Guid? warehouseId, string? warehouseName)
    {
        WarehouseId = warehouseId;
        WarehouseName = warehouseName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetExpectedDeliveryDate(DateTime? date)
    {
        ExpectedDeliveryDate = date;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetShippingCost(decimal cost, decimal? insuranceAmount = null, decimal? customerFee = null)
    {
        ShippingCost = cost;
        InsuranceAmount = insuranceAmount;
        CustomerShippingFee = customerFee;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetFreeShipping(bool isFree)
    {
        IsFreeShipping = isFree;
        if (isFree) CustomerShippingFee = 0;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPriority(ShipmentPriority priority)
    {
        Priority = priority;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetSpecialInstructions(string? instructions)
    {
        SpecialInstructions = instructions;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetTrackingUrl(string? url)
    {
        TrackingUrl = url;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetProofOfDelivery(string? proof)
    {
        ProofOfDelivery = proof;
        UpdatedAt = DateTime.UtcNow;
    }
}

public class ShipmentItem : Entity<Guid>
{
    public Guid ShipmentId { get; private set; }
    public Guid SalesOrderItemId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = string.Empty;
    public decimal? UnitWeight { get; private set; }
    public decimal TotalWeight { get; private set; }
    public int PackageCount { get; private set; } = 1;
    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public string? Notes { get; private set; }

    private ShipmentItem() { }

    internal static Result<ShipmentItem> Create(
        Guid shipmentId,
        Guid salesOrderItemId,
        Guid productId,
        string productCode,
        string productName,
        decimal quantity,
        string unit,
        decimal? unitWeight = null)
    {
        if (quantity <= 0)
            return Result<ShipmentItem>.Failure(Error.Validation("ShipmentItem.Quantity", "Miktar pozitif olmalıdır."));

        if (string.IsNullOrWhiteSpace(productCode))
            return Result<ShipmentItem>.Failure(Error.Validation("ShipmentItem.ProductCode", "Ürün kodu gereklidir."));

        var item = new ShipmentItem
        {
            Id = Guid.NewGuid(),
            ShipmentId = shipmentId,
            SalesOrderItemId = salesOrderItemId,
            ProductId = productId,
            ProductCode = productCode,
            ProductName = productName,
            Quantity = quantity,
            Unit = unit,
            UnitWeight = unitWeight,
            TotalWeight = (unitWeight ?? 0) * quantity
        };

        return Result<ShipmentItem>.Success(item);
    }

    public void SetLotNumber(string? lotNumber) => LotNumber = lotNumber;
    public void SetSerialNumber(string? serialNumber) => SerialNumber = serialNumber;
    public void SetExpiryDate(DateTime? date) => ExpiryDate = date;
    public void SetPackageCount(int count) => PackageCount = count > 0 ? count : 1;
    public void SetNotes(string? notes) => Notes = notes;

    public void UpdateQuantity(decimal quantity)
    {
        Quantity = quantity;
        TotalWeight = (UnitWeight ?? 0) * quantity;
    }
}

public enum ShipmentType
{
    Cargo = 1,
    Courier = 2,
    CustomerPickup = 3,
    CompanyVehicle = 4,
    ContractCarrier = 5,
    Express = 6,
    International = 7,
    Other = 99
}

public enum ShipmentStatus
{
    Draft = 0,
    Preparing = 1,
    Ready = 2,
    Shipped = 3,
    InTransit = 4,
    Delivered = 5,
    PartiallyDelivered = 6,
    Returned = 7,
    Cancelled = 8
}

public enum ShipmentPriority
{
    Low = 1,
    Normal = 2,
    High = 3,
    Urgent = 4
}
