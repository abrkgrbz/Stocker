using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;

public class CreateStockTransferCommand : IRequest<Result<StockTransferDto>>
{
    public int TenantId { get; set; }
    public CreateStockTransferDto Data { get; set; } = null!;
}

public class CreateStockTransferCommandValidator : AbstractValidator<CreateStockTransferCommand>
{
    public CreateStockTransferCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.TransferNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Data.SourceWarehouseId).GreaterThan(0);
        RuleFor(x => x.Data.DestinationWarehouseId).GreaterThan(0);
        RuleFor(x => x.Data.CreatedByUserId).GreaterThan(0);
        RuleFor(x => x.Data.SourceWarehouseId).NotEqual(x => x.Data.DestinationWarehouseId)
            .WithMessage("Source and destination warehouses must be different");
    }
}

public class CreateStockTransferCommandHandler : IRequestHandler<CreateStockTransferCommand, Result<StockTransferDto>>
{
    private readonly IStockTransferRepository _stockTransferRepository;
    private readonly IWarehouseRepository _warehouseRepository;

    public CreateStockTransferCommandHandler(
        IStockTransferRepository stockTransferRepository,
        IWarehouseRepository warehouseRepository)
    {
        _stockTransferRepository = stockTransferRepository;
        _warehouseRepository = warehouseRepository;
    }

    public async Task<Result<StockTransferDto>> Handle(CreateStockTransferCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        var sourceWarehouse = await _warehouseRepository.GetByIdAsync(data.SourceWarehouseId, cancellationToken);
        if (sourceWarehouse == null)
        {
            return Result<StockTransferDto>.Failure(new Error("Warehouse.NotFound", $"Source warehouse with ID {data.SourceWarehouseId} not found", ErrorType.NotFound));
        }

        var destWarehouse = await _warehouseRepository.GetByIdAsync(data.DestinationWarehouseId, cancellationToken);
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

        transfer.SetDescription(data.Description);
        transfer.SetNotes(data.Notes);
        transfer.SetExpectedArrival(data.ExpectedArrivalDate);

        foreach (var itemDto in data.Items)
        {
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

        await _stockTransferRepository.AddAsync(transfer, cancellationToken);

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
