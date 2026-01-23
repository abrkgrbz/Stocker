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
/// Command to adjust stock quantity
/// </summary>
public class AdjustStockCommand : IRequest<Result<StockDto>>
{
    public Guid TenantId { get; set; }
    public StockAdjustmentDto AdjustmentData { get; set; } = null!;
}

/// <summary>
/// Validator for AdjustStockCommand
/// </summary>
public class AdjustStockCommandValidator : AbstractValidator<AdjustStockCommand>
{
    public AdjustStockCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Kiracı kimliği gereklidir");

        RuleFor(x => x.AdjustmentData)
            .NotNull().WithMessage("Düzeltme bilgileri gereklidir");

        When(x => x.AdjustmentData != null, () =>
        {
            RuleFor(x => x.AdjustmentData.ProductId)
                .NotEmpty().WithMessage("Ürün kimliği gereklidir");

            RuleFor(x => x.AdjustmentData.WarehouseId)
                .NotEmpty().WithMessage("Depo kimliği gereklidir");

            RuleFor(x => x.AdjustmentData.NewQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("Yeni miktar negatif olamaz");
        });
    }
}

/// <summary>
/// Handler for AdjustStockCommand
/// </summary>
public class AdjustStockCommandHandler : IRequestHandler<AdjustStockCommand, Result<StockDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public AdjustStockCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<StockDto>> Handle(AdjustStockCommand request, CancellationToken cancellationToken)
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

        return Result<StockDto>.Failure(
            Error.Validation("Concurrency.MaxRetries", "İşlem eşzamanlılık çakışması nedeniyle tamamlanamadı. Lütfen tekrar deneyin."));
    }

    private async Task<Result<StockDto>> ExecuteCore(AdjustStockCommand request, CancellationToken cancellationToken)
    {
        var data = request.AdjustmentData;

        var product = await _unitOfWork.Products.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<StockDto>.Failure(
                Error.NotFound("Product", $"Ürün bulunamadı (ID: {data.ProductId})"));
        }

        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(data.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result<StockDto>.Failure(
                Error.NotFound("Warehouse", $"Depo bulunamadı (ID: {data.WarehouseId})"));
        }

        var stock = await _unitOfWork.Stocks.GetByProductAndLocationAsync(
            data.ProductId, data.WarehouseId, data.LocationId, cancellationToken);

        decimal previousQuantity = 0;

        if (stock == null)
        {
            stock = new Domain.Entities.Stock(data.ProductId, data.WarehouseId, data.NewQuantity);
            stock.SetTenantId(request.TenantId);
            if (data.LocationId.HasValue)
            {
                stock.SetLocation(data.LocationId.Value);
            }
            await _unitOfWork.Stocks.AddAsync(stock, cancellationToken);
        }
        else
        {
            previousQuantity = stock.Quantity;
            stock.AdjustStock(data.NewQuantity);
        }

        // Create stock movement record
        var quantityChange = data.NewQuantity - previousQuantity;
        var movementType = quantityChange >= 0 ? StockMovementType.AdjustmentIncrease : StockMovementType.AdjustmentDecrease;

        var documentNumber = await _unitOfWork.StockMovements.GenerateDocumentNumberAsync(
            movementType, cancellationToken);

        var movement = new StockMovement(
            documentNumber,
            DateTime.UtcNow,
            data.ProductId,
            data.WarehouseId,
            movementType,
            Math.Abs(quantityChange),
            0, // unitCost
            0); // userId - should get from context

        movement.SetTenantId(request.TenantId);
        movement.SetReference("Adjustment", data.Reason ?? "Manual stock adjustment", null);

        if (!string.IsNullOrEmpty(data.Notes))
        {
            movement.SetDescription(data.Notes);
        }

        await _unitOfWork.StockMovements.AddAsync(movement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var stockDto = new StockDto
        {
            Id = stock.Id,
            ProductId = stock.ProductId,
            ProductCode = product.Code,
            ProductName = product.Name,
            WarehouseId = stock.WarehouseId,
            WarehouseName = warehouse.Name,
            LocationId = stock.LocationId,
            Quantity = stock.Quantity,
            ReservedQuantity = stock.ReservedQuantity,
            AvailableQuantity = stock.AvailableQuantity,
            LastMovementDate = stock.LastMovementDate,
            LastCountDate = stock.LastCountDate
        };

        return Result<StockDto>.Success(stockDto);
    }
}
