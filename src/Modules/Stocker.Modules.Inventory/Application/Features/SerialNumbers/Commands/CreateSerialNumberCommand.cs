using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.Features.SerialNumbers.Queries;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.SerialNumbers.Commands;

public class CreateSerialNumberDto
{
    public string Serial { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public int? LocationId { get; set; }
    public DateTime? ManufacturedDate { get; set; }
    public string? BatchNumber { get; set; }
    public string? SupplierSerial { get; set; }
    public string? Notes { get; set; }
}

public class CreateSerialNumberCommand : IRequest<Result<SerialNumberDto>>
{
    public int TenantId { get; set; }
    public CreateSerialNumberDto Data { get; set; } = null!;
}

public class CreateSerialNumberCommandValidator : AbstractValidator<CreateSerialNumberCommand>
{
    public CreateSerialNumberCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.Serial).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Data.ProductId).GreaterThan(0);
    }
}

public class CreateSerialNumberCommandHandler : IRequestHandler<CreateSerialNumberCommand, Result<SerialNumberDto>>
{
    private readonly ISerialNumberRepository _serialNumberRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateSerialNumberCommandHandler(ISerialNumberRepository serialNumberRepository, IProductRepository productRepository, IUnitOfWork unitOfWork)
    {
        _serialNumberRepository = serialNumberRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SerialNumberDto>> Handle(CreateSerialNumberCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        if (await _serialNumberRepository.ExistsAsync(data.Serial, cancellationToken))
        {
            return Result<SerialNumberDto>.Failure(new Error("SerialNumber.Duplicate", $"Serial number '{data.Serial}' already exists", ErrorType.Conflict));
        }

        var product = await _productRepository.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<SerialNumberDto>.Failure(new Error("Product.NotFound", $"Product with ID {data.ProductId} not found", ErrorType.NotFound));
        }

        var serialNumber = new SerialNumber(data.Serial, data.ProductId);
        serialNumber.SetWarehouse(data.WarehouseId, data.LocationId);
        serialNumber.SetManufacturedDate(data.ManufacturedDate);
        serialNumber.SetBatchInfo(data.BatchNumber, data.SupplierSerial);
        serialNumber.SetNotes(data.Notes);

        await _serialNumberRepository.AddAsync(serialNumber, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SerialNumberDto>.Success(new SerialNumberDto
        {
            Id = serialNumber.Id,
            Serial = serialNumber.Serial,
            ProductId = serialNumber.ProductId,
            ProductCode = product.Code,
            ProductName = product.Name,
            WarehouseId = serialNumber.WarehouseId,
            LocationId = serialNumber.LocationId,
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
