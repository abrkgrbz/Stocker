using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Sevk İrsaliyesi entity'si - Türkiye'de yasal zorunluluk olan mal taşıma belgesi
/// Delivery Note (İrsaliye) entity - Legally required transport document in Turkey
/// GİB e-İrsaliye standardına uygun / Compliant with GIB e-Delivery Note standard
/// VUK 230. Madde gereği düzenlenmesi zorunludur
/// </summary>
public class DeliveryNote : TenantAggregateRoot
{
    private readonly List<DeliveryNoteItem> _items = new();

    #region Belge Bilgileri (Document Information)

    public string DeliveryNoteNumber { get; private set; } = string.Empty;
    public string Series { get; private set; } = string.Empty;
    public int SequenceNumber { get; private set; }
    public DateTime DeliveryNoteDate { get; private set; }
    public TimeSpan IssueTime { get; private set; }
    public DeliveryNoteType DeliveryNoteType { get; private set; }
    public bool IsEDeliveryNote { get; private set; }
    public Guid? EDeliveryNoteUuid { get; private set; }
    public EDeliveryNoteStatus? EDeliveryNoteStatus { get; private set; }

    #endregion

    #region İlişkili Belgeler (Related Documents)

    public Guid? ShipmentId { get; private set; }
    public Guid? SalesOrderId { get; private set; }
    public string? SalesOrderNumber { get; private set; }
    public Guid? InvoiceId { get; private set; }
    public string? InvoiceNumber { get; private set; }

    #endregion

    #region Gönderen Bilgileri (Sender Information)

    public string SenderTaxId { get; private set; } = string.Empty;
    public string SenderName { get; private set; } = string.Empty;
    public string? SenderTaxOffice { get; private set; }
    public string SenderAddress { get; private set; } = string.Empty;
    public string? SenderCity { get; private set; }
    public string? SenderDistrict { get; private set; }
    public string SenderCountry { get; private set; } = "Türkiye";

    #endregion

    #region Alıcı Bilgileri (Receiver Information)

    public Guid? ReceiverId { get; private set; }
    public string ReceiverTaxId { get; private set; } = string.Empty;
    public string ReceiverName { get; private set; } = string.Empty;
    public string? ReceiverTaxOffice { get; private set; }
    public string ReceiverAddress { get; private set; } = string.Empty;
    public string? ReceiverCity { get; private set; }
    public string? ReceiverDistrict { get; private set; }
    public string ReceiverCountry { get; private set; } = "Türkiye";
    public string? ReceiverPostalCode { get; private set; }

    #endregion

    #region Teslim Bilgileri (Delivery Information)

    public DateTime DispatchDate { get; private set; }
    public TimeSpan? DispatchTime { get; private set; }
    public string? DeliveryAddress { get; private set; }
    public string? DeliveryCity { get; private set; }
    public string? DeliveryDistrict { get; private set; }

    #endregion

    #region Taşıma Bilgileri (Transport Information)

    public TransportMode TransportMode { get; private set; }
    public string? CarrierTaxId { get; private set; }
    public string? CarrierName { get; private set; }
    public string? VehiclePlate { get; private set; }
    public string? TrailerPlate { get; private set; }
    public string? DriverName { get; private set; }
    public string? DriverNationalId { get; private set; }

    #endregion

    #region Miktar Bilgileri (Quantity Information)

    public int TotalLineCount { get; private set; }
    public decimal TotalQuantity { get; private set; }
    public decimal? TotalGrossWeight { get; private set; }
    public decimal? TotalNetWeight { get; private set; }
    public decimal? TotalVolume { get; private set; }
    public int? PackageCount { get; private set; }
    public string? PackageType { get; private set; }

    #endregion

    #region Durum ve İzleme (Status and Tracking)

    public DeliveryNoteStatus Status { get; private set; }
    public bool IsPrinted { get; private set; }
    public DateTime? PrintDate { get; private set; }
    public bool IsSigned { get; private set; }
    public DateTime? SignDate { get; private set; }
    public bool IsDelivered { get; private set; }
    public DateTime? DeliveryDate { get; private set; }
    public string? ReceivedBy { get; private set; }
    public string? ReceiverSignature { get; private set; }

    #endregion

    #region Genel Bilgiler (General Information)

    public string? Description { get; private set; }
    public string? Notes { get; private set; }
    public Guid? BranchId { get; private set; }
    public Guid? WarehouseId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public Guid? CreatedBy { get; private set; }

    #endregion

    public IReadOnlyList<DeliveryNoteItem> Items => _items.AsReadOnly();

    private DeliveryNote() { }

