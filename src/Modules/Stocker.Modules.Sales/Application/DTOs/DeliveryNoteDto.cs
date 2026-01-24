namespace Stocker.Modules.Sales.Application.DTOs;

public class DeliveryNoteDto
{
    public Guid Id { get; init; }
    public string DeliveryNoteNumber { get; init; } = string.Empty;
    public string Series { get; init; } = string.Empty;
    public int SequenceNumber { get; init; }
    public DateTime DeliveryNoteDate { get; init; }
    public string DeliveryNoteType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public bool IsEDeliveryNote { get; init; }
    public Guid? EDeliveryNoteUuid { get; init; }
    public string? EDeliveryNoteStatus { get; init; }

    // İlişkili Belgeler
    public Guid? ShipmentId { get; init; }
    public Guid? SalesOrderId { get; init; }
    public string? SalesOrderNumber { get; init; }
    public Guid? InvoiceId { get; init; }
    public string? InvoiceNumber { get; init; }

    // Gönderen
    public string SenderTaxId { get; init; } = string.Empty;
    public string SenderName { get; init; } = string.Empty;
    public string? SenderTaxOffice { get; init; }
    public string SenderAddress { get; init; } = string.Empty;
    public string? SenderCity { get; init; }
    public string? SenderDistrict { get; init; }

    // Alıcı
    public Guid? ReceiverId { get; init; }
    public string ReceiverTaxId { get; init; } = string.Empty;
    public string ReceiverName { get; init; } = string.Empty;
    public string? ReceiverTaxOffice { get; init; }
    public string ReceiverAddress { get; init; } = string.Empty;
    public string? ReceiverCity { get; init; }
    public string? ReceiverDistrict { get; init; }

    // Taşıma
    public string? TransportMode { get; init; }
    public string? CarrierName { get; init; }
    public string? VehiclePlate { get; init; }
    public string? DriverName { get; init; }

    // Miktar
    public int TotalLineCount { get; init; }
    public decimal TotalQuantity { get; init; }
    public decimal? TotalGrossWeight { get; init; }
    public decimal? TotalNetWeight { get; init; }

    // Durum
    public DateTime DispatchDate { get; init; }
    public bool IsDelivered { get; init; }
    public DateTime? DeliveryDate { get; init; }
    public string? ReceivedBy { get; init; }

    public string? Description { get; init; }
    public string? Notes { get; init; }
    public Guid? WarehouseId { get; init; }

    public List<DeliveryNoteItemDto> Items { get; init; } = new();
}

public class DeliveryNoteListDto
{
    public Guid Id { get; init; }
    public string DeliveryNoteNumber { get; init; } = string.Empty;
    public DateTime DeliveryNoteDate { get; init; }
    public string DeliveryNoteType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string ReceiverName { get; init; } = string.Empty;
    public string? SalesOrderNumber { get; init; }
    public int TotalLineCount { get; init; }
    public decimal TotalQuantity { get; init; }
    public bool IsEDeliveryNote { get; init; }
    public bool IsDelivered { get; init; }
    public DateTime? DeliveryDate { get; init; }
}

public class DeliveryNoteItemDto
{
    public Guid Id { get; init; }
    public int LineNumber { get; init; }
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal? GrossWeight { get; init; }
    public decimal? NetWeight { get; init; }
    public string? LotNumber { get; init; }
    public string? SerialNumber { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public string? Notes { get; init; }
}

public class CreateDeliveryNoteDto
{
    public string Series { get; init; } = string.Empty;
    public DateTime DeliveryNoteDate { get; init; }
    public string DeliveryNoteType { get; init; } = "SalesDeliveryNote";
    public string SenderTaxId { get; init; } = string.Empty;
    public string SenderName { get; init; } = string.Empty;
    public string SenderAddress { get; init; } = string.Empty;
    public string? SenderTaxOffice { get; init; }
    public string? SenderCity { get; init; }
    public string? SenderDistrict { get; init; }
    public string ReceiverTaxId { get; init; } = string.Empty;
    public string ReceiverName { get; init; } = string.Empty;
    public string ReceiverAddress { get; init; } = string.Empty;
    public string? ReceiverTaxOffice { get; init; }
    public string? ReceiverCity { get; init; }
    public string? ReceiverDistrict { get; init; }
    public Guid? ReceiverId { get; init; }
    public Guid? SalesOrderId { get; init; }
    public string? SalesOrderNumber { get; init; }
    public Guid? WarehouseId { get; init; }
    public string? Description { get; init; }
    public List<CreateDeliveryNoteItemDto> Items { get; init; } = new();
}

public class CreateDeliveryNoteItemDto
{
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public string? LotNumber { get; init; }
    public string? SerialNumber { get; init; }
    public decimal? GrossWeight { get; init; }
    public decimal? NetWeight { get; init; }
}

public class DispatchDeliveryNoteDto
{
    public DateTime? DispatchDate { get; init; }
    public string? CarrierName { get; init; }
    public string? CarrierTaxId { get; init; }
    public string? VehiclePlate { get; init; }
    public string? TrailerPlate { get; init; }
    public string? DriverName { get; init; }
    public string? DriverNationalId { get; init; }
    public string? TransportMode { get; init; }
}

public class DeliverDeliveryNoteDto
{
    public string? ReceivedBy { get; init; }
    public string? Signature { get; init; }
}

public class CancelDeliveryNoteDto
{
    public string Reason { get; init; } = string.Empty;
}
