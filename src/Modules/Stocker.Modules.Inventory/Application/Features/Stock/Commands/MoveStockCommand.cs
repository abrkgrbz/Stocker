using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Stock.Commands;

/// <summary>
/// Command to move stock between warehouses/locations
/// </summary>
public class MoveStockCommand : IRequest<Result<StockMovementDto>>
{
    public Guid TenantId { get; set; }
    public StockMoveDto MoveData { get; set; } = null!;
}

/// <summary>
/// Validator for MoveStockCommand
/// </summary>
public class MoveStockCommandValidator : AbstractValidator<MoveStockCommand>
{
    public MoveStockCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Kiracı kimliği gereklidir");

        RuleFor(x => x.MoveData)
            .NotNull().WithMessage("Transfer bilgileri gereklidir");

        When(x => x.MoveData != null, () =>
        {
            RuleFor(x => x.MoveData.ProductId)
                .NotEmpty().WithMessage("Ürün kimliği gereklidir");

            RuleFor(x => x.MoveData.SourceWarehouseId)
                .NotEmpty().WithMessage("Kaynak depo kimliği gereklidir");

            RuleFor(x => x.MoveData.DestinationWarehouseId)
                .NotEmpty().WithMessage("Hedef depo kimliği gereklidir");

            RuleFor(x => x.MoveData.Quantity)
                .NotEmpty().WithMessage("Miktar sıfırdan büyük olmalıdır");

            RuleFor(x => x)
                .Must(x => !(x.MoveData.SourceWarehouseId == x.MoveData.DestinationWarehouseId
                           && x.MoveData.SourceLocationId == x.MoveData.DestinationLocationId))
                .WithMessage("Kaynak ve hedef farklı olmalıdır");
        });
    }
}

