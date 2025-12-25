using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Shipments.Commands;

public record CreateShipmentCommand : IRequest<Result<ShipmentDto>>
{
    public Guid SalesOrderId { get; init; }
    public DateTime ShipmentDate { get; init; }
    public ShipmentType ShipmentType { get; init; } = ShipmentType.Cargo;
    public DateTime? ExpectedDeliveryDate { get; init; }
    public string? RecipientName { get; init; }
    public string? RecipientPhone { get; init; }
    public string ShippingAddress { get; init; } = string.Empty;
    public string? ShippingDistrict { get; init; }
    public string? ShippingCity { get; init; }
    public string ShippingCountry { get; init; } = "Türkiye";
    public string? ShippingPostalCode { get; init; }
    public Guid? CarrierId { get; init; }
    public string? CarrierName { get; init; }
    public string? Notes { get; init; }
    public string? SpecialInstructions { get; init; }
    public ShipmentPriority Priority { get; init; } = ShipmentPriority.Normal;
    public List<CreateShipmentItemCommand> Items { get; init; } = new();
}

public record CreateShipmentItemCommand
{
    public Guid SalesOrderItemId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal? UnitWeight { get; init; }
    public string? LotNumber { get; init; }
    public string? SerialNumber { get; init; }
}

public record CreateShipmentFromOrderCommand : IRequest<Result<ShipmentDto>>
{
    public Guid SalesOrderId { get; init; }
    public DateTime ShipmentDate { get; init; }
    public ShipmentType ShipmentType { get; init; } = ShipmentType.Cargo;
    public bool IncludeAllItems { get; init; } = true;
}

public record UpdateShipmentCommand : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
    public DateTime? ExpectedDeliveryDate { get; init; }
    public string? RecipientName { get; init; }
    public string? RecipientPhone { get; init; }
    public string ShippingAddress { get; init; } = string.Empty;
    public string? ShippingDistrict { get; init; }
    public string? ShippingCity { get; init; }
    public string? Notes { get; init; }
    public string? SpecialInstructions { get; init; }
    public ShipmentPriority Priority { get; init; }
}

public record AddShipmentItemCommand : IRequest<Result<ShipmentDto>>
{
    public Guid ShipmentId { get; init; }
    public Guid SalesOrderItemId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal? UnitWeight { get; init; }
}

public record SetCarrierCommand : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
    public Guid? CarrierId { get; init; }
    public string? CarrierName { get; init; }
    public string? TrackingNumber { get; init; }
    public string? TrackingUrl { get; init; }
}

public record SetVehicleInfoCommand : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
    public string? VehiclePlate { get; init; }
    public string? DriverName { get; init; }
    public string? DriverPhone { get; init; }
}

public record SetShippingCostCommand : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
    public decimal ShippingCost { get; init; }
    public decimal? InsuranceAmount { get; init; }
    public decimal? CustomerShippingFee { get; init; }
    public bool IsFreeShipping { get; init; }
}

public record StartPreparingShipmentCommand : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
}

public record MarkShipmentReadyCommand : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
}

public record ShipCommand : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
    public string? TrackingNumber { get; init; }
}

public record MarkInTransitCommand : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
}

public record DeliverShipmentCommand : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
    public string? ReceivedBy { get; init; }
    public string? Notes { get; init; }
    public string? ProofOfDelivery { get; init; }
}

public record ReturnShipmentCommand : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record CancelShipmentCommand : IRequest<Result<ShipmentDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record LinkDeliveryNoteCommand : IRequest<Result<ShipmentDto>>
{
    public Guid ShipmentId { get; init; }
    public Guid DeliveryNoteId { get; init; }
}

public record LinkInvoiceToShipmentCommand : IRequest<Result<ShipmentDto>>
{
    public Guid ShipmentId { get; init; }
    public Guid InvoiceId { get; init; }
}

public record DeleteShipmentCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}
