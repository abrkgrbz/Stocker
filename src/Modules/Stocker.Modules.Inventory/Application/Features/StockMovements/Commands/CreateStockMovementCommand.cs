using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockMovements.Commands;

public class CreateStockMovementCommand : IRequest<Result<StockMovementDto>>
{
    public int TenantId { get; set; }
    public CreateStockMovementDto Data { get; set; } = null!;
}

public class CreateStockMovementCommandValidator : AbstractValidator<CreateStockMovementCommand>
{
    public CreateStockMovementCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.DocumentNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Data.ProductId).GreaterThan(0);
        RuleFor(x => x.Data.WarehouseId).GreaterThan(0);
        RuleFor(x => x.Data.Quantity).GreaterThan(0);
        RuleFor(x => x.Data.UnitCost).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Data.UserId).GreaterThan(0);
    }
}

public class CreateStockMovementCommandHandler : IRequestHandler<CreateStockMovementCommand, Result<StockMovementDto>>
{
    private readonly IStockMovementRepository _stockMovementRepository;
    private readonly IProductRepository _productRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateStockMovementCommandHandler(
        IStockMovementRepository stockMovementRepository,
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository,
        IUnitOfWork unitOfWork)
    {
        _stockMovementRepository = stockMovementRepository;
        _productRepository = productRepository;
        _warehouseRepository = warehouseRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<StockMovementDto>> Handle(CreateStockMovementCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        var product = await _productRepository.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<StockMovementDto>.Failure(new Error("Product.NotFound", $"Product with ID {data.ProductId} not found", ErrorType.NotFound));
        }

        var warehouse = await _warehouseRepository.GetByIdAsync(data.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result<StockMovementDto>.Failure(new Error("Warehouse.NotFound", $"Warehouse with ID {data.WarehouseId} not found", ErrorType.NotFound));
        }

        var movement = new StockMovement(
            data.DocumentNumber,
            data.MovementDate,
            data.ProductId,
            data.WarehouseId,
            data.MovementType,
            data.Quantity,
            data.UnitCost,
            data.UserId);

        movement.SetLocations(data.FromLocationId, data.ToLocationId);

        if (!string.IsNullOrEmpty(data.SerialNumber))
            movement.SetSerialNumber(data.SerialNumber);

        if (!string.IsNullOrEmpty(data.LotNumber))
            movement.SetLotNumber(data.LotNumber);

        if (!string.IsNullOrEmpty(data.ReferenceDocumentType) && !string.IsNullOrEmpty(data.ReferenceDocumentNumber))
            movement.SetReference(data.ReferenceDocumentType, data.ReferenceDocumentNumber, data.ReferenceDocumentId);

        if (!string.IsNullOrEmpty(data.Description))
            movement.SetDescription(data.Description);

        await _stockMovementRepository.AddAsync(movement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<StockMovementDto>.Success(new StockMovementDto
        {
            Id = movement.Id,
            DocumentNumber = movement.DocumentNumber,
            MovementDate = movement.MovementDate,
            ProductId = movement.ProductId,
            ProductCode = product.Code,
            ProductName = product.Name,
            WarehouseId = movement.WarehouseId,
            WarehouseName = warehouse.Name,
            FromLocationId = movement.FromLocationId,
            ToLocationId = movement.ToLocationId,
            MovementType = movement.MovementType,
            Quantity = movement.Quantity,
            UnitCost = movement.UnitCost,
            TotalCost = movement.TotalCost,
            SerialNumber = movement.SerialNumber,
            LotNumber = movement.LotNumber,
            ReferenceDocumentType = movement.ReferenceDocumentType,
            ReferenceDocumentNumber = movement.ReferenceDocumentNumber,
            ReferenceDocumentId = movement.ReferenceDocumentId,
            Description = movement.Description,
            UserId = movement.UserId,
            IsReversed = movement.IsReversed,
            ReversedMovementId = movement.ReversedMovementId,
            CreatedAt = movement.CreatedDate
        });
    }
}