/// <summary>
/// Handler for MoveStockCommand
/// </summary>
public class MoveStockCommandHandler : IRequestHandler<MoveStockCommand, Result<StockMovementDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public MoveStockCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<StockMovementDto>> Handle(MoveStockCommand request, CancellationToken cancellationToken)
    {
        const int maxRetries = 3;

        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync(cancellationToken);

                var result = await ExecuteCore(request, cancellationToken);

                if (result.IsFailure)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return result;
                }

                await _unitOfWork.CommitTransactionAsync(cancellationToken);
                return result;
            }
            catch (DbUpdateConcurrencyException) when (attempt < maxRetries - 1)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                continue;
            }
            catch (Exception)
            {
                if (_unitOfWork.HasActiveTransaction)
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                throw;
            }
        }

        return Result<StockMovementDto>.Failure(
            Error.Validation("Concurrency.MaxRetries", "İşlem eşzamanlılık çakışması nedeniyle tamamlanamadı. Lütfen tekrar deneyin."));
    }

    private async Task<Result<StockMovementDto>> ExecuteCore(MoveStockCommand request, CancellationToken cancellationToken)
    {
        var data = request.MoveData;

        // Validate product exists
        var product = await _unitOfWork.Products.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<StockMovementDto>.Failure(
                Error.NotFound("Product", $"Ürün bulunamadı (ID: {data.ProductId})"));
        }

        // Validate source warehouse exists
        var sourceWarehouse = await _unitOfWork.Warehouses.GetByIdAsync(data.SourceWarehouseId, cancellationToken);
        if (sourceWarehouse == null)
        {
            return Result<StockMovementDto>.Failure(
                Error.NotFound("Warehouse", $"Kaynak depo bulunamadı (ID: {data.SourceWarehouseId})"));
        }

        // Validate destination warehouse exists
        var destWarehouse = await _unitOfWork.Warehouses.GetByIdAsync(data.DestinationWarehouseId, cancellationToken);
        if (destWarehouse == null)
        {
            return Result<StockMovementDto>.Failure(
                Error.NotFound("Warehouse", $"Hedef depo bulunamadı (ID: {data.DestinationWarehouseId})"));
        }

        // Check cycle count lock - prevent movements to/from locations under active counting
        if (data.SourceLocationId.HasValue)
        {
            var sourceLocked = await _unitOfWork.CycleCounts.HasActiveCountForLocationAsync(
                data.SourceWarehouseId, data.SourceLocationId, cancellationToken);
            if (sourceLocked)
            {
                return Result<StockMovementDto>.Failure(
                    Error.Validation("CycleCount.LocationLocked",
                        "Kaynak lokasyonda aktif sayım işlemi devam ediyor. Sayım tamamlanana kadar stok transferi yapılamaz."));
            }
        }

        if (data.DestinationLocationId.HasValue)
        {
            var destLocked = await _unitOfWork.CycleCounts.HasActiveCountForLocationAsync(
                data.DestinationWarehouseId, data.DestinationLocationId, cancellationToken);
            if (destLocked)
            {
                return Result<StockMovementDto>.Failure(
                    Error.Validation("CycleCount.LocationLocked",
                        "Hedef lokasyonda aktif sayım işlemi devam ediyor. Sayım tamamlanana kadar stok transferi yapılamaz."));
            }
        }

        // Validate destination location capacity and zone constraints
        Location? sourceLocation = null;
        Location? destLocation = null;

        if (data.SourceLocationId.HasValue)
        {
            sourceLocation = await _unitOfWork.Locations.GetByIdAsync(data.SourceLocationId.Value, cancellationToken);
        }

        if (data.DestinationLocationId.HasValue)
        {
            destLocation = await _unitOfWork.Locations.GetByIdAsync(data.DestinationLocationId.Value, cancellationToken);
            if (destLocation == null)
            {
                return Result<StockMovementDto>.Failure(
                    Error.NotFound("Location", $"Hedef lokasyon bulunamadı (ID: {data.DestinationLocationId.Value})"));
            }

            // Check destination location capacity
            if (!destLocation.HasAvailableCapacity(data.Quantity))
            {
                return Result<StockMovementDto>.Failure(
                    Error.Validation("Location.CapacityExceeded",
                        $"Hedef lokasyon kapasitesi yetersiz. Kullanılabilir: {destLocation.GetAvailableCapacity()}, İstenen: {data.Quantity}"));
            }

            // Check zone constraints if location has a zone
            if (destLocation.WarehouseZoneId.HasValue)
            {
                var zone = await _unitOfWork.WarehouseZones.GetByIdAsync(destLocation.WarehouseZoneId.Value, cancellationToken);
                if (zone != null)
                {
                    // Prevent placing items in quarantine zone via regular transfer
                    if (zone.IsQuarantineZone)
                    {
                        return Result<StockMovementDto>.Failure(
                            Error.Validation("Zone.QuarantineRestriction",
                                "Karantina bölgesine normal transfer ile stok yerleştirilemez"));
                    }
                }
            }
        }

        // Get source stock
        var sourceStock = await _unitOfWork.Stocks.GetByProductAndLocationAsync(
            data.ProductId, data.SourceWarehouseId, data.SourceLocationId, cancellationToken);

        if (sourceStock == null || sourceStock.AvailableQuantity < data.Quantity)
        {
            return Result<StockMovementDto>.Failure(
                Error.Validation("Stock.Insufficient", "Kaynak konumda yeterli stok bulunmuyor"));
        }

        // Get or create destination stock
        var destStock = await _unitOfWork.Stocks.GetByProductAndLocationAsync(
            data.ProductId, data.DestinationWarehouseId, data.DestinationLocationId, cancellationToken);

        if (destStock == null)
        {
            destStock = new Domain.Entities.Stock(data.ProductId, data.DestinationWarehouseId, 0);
            destStock.SetTenantId(request.TenantId);
            if (data.DestinationLocationId.HasValue)
            {
                destStock.SetLocation(data.DestinationLocationId.Value);
            }
            await _unitOfWork.Stocks.AddAsync(destStock, cancellationToken);
        }

        // Perform the transfer
        sourceStock.DecreaseStock(data.Quantity);
        destStock.IncreaseStock(data.Quantity);

        // Update location capacities
        if (sourceLocation != null)
        {
            sourceLocation.DecreaseUsedCapacity(data.Quantity);
        }
        if (destLocation != null)
        {
            destLocation.IncreaseUsedCapacity(data.Quantity);
        }

        // Create stock movement record
        var documentNumber = await _unitOfWork.StockMovements.GenerateDocumentNumberAsync(
            StockMovementType.Transfer, cancellationToken);

        var movement = new StockMovement(
            documentNumber,
            DateTime.UtcNow,
            data.ProductId,
            data.SourceWarehouseId,
            StockMovementType.Transfer,
            data.Quantity,
            0, // unitCost
            0); // userId - should get from context

        movement.SetTenantId(request.TenantId);
        movement.SetLocations(data.SourceLocationId, data.DestinationLocationId);

        if (!string.IsNullOrEmpty(data.Notes))
        {
            movement.SetDescription(data.Notes);
        }

        await _unitOfWork.StockMovements.AddAsync(movement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Return DTO
        var movementDto = new StockMovementDto
        {
            Id = movement.Id,
            DocumentNumber = movement.DocumentNumber,
            ProductId = movement.ProductId,
            ProductCode = product.Code,
            ProductName = product.Name,
            WarehouseId = movement.WarehouseId,
            WarehouseName = sourceWarehouse.Name,
            FromLocationId = movement.FromLocationId,
            ToLocationId = movement.ToLocationId,
            MovementType = movement.MovementType,
            Quantity = movement.Quantity,
            Description = movement.Description,
            MovementDate = movement.MovementDate,
            CreatedAt = movement.CreatedDate
        };

        return Result<StockMovementDto>.Success(movementDto);
    }
}
