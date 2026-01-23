using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;

public class CreateStockTransferCommand : IRequest<Result<StockTransferDto>>
{
    public Guid TenantId { get; set; }
    public CreateStockTransferDto Data { get; set; } = null!;
}

public class CreateStockTransferCommandValidator : AbstractValidator<CreateStockTransferCommand>
{
    public CreateStockTransferCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.TransferNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Data.SourceWarehouseId).NotEmpty();
        RuleFor(x => x.Data.DestinationWarehouseId).NotEmpty();
        RuleFor(x => x.Data.CreatedByUserId).GreaterThan(0);
        RuleFor(x => x.Data.SourceWarehouseId).NotEqual(x => x.Data.DestinationWarehouseId)
            .WithMessage("Source and destination warehouses must be different");
    }
}

public class CreateStockTransferCommandHandler : IRequestHandler<CreateStockTransferCommand, Result<StockTransferDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateStockTransferCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<StockTransferDto>> Handle(CreateStockTransferCommand request, CancellationToken cancellationToken)
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

        return Result<StockTransferDto>.Failure(
            Error.Validation("Concurrency.MaxRetries", "İşlem eşzamanlılık çakışması nedeniyle tamamlanamadı. Lütfen tekrar deneyin."));
    }

    private async Task<Result<StockTransferDto>> ExecuteCore(CreateStockTransferCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        var sourceWarehouse = await _unitOfWork.Warehouses.GetByIdAsync(data.SourceWarehouseId, cancellationToken);
        if (sourceWarehouse == null)
        {
            return Result<StockTransferDto>.Failure(new Error("Warehouse.NotFound", $"Source warehouse with ID {data.SourceWarehouseId} not found", ErrorType.NotFound));
        }

        var destWarehouse = await _unitOfWork.Warehouses.GetByIdAsync(data.DestinationWarehouseId, cancellationToken);
        if (destWarehouse == null)
        {
            return Result<StockTransferDto>.Failure(new Error("Warehouse.NotFound", $"Destination warehouse with ID {data.DestinationWarehouseId} not found", ErrorType.NotFound));
        }

        var transfer = new StockTransfer(
            data.TransferNumber,
            data.TransferDate,
            data.SourceWarehouseId,
            data.DestinationWarehouseId,
            data.TransferType,
            data.CreatedByUserId);

        transfer.SetTenantId(request.TenantId);
        transfer.RaiseCreatedEvent();
        transfer.SetDescription(data.Description);
        transfer.SetNotes(data.Notes);
        transfer.SetExpectedArrival(data.ExpectedArrivalDate);

        // Sort items by ProductId to ensure consistent lock ordering and prevent deadlocks
        var sortedItems = data.Items.OrderBy(i => i.ProductId).ThenBy(i => i.SourceLocationId ?? 0).ToList();

        // Validate stock availability and reserve stock for each item
        foreach (var itemDto in sortedItems)
        {
            // Check source stock availability
            var sourceStock = await _unitOfWork.Stocks.GetByProductAndLocationAsync(
                itemDto.ProductId, data.SourceWarehouseId, itemDto.SourceLocationId, cancellationToken);

            if (sourceStock == null || sourceStock.AvailableQuantity < itemDto.RequestedQuantity)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(itemDto.ProductId, cancellationToken);
                return Result<StockTransferDto>.Failure(
                    Error.Validation("Stock.Insufficient",
                        $"Ürün '{product?.Name ?? itemDto.ProductId.ToString()}' için kaynak depoda yeterli stok bulunmuyor. " +
                        $"Kullanılabilir: {sourceStock?.AvailableQuantity ?? 0}, İstenen: {itemDto.RequestedQuantity}"));
            }

            // Reserve the stock for this transfer
            sourceStock.ReserveStock(itemDto.RequestedQuantity);

            var item = transfer.AddItem(
                itemDto.ProductId,
                itemDto.RequestedQuantity,
                itemDto.SourceLocationId,
                itemDto.DestinationLocationId);

            if (!string.IsNullOrEmpty(itemDto.SerialNumber))
                item.SetSerialNumber(itemDto.SerialNumber);

            if (!string.IsNullOrEmpty(itemDto.LotNumber))
                item.SetLotNumber(itemDto.LotNumber);

            if (!string.IsNullOrEmpty(itemDto.Notes))
                item.SetNotes(itemDto.Notes);
        }

        await _unitOfWork.StockTransfers.AddAsync(transfer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<StockTransferDto>.Success(new StockTransferDto
        {
            Id = transfer.Id,
            TransferNumber = transfer.TransferNumber,
            TransferDate = transfer.TransferDate,
            SourceWarehouseId = transfer.SourceWarehouseId,
            SourceWarehouseName = sourceWarehouse.Name,
            DestinationWarehouseId = transfer.DestinationWarehouseId,
            DestinationWarehouseName = destWarehouse.Name,
            Status = transfer.Status,
            TransferType = transfer.TransferType,
            Description = transfer.Description,
            Notes = transfer.Notes,
            ExpectedArrivalDate = transfer.ExpectedArrivalDate,
            TotalRequestedQuantity = transfer.GetTotalRequestedQuantity(),
            TotalShippedQuantity = transfer.GetTotalShippedQuantity(),
            TotalReceivedQuantity = transfer.GetTotalReceivedQuantity(),
            CreatedByUserId = transfer.CreatedByUserId,
            CreatedAt = transfer.CreatedDate
        });
    }
}
