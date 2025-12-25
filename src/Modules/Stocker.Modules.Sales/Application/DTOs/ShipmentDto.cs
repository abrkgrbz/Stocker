using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record ShipmentDto
{
    public Guid Id { get; init; }
    public string ShipmentNumber { get; init; } = string.Empty;
    public Guid SalesOrderId { get; init; }
    public string SalesOrderNumber { get; init; } = string.Empty;
    public DateTime ShipmentDate { get; init; }
    public DateTime? ExpectedDeliveryDate { get; init; }
    public DateTime? ActualDeliveryDate { get; init; }

    // Customer
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? RecipientName { get; init; }
    public string? RecipientPhone { get; init; }

    // Address
    public string ShippingAddress { get; init; } = string.Empty;
    public string? ShippingDistrict { get; init; }
    public string? ShippingCity { get; init; }
    public string ShippingCountry { get; init; } = "Türkiye";
    public string? ShippingPostalCode { get; init; }

    // Carrier
    public string ShipmentType { get; init; } = string.Empty;
    public Guid? CarrierId { get; init; }
    public string? CarrierName { get; init; }
    public string? TrackingNumber { get; init; }
    public string? TrackingUrl { get; init; }
    public string? VehiclePlate { get; init; }
    public string? DriverName { get; init; }
    public string? DriverPhone { get; init; }

    // Measurement
    public decimal TotalWeight { get; init; }
    public decimal? TotalVolume { get; init; }
    public int PackageCount { get; init; }
    public decimal ShippingCost { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? InsuranceAmount { get; init; }
    public decimal? CustomerShippingFee { get; init; }
    public bool IsFreeShipping { get; init; }

    // Warehouse
    public Guid? WarehouseId { get; init; }
    public string? WarehouseName { get; init; }
    public Guid? BranchId { get; init; }

    // Status
    public string Status { get; init; } = string.Empty;
    public bool IsDeliveryNoteCreated { get; init; }
    public Guid? DeliveryNoteId { get; init; }
    public bool IsInvoiced { get; init; }
    public Guid? InvoiceId { get; init; }
    public string? ProofOfDelivery { get; init; }
    public string? ReceivedBy { get; init; }
    public string? DeliveryNotes { get; init; }

    // General
    public string? Notes { get; init; }
    public string? SpecialInstructions { get; init; }
    public string Priority { get; init; } = "Normal";
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public Guid? CreatedBy { get; init; }

    public List<ShipmentItemDto> Items { get; init; } = new();

    public static ShipmentDto FromEntity(Shipment entity)
    {
        return new ShipmentDto
        {
            Id = entity.Id,
            ShipmentNumber = entity.ShipmentNumber,
            SalesOrderId = entity.SalesOrderId,
            SalesOrderNumber = entity.SalesOrderNumber,
            ShipmentDate = entity.ShipmentDate,
            ExpectedDeliveryDate = entity.ExpectedDeliveryDate,
            ActualDeliveryDate = entity.ActualDeliveryDate,
            CustomerId = entity.CustomerId,
            CustomerName = entity.CustomerName,
            RecipientName = entity.RecipientName,
            RecipientPhone = entity.RecipientPhone,
            ShippingAddress = entity.ShippingAddress,
            ShippingDistrict = entity.ShippingDistrict,
            ShippingCity = entity.ShippingCity,
            ShippingCountry = entity.ShippingCountry,
            ShippingPostalCode = entity.ShippingPostalCode,
            ShipmentType = entity.ShipmentType.ToString(),
            CarrierId = entity.CarrierId,
            CarrierName = entity.CarrierName,
            TrackingNumber = entity.TrackingNumber,
            TrackingUrl = entity.TrackingUrl,
            VehiclePlate = entity.VehiclePlate,
            DriverName = entity.DriverName,
            DriverPhone = entity.DriverPhone,
            TotalWeight = entity.TotalWeight,
            TotalVolume = entity.TotalVolume,
            PackageCount = entity.PackageCount,
            ShippingCost = entity.ShippingCost,
            Currency = entity.Currency,
            InsuranceAmount = entity.InsuranceAmount,
            CustomerShippingFee = entity.CustomerShippingFee,
            IsFreeShipping = entity.IsFreeShipping,
            WarehouseId = entity.WarehouseId,
            WarehouseName = entity.WarehouseName,
            BranchId = entity.BranchId,
            Status = entity.Status.ToString(),
            IsDeliveryNoteCreated = entity.IsDeliveryNoteCreated,
            DeliveryNoteId = entity.DeliveryNoteId,
            IsInvoiced = entity.IsInvoiced,
            InvoiceId = entity.InvoiceId,
            ProofOfDelivery = entity.ProofOfDelivery,
            ReceivedBy = entity.ReceivedBy,
            DeliveryNotes = entity.DeliveryNotes,
            Notes = entity.Notes,
            SpecialInstructions = entity.SpecialInstructions,
            Priority = entity.Priority.ToString(),
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedBy,
            Items = entity.Items.Select(ShipmentItemDto.FromEntity).ToList()
        };
    }
}

public record ShipmentListDto
{
    public Guid Id { get; init; }
    public string ShipmentNumber { get; init; } = string.Empty;
    public string SalesOrderNumber { get; init; } = string.Empty;
    public DateTime ShipmentDate { get; init; }
    public DateTime? ExpectedDeliveryDate { get; init; }
    public string? CustomerName { get; init; }
    public string? ShippingCity { get; init; }
    public string ShipmentType { get; init; } = string.Empty;
    public string? CarrierName { get; init; }
    public string? TrackingNumber { get; init; }
    public string Status { get; init; } = string.Empty;
    public int PackageCount { get; init; }
    public decimal TotalWeight { get; init; }
    public string Priority { get; init; } = "Normal";
    public bool IsDeliveryNoteCreated { get; init; }
    public bool IsInvoiced { get; init; }
    public DateTime CreatedAt { get; init; }

    public static ShipmentListDto FromEntity(Shipment entity)
    {
        return new ShipmentListDto
        {
            Id = entity.Id,
            ShipmentNumber = entity.ShipmentNumber,
            SalesOrderNumber = entity.SalesOrderNumber,
            ShipmentDate = entity.ShipmentDate,
            ExpectedDeliveryDate = entity.ExpectedDeliveryDate,
            CustomerName = entity.CustomerName,
            ShippingCity = entity.ShippingCity,
            ShipmentType = entity.ShipmentType.ToString(),
            CarrierName = entity.CarrierName,
            TrackingNumber = entity.TrackingNumber,
            Status = entity.Status.ToString(),
            PackageCount = entity.PackageCount,
            TotalWeight = entity.TotalWeight,
            Priority = entity.Priority.ToString(),
            IsDeliveryNoteCreated = entity.IsDeliveryNoteCreated,
            IsInvoiced = entity.IsInvoiced,
            CreatedAt = entity.CreatedAt
        };
    }
}

public record ShipmentItemDto
{
    public Guid Id { get; init; }
    public Guid SalesOrderItemId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal? UnitWeight { get; init; }
    public decimal TotalWeight { get; init; }
    public int PackageCount { get; init; }
    public string? LotNumber { get; init; }
    public string? SerialNumber { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public string? Notes { get; init; }

    public static ShipmentItemDto FromEntity(ShipmentItem entity)
    {
        return new ShipmentItemDto
        {
            Id = entity.Id,
            SalesOrderItemId = entity.SalesOrderItemId,
            ProductId = entity.ProductId,
            ProductCode = entity.ProductCode,
            ProductName = entity.ProductName,
            Quantity = entity.Quantity,
            Unit = entity.Unit,
            UnitWeight = entity.UnitWeight,
            TotalWeight = entity.TotalWeight,
            PackageCount = entity.PackageCount,
            LotNumber = entity.LotNumber,
            SerialNumber = entity.SerialNumber,
            ExpiryDate = entity.ExpiryDate,
            Notes = entity.Notes
        };
    }
}
