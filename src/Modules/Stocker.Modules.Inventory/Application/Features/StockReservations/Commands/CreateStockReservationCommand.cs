using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockReservations.Commands;

public class CreateStockReservationCommand : IRequest<Result<StockReservationDto>>
{
    public Guid TenantId { get; set; }
    public CreateStockReservationDto Data { get; set; } = null!;
}

public class CreateStockReservationCommandValidator : AbstractValidator<CreateStockReservationCommand>
{
    public CreateStockReservationCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.ReservationNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Data.ProductId).NotEmpty();
        RuleFor(x => x.Data.WarehouseId).NotEmpty();
        RuleFor(x => x.Data.Quantity).NotEmpty();
        RuleFor(x => x.Data.CreatedByUserId).NotEmpty();
    }
}

public class CreateStockReservationCommandHandler : IRequestHandler<CreateStockReservationCommand, Result<StockReservationDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateStockReservationCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Default TTL for reservations without explicit expiration (24 hours)
    /// </summary>
    private static readonly TimeSpan DefaultReservationTtl = TimeSpan.FromHours(24);

    public async Task<Result<StockReservationDto>> Handle(CreateStockReservationCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        var product = await _unitOfWork.Products.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<StockReservationDto>.Failure(new Error("Product.NotFound", $"Product with ID {data.ProductId} not found", ErrorType.NotFound));
        }

        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(data.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result<StockReservationDto>.Failure(new Error("Warehouse.NotFound", $"Warehouse with ID {data.WarehouseId} not found", ErrorType.NotFound));
        }

        // Enforce expiration date - use default TTL if not specified
        var expirationDate = data.ExpirationDate ?? DateTime.UtcNow.Add(DefaultReservationTtl);

        // Check available stock before reserving
        var stock = await _unitOfWork.Stocks.GetByProductAndWarehouseAsync(data.ProductId, data.WarehouseId, cancellationToken);
        if (stock == null)
        {
            return Result<StockReservationDto>.Failure(new Error("Stock.NotFound",
                $"Ürün ID {data.ProductId} için depo ID {data.WarehouseId}'de stok bulunamadı.", ErrorType.NotFound));
        }

        if (stock.AvailableQuantity < data.Quantity)
        {
            return Result<StockReservationDto>.Failure(new Error("Stock.InsufficientAvailable",
                $"Yetersiz kullanılabilir stok. Talep: {data.Quantity}, Kullanılabilir: {stock.AvailableQuantity}", ErrorType.Validation));
        }

        // Reserve stock atomically
        stock.ReserveStock(data.Quantity);

        var reservation = new StockReservation(
            data.ReservationNumber,
            data.ProductId,
            data.WarehouseId,
            data.Quantity,
            data.ReservationType,
            data.CreatedByUserId,
            expirationDate);

        reservation.SetTenantId(request.TenantId);
        reservation.RaiseCreatedEvent();
        reservation.SetLocation(data.LocationId);

        if (!string.IsNullOrEmpty(data.ReferenceDocumentType) && !string.IsNullOrEmpty(data.ReferenceDocumentNumber))
            reservation.SetReference(data.ReferenceDocumentType, data.ReferenceDocumentNumber, data.ReferenceDocumentId);

        if (!string.IsNullOrEmpty(data.Notes))
            reservation.SetNotes(data.Notes);

        await _unitOfWork.StockReservations.AddAsync(reservation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