    public static Result<DeliveryNote> CreateSalesDeliveryNote(
        Guid tenantId,
        string series,
        int sequenceNumber,
        DateTime deliveryNoteDate,
        string senderTaxId,
        string senderName,
        string senderAddress,
        string receiverTaxId,
        string receiverName,
        string receiverAddress)
    {
        return Create(
            tenantId,
            DeliveryNoteType.SalesDeliveryNote,
            series,
            sequenceNumber,
            deliveryNoteDate,
            senderTaxId,
            senderName,
            senderAddress,
            receiverTaxId,
            receiverName,
            receiverAddress);
    }

    public static Result<DeliveryNote> Create(
        Guid tenantId,
        DeliveryNoteType type,
        string series,
        int sequenceNumber,
        DateTime deliveryNoteDate,
        string senderTaxId,
        string senderName,
        string senderAddress,
        string receiverTaxId,
        string receiverName,
        string receiverAddress)
    {
        if (string.IsNullOrWhiteSpace(series))
            return Result<DeliveryNote>.Failure(Error.Validation("DeliveryNote.Series", "İrsaliye serisi gereklidir."));

        if (sequenceNumber <= 0)
            return Result<DeliveryNote>.Failure(Error.Validation("DeliveryNote.SequenceNumber", "Sıra numarası pozitif olmalıdır."));

        if (string.IsNullOrWhiteSpace(senderTaxId))
            return Result<DeliveryNote>.Failure(Error.Validation("DeliveryNote.SenderTaxId", "Gönderen VKN/TCKN gereklidir."));

        if (string.IsNullOrWhiteSpace(receiverTaxId))
            return Result<DeliveryNote>.Failure(Error.Validation("DeliveryNote.ReceiverTaxId", "Alıcı VKN/TCKN gereklidir."));

        var deliveryNote = new DeliveryNote();
        deliveryNote.Id = Guid.NewGuid();
        deliveryNote.SetTenantId(tenantId);
        deliveryNote.DeliveryNoteType = type;
        deliveryNote.Series = series.ToUpperInvariant();
        deliveryNote.SequenceNumber = sequenceNumber;
        deliveryNote.DeliveryNoteNumber = $"{series.ToUpperInvariant()}{deliveryNoteDate.Year}{sequenceNumber:D6}";
        deliveryNote.DeliveryNoteDate = deliveryNoteDate;
        deliveryNote.IssueTime = DateTime.Now.TimeOfDay;
        deliveryNote.DispatchDate = deliveryNoteDate;
        deliveryNote.SenderTaxId = senderTaxId;
        deliveryNote.SenderName = senderName;
        deliveryNote.SenderAddress = senderAddress;
        deliveryNote.ReceiverTaxId = receiverTaxId;
        deliveryNote.ReceiverName = receiverName;
        deliveryNote.ReceiverAddress = receiverAddress;
        deliveryNote.TransportMode = TransportMode.Road;
        deliveryNote.Status = DeliveryNoteStatus.Draft;
        deliveryNote.CreatedAt = DateTime.UtcNow;

        return Result<DeliveryNote>.Success(deliveryNote);
    }

    public static Result<DeliveryNote> CreateFromShipment(
        Guid tenantId,
        string series,
        int sequenceNumber,
        DateTime deliveryNoteDate,
        Shipment shipment,
        string senderTaxId,
        string senderName,
        string senderAddress)
    {
        var result = CreateSalesDeliveryNote(
            tenantId,
            series,
            sequenceNumber,
            deliveryNoteDate,
            senderTaxId,
            senderName,
            senderAddress,
            "",
            shipment.CustomerName ?? "",
            shipment.ShippingAddress);

        if (!result.IsSuccess)
            return result;

        var deliveryNote = result.Value!;
        deliveryNote.ShipmentId = shipment.Id;
        deliveryNote.SalesOrderId = shipment.SalesOrderId;
        deliveryNote.SalesOrderNumber = shipment.SalesOrderNumber;
        deliveryNote.ReceiverId = shipment.CustomerId;
        deliveryNote.ReceiverCity = shipment.ShippingCity;
        deliveryNote.ReceiverDistrict = shipment.ShippingDistrict;
        deliveryNote.ReceiverCountry = shipment.ShippingCountry;
        deliveryNote.ReceiverPostalCode = shipment.ShippingPostalCode;
        deliveryNote.CarrierName = shipment.CarrierName;
        deliveryNote.VehiclePlate = shipment.VehiclePlate;
        deliveryNote.DriverName = shipment.DriverName;
        deliveryNote.WarehouseId = shipment.WarehouseId;
        deliveryNote.BranchId = shipment.BranchId;

        return Result<DeliveryNote>.Success(deliveryNote);
    }

