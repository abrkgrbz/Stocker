using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockReservations.Commands;

public class CreateStockReservationCommand : IRequest<Result<StockReservationDto>>
{
    public int TenantId { get; set; }
    public CreateStockReservationDto Data { get; set; } = null!;
}

public class CreateStockReservationCommandValidator : AbstractValidator<CreateStockReservationCommand>
{
    public CreateStockReservationCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.ReservationNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Data.ProductId).GreaterThan(0);
        RuleFor(x => x.Data.WarehouseId).GreaterThan(0);
        RuleFor(x => x.Data.Quantity).GreaterThan(0);
        RuleFor(x => x.Data.CreatedByUserId).GreaterThan(0);
    }
}

public class CreateStockReservationCommandHandler : IRequestHandler<CreateStockReservationCommand, Result<StockReservationDto>>
{
    private readonly IStockReservationRepository _stockReservationRepository;
    private readonly IProductRepository _productRepository;
    private readonly IWarehouseRepository _warehouseRepository;

    public CreateStockReservationCommandHandler(
        IStockReservationRepository stockReservationRepository,
        IProductRepository productRepository,
        IWarehouseRepository warehouseRepository)
    {
        _stockReservationRepository = stockReservationRepository;
        _productRepository = productRepository;
        _warehouseRepository = warehouseRepository;
    }

    public async Task<Result<StockReservationDto>> Handle(CreateStockReservationCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        var product = await _productRepository.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<StockReservationDto>.Failure(new Error("Product.NotFound", $"Product with ID {data.ProductId} not found", ErrorType.NotFound));
        }

        var warehouse = await _warehouseRepository.GetByIdAsync(data.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result<StockReservationDto>.Failure(new Error("Warehouse.NotFound", $"Warehouse with ID {data.WarehouseId} not found", ErrorType.NotFound));
        }

        var reservation = new StockReservation(
            data.ReservationNumber,
            data.ProductId,
            data.WarehouseId,
            data.Quantity,
            data.ReservationType,
            data.CreatedByUserId,
            data.ExpirationDate);

        reservation.SetLocation(data.LocationId);

        if (!string.IsNullOrEmpty(data.ReferenceDocumentType) && !string.IsNullOrEmpty(data.ReferenceDocumentNumber))
            reservation.SetReference(data.ReferenceDocumentType, data.ReferenceDocumentNumber, data.ReferenceDocumentId);

        if (!string.IsNullOrEmpty(data.Notes))
            reservation.SetNotes(data.Notes);

        await _stockReservationRepository.AddAsync(reservation, cancellationToken);

        return Result<StockReservationDto>.Success(new StockReservationDto
        {
            Id = reservation.Id,
            ReservationNumber = reservation.ReservationNumber,
            ProductId = reservation.ProductId,
            ProductCode = product.Code,
            ProductName = product.Name,
            WarehouseId = reservation.WarehouseId,
            WarehouseName = warehouse.Name,
            LocationId = reservation.LocationId,
            Quantity = reservation.Quantity,
            FulfilledQuantity = reservation.FulfilledQuantity,
            RemainingQuantity = reservation.RemainingQuantity,
            Status = reservation.Status,
            ReservationType = reservation.ReservationType,
            ReferenceDocumentType = reservation.ReferenceDocumentType,
            ReferenceDocumentNumber = reservation.ReferenceDocumentNumber,
            ReferenceDocumentId = reservation.ReferenceDocumentId,
            ReservationDate = reservation.ReservationDate,
            ExpirationDate = reservation.ExpirationDate,
            Notes = reservation.Notes,
            CreatedByUserId = reservation.CreatedByUserId,
            CreatedAt = reservation.CreatedDate
        });
    }
}
