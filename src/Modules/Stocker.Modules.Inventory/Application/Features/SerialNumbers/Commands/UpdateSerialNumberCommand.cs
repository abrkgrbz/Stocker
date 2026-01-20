using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.Features.SerialNumbers.Queries;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.SerialNumbers.Commands;

public class UpdateSerialNumberDto
{
    public int? WarehouseId { get; set; }
    public int? LocationId { get; set; }
    public DateTime? ManufacturedDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? SupplierSerial { get; set; }
    public string? Notes { get; set; }
}

public class UpdateSerialNumberCommand : IRequest<Result<SerialNumberDto>>
{
    public Guid TenantId { get; set; }
    public int SerialNumberId { get; set; }
    public UpdateSerialNumberDto Data { get; set; } = null!;
}

public class UpdateSerialNumberCommandValidator : AbstractValidator<UpdateSerialNumberCommand>
{
    public UpdateSerialNumberCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.SerialNumberId).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
    }
}

public class UpdateSerialNumberCommandHandler : IRequestHandler<UpdateSerialNumberCommand, Result<SerialNumberDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateSerialNumberCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SerialNumberDto>> Handle(UpdateSerialNumberCommand request, CancellationToken cancellationToken)
    {
        var serialNumber = await _unitOfWork.SerialNumbers.GetByIdAsync(request.SerialNumberId, cancellationToken);

        if (serialNumber == null || serialNumber.TenantId != request.TenantId)
        {
            return Result<SerialNumberDto>.Failure(new Error("SerialNumber.NotFound", $"Serial number with ID {request.SerialNumberId} not found", ErrorType.NotFound));
        }

        var data = request.Data;

        serialNumber.SetWarehouse(data.WarehouseId, data.LocationId);
        serialNumber.SetManufacturedDate(data.ManufacturedDate);
        serialNumber.SetBatchInfo(data.BatchNumber, data.SupplierSerial);
        serialNumber.SetNotes(data.Notes);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var product = await _unitOfWork.Products.GetByIdAsync(serialNumber.ProductId, cancellationToken);
        var warehouse = serialNumber.WarehouseId.HasValue
            ? await _unitOfWork.Warehouses.GetByIdAsync(serialNumber.WarehouseId.Value, cancellationToken)
            : null;
        var location = serialNumber.LocationId.HasValue
            ? await _unitOfWork.Locations.GetByIdAsync(serialNumber.LocationId.Value, cancellationToken)
            : null;

        return Result<SerialNumberDto>.Success(new SerialNumberDto
        {
            Id = serialNumber.Id,
            Serial = serialNumber.Serial,
            ProductId = serialNumber.ProductId,
            ProductCode = product?.Code ?? string.Empty,
            ProductName = product?.Name ?? string.Empty,
            WarehouseId = serialNumber.WarehouseId,
            WarehouseName = warehouse?.Name,
            LocationId = serialNumber.LocationId,
            LocationName = location?.Name,
            Status = serialNumber.Status,
            ManufacturedDate = serialNumber.ManufacturedDate,
            ReceivedDate = serialNumber.ReceivedDate,
            SoldDate = serialNumber.SoldDate,
            WarrantyStartDate = serialNumber.WarrantyStartDate,
            WarrantyEndDate = serialNumber.WarrantyEndDate,
            BatchNumber = serialNumber.BatchNumber,
            SupplierSerial = serialNumber.SupplierSerial,
            Notes = serialNumber.Notes,
            IsUnderWarranty = serialNumber.IsUnderWarranty(),
            RemainingWarrantyDays = serialNumber.GetRemainingWarrantyDays(),
            CreatedAt = serialNumber.CreatedDate
        });
    }
}