    public Result<DeliveryNoteItem> AddItem(
        int lineNumber,
        Guid productId,
        string productCode,
        string productName,
        decimal quantity,
        string unit,
        string? lotNumber = null)
    {
        if (Status != DeliveryNoteStatus.Draft)
            return Result<DeliveryNoteItem>.Failure(Error.Validation("DeliveryNote.Status", "Sadece taslak irsaliyelere kalem eklenebilir."));

        var itemResult = DeliveryNoteItem.Create(
            Id,
            lineNumber,
            productId,
            productCode,
            productName,
            quantity,
            unit,
            lotNumber);

        if (!itemResult.IsSuccess)
            return itemResult;

        _items.Add(itemResult.Value!);
        CalculateTotals();
        UpdatedAt = DateTime.UtcNow;

        return itemResult;
    }

    private void CalculateTotals()
    {
        TotalLineCount = _items.Count;
        TotalQuantity = _items.Sum(i => i.Quantity);
        TotalGrossWeight = _items.Sum(i => i.GrossWeight ?? 0);
        TotalNetWeight = _items.Sum(i => i.NetWeight ?? 0);
        TotalVolume = _items.Sum(i => i.Volume ?? 0);
    }

    public Result Approve()
    {
        if (Status != DeliveryNoteStatus.Draft)
            return Result.Failure(Error.Validation("DeliveryNote.Status", "Sadece taslak irsaliyeler onaylanabilir."));

        if (!_items.Any())
            return Result.Failure(Error.Validation("DeliveryNote.Items", "En az bir kalem gereklidir."));

        Status = DeliveryNoteStatus.Approved;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Print()
    {
        if (Status != DeliveryNoteStatus.Approved && Status != DeliveryNoteStatus.Printed)
            return Result.Failure(Error.Validation("DeliveryNote.Status", "Sadece onaylı irsaliyeler yazdırılabilir."));

        IsPrinted = true;
        PrintDate = DateTime.UtcNow;
        Status = DeliveryNoteStatus.Printed;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Dispatch(DateTime? dispatchDate = null, TimeSpan? dispatchTime = null)
    {
        if (Status != DeliveryNoteStatus.Printed && Status != DeliveryNoteStatus.Approved)
            return Result.Failure(Error.Validation("DeliveryNote.Status", "Sadece yazdırılmış veya onaylı irsaliyeler sevk edilebilir."));

        DispatchDate = dispatchDate ?? DateTime.UtcNow;
        DispatchTime = dispatchTime ?? DateTime.Now.TimeOfDay;
        Status = DeliveryNoteStatus.Dispatched;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Deliver(string? receivedBy = null, string? signature = null)
    {
        if (Status != DeliveryNoteStatus.Dispatched)
            return Result.Failure(Error.Validation("DeliveryNote.Status", "Sadece sevk edilmiş irsaliyeler teslim edilebilir."));

        IsDelivered = true;
        DeliveryDate = DateTime.UtcNow;
        ReceivedBy = receivedBy;
        ReceiverSignature = signature;
        Status = DeliveryNoteStatus.Delivered;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public void MarkAsEDeliveryNote(Guid uuid)
    {
        IsEDeliveryNote = true;
        EDeliveryNoteUuid = uuid;
        EDeliveryNoteStatus = Sales.Domain.Entities.EDeliveryNoteStatus.Created;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateEDeliveryNoteStatus(EDeliveryNoteStatus status)
    {
        EDeliveryNoteStatus = status;
        UpdatedAt = DateTime.UtcNow;
    }

    public void LinkInvoice(Guid invoiceId, string invoiceNumber)
    {
        InvoiceId = invoiceId;
        InvoiceNumber = invoiceNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public Result Cancel(string reason)
    {
        if (Status == DeliveryNoteStatus.Delivered)
            return Result.Failure(Error.Validation("DeliveryNote.Status", "Teslim edilmiş irsaliye iptal edilemez."));

        if (IsEDeliveryNote && EDeliveryNoteStatus == Sales.Domain.Entities.EDeliveryNoteStatus.Approved)
            return Result.Failure(Error.Validation("DeliveryNote.EStatus", "Onaylı e-İrsaliye iptal edilemez, red irsaliyesi düzenlenmeli."));

        Notes = $"İptal nedeni: {reason}. {Notes}";
        Status = DeliveryNoteStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public void SetSenderDetails(string? taxOffice, string? city, string? district, string? country)
    {
        SenderTaxOffice = taxOffice;
        SenderCity = city;
        SenderDistrict = district;
        SenderCountry = country ?? "Türkiye";
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetReceiverDetails(string? taxOffice, string? city, string? district, string? country, string? postalCode)
    {
        ReceiverTaxOffice = taxOffice;
        ReceiverCity = city;
        ReceiverDistrict = district;
        ReceiverCountry = country ?? "Türkiye";
        ReceiverPostalCode = postalCode;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDeliveryAddress(string? address, string? city, string? district)
    {
        DeliveryAddress = address;
        DeliveryCity = city;
        DeliveryDistrict = district;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetTransportInfo(TransportMode mode, string? carrierTaxId, string? carrierName)
    {
        TransportMode = mode;
        CarrierTaxId = carrierTaxId;
        CarrierName = carrierName;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetVehicleInfo(string? plate, string? trailerPlate, string? driverName, string? driverNationalId)
    {
        VehiclePlate = plate;
        TrailerPlate = trailerPlate;
        DriverName = driverName;
        DriverNationalId = driverNationalId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPackageInfo(int? count, string? type)
    {
        PackageCount = count;
        PackageType = type;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDescription(string? description)
    {
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetWarehouse(Guid? warehouseId)
    {
        WarehouseId = warehouseId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetBranch(Guid? branchId)
    {
        BranchId = branchId;
        UpdatedAt = DateTime.UtcNow;
    }
}

public class DeliveryNoteItem : Entity<Guid>
{
    public Guid DeliveryNoteId { get; private set; }
    public int LineNumber { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string? ProductDescription { get; private set; }
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = string.Empty;
    public string? UnitCode { get; private set; }
    public decimal? GrossWeight { get; private set; }
    public decimal? NetWeight { get; private set; }
    public decimal? Volume { get; private set; }
    public string? LotNumber { get; private set; }
    public string? SerialNumber { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public string? HsCode { get; private set; }
    public string? CountryOfOrigin { get; private set; }
    public string? Notes { get; private set; }

    private DeliveryNoteItem() { }

    internal static Result<DeliveryNoteItem> Create(
        Guid deliveryNoteId,
        int lineNumber,
        Guid productId,
        string productCode,
        string productName,
        decimal quantity,
        string unit,
        string? lotNumber = null)
    {
        if (quantity <= 0)
            return Result<DeliveryNoteItem>.Failure(Error.Validation("DeliveryNoteItem.Quantity", "Miktar pozitif olmalıdır."));

        if (string.IsNullOrWhiteSpace(productCode))
            return Result<DeliveryNoteItem>.Failure(Error.Validation("DeliveryNoteItem.ProductCode", "Ürün kodu gereklidir."));

        var item = new DeliveryNoteItem
        {
            Id = Guid.NewGuid(),
            DeliveryNoteId = deliveryNoteId,
            LineNumber = lineNumber,
            ProductId = productId,
            ProductCode = productCode,
            ProductName = productName,
            Quantity = quantity,
            Unit = unit,
            LotNumber = lotNumber
        };

        return Result<DeliveryNoteItem>.Success(item);
    }

    public void SetProductDescription(string? description) => ProductDescription = description;
    public void SetUnitCode(string? code) => UnitCode = code;
    public void SetWeights(decimal? grossWeight, decimal? netWeight)
    {
        GrossWeight = grossWeight;
        NetWeight = netWeight;
    }
    public void SetVolume(decimal? volume) => Volume = volume;
    public void SetLotNumber(string? lotNumber) => LotNumber = lotNumber;
    public void SetSerialNumber(string? serialNumber) => SerialNumber = serialNumber;
    public void SetExpiryDate(DateTime? date) => ExpiryDate = date;
    public void SetHsCode(string? code) => HsCode = code;
    public void SetCountryOfOrigin(string? country) => CountryOfOrigin = country;
    public void SetNotes(string? notes) => Notes = notes;
    public void UpdateQuantity(decimal quantity) => Quantity = quantity;
}

public enum DeliveryNoteType
{
    SalesDeliveryNote = 1,
    CustomerGoodsDeliveryNote = 2,
    ConsignmentOutDeliveryNote = 3,
    TransferDeliveryNote = 4,
    ReturnDeliveryNote = 5,
    ProductionInDeliveryNote = 6,
    ScrapDeliveryNote = 7,
    Other = 99
}

public enum DeliveryNoteStatus
{
    Draft = 0,
    Approved = 1,
    Printed = 2,
    Dispatched = 3,
    Delivered = 4,
    Cancelled = 5
}

public enum EDeliveryNoteStatus
{
    Created = 0,
    Signed = 1,
    Sent = 2,
    Approved = 3,
    Rejected = 4,
    Error = 5
}

public enum TransportMode
{
    Road = 1,
    Sea = 2,
    Air = 3,
    Rail = 4,
    Multimodal = 5,
    Pipeline = 6,
    Other = 99
}
