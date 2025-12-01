using MediatR;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.SerialNumbers.Queries;

/// <summary>
/// DTO for serial number details
/// </summary>
public class SerialNumberDto
{
    public int Id { get; set; }
    public string Serial { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public int? LocationId { get; set; }
    public string? LocationName { get; set; }
    public SerialNumberStatus Status { get; set; }
    public DateTime? ManufacturedDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public DateTime? SoldDate { get; set; }
    public DateTime? WarrantyStartDate { get; set; }
    public DateTime? WarrantyEndDate { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? SalesOrderId { get; set; }
    public Guid? PurchaseOrderId { get; set; }
    public string? Notes { get; set; }
    public string? BatchNumber { get; set; }
    public string? SupplierSerial { get; set; }
    public bool IsUnderWarranty { get; set; }
    public int? RemainingWarrantyDays { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Query to get a serial number by ID
/// </summary>
public class GetSerialNumberByIdQuery : IRequest<Result<SerialNumberDto>>
{
    public int TenantId { get; set; }
    public int SerialNumberId { get; set; }
}

/// <summary>
/// Handler for GetSerialNumberByIdQuery
/// </summary>
public class GetSerialNumberByIdQueryHandler : IRequestHandler<GetSerialNumberByIdQuery, Result<SerialNumberDto>>
{
    private readonly ISerialNumberRepository _serialNumberRepository;

    public GetSerialNumberByIdQueryHandler(ISerialNumberRepository serialNumberRepository)
    {
        _serialNumberRepository = serialNumberRepository;
    }

    public async Task<Result<SerialNumberDto>> Handle(GetSerialNumberByIdQuery request, CancellationToken cancellationToken)
    {
        var serialNumber = await _serialNumberRepository.GetByIdAsync(request.SerialNumberId, cancellationToken);

        if (serialNumber == null)
        {
            return Result<SerialNumberDto>.Failure(new Error("SerialNumber.NotFound", $"Serial number with ID {request.SerialNumberId} not found", ErrorType.NotFound));
        }

        var dto = new SerialNumberDto
        {
            Id = serialNumber.Id,
            Serial = serialNumber.Serial,
            ProductId = serialNumber.ProductId,
            ProductCode = serialNumber.Product?.Code ?? string.Empty,
            ProductName = serialNumber.Product?.Name ?? string.Empty,
            WarehouseId = serialNumber.WarehouseId,
            WarehouseName = serialNumber.Warehouse?.Name,
            LocationId = serialNumber.LocationId,
            LocationName = serialNumber.Location?.Name,
            Status = serialNumber.Status,
            ManufacturedDate = serialNumber.ManufacturedDate,
            ReceivedDate = serialNumber.ReceivedDate,
            SoldDate = serialNumber.SoldDate,
            WarrantyStartDate = serialNumber.WarrantyStartDate,
            WarrantyEndDate = serialNumber.WarrantyEndDate,
            CustomerId = serialNumber.CustomerId,
            SalesOrderId = serialNumber.SalesOrderId,
            PurchaseOrderId = serialNumber.PurchaseOrderId,
            Notes = serialNumber.Notes,
            BatchNumber = serialNumber.BatchNumber,
            SupplierSerial = serialNumber.SupplierSerial,
            IsUnderWarranty = serialNumber.IsUnderWarranty(),
            RemainingWarrantyDays = serialNumber.GetRemainingWarrantyDays(),
            CreatedAt = serialNumber.CreatedDate
        };

        return Result<SerialNumberDto>.Success(dto);
    }
}
