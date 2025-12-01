using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Commands;

public class CreateStockCountCommand : IRequest<Result<StockCountDto>>
{
    public int TenantId { get; set; }
    public CreateStockCountDto Data { get; set; } = null!;
}

public class CreateStockCountCommandValidator : AbstractValidator<CreateStockCountCommand>
{
    public CreateStockCountCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.CountNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Data.WarehouseId).GreaterThan(0);
        RuleFor(x => x.Data.CreatedByUserId).GreaterThan(0);
    }
}

public class CreateStockCountCommandHandler : IRequestHandler<CreateStockCountCommand, Result<StockCountDto>>
{
    private readonly IStockCountRepository _stockCountRepository;
    private readonly IWarehouseRepository _warehouseRepository;

    public CreateStockCountCommandHandler(
        IStockCountRepository stockCountRepository,
        IWarehouseRepository warehouseRepository)
    {
        _stockCountRepository = stockCountRepository;
        _warehouseRepository = warehouseRepository;
    }

    public async Task<Result<StockCountDto>> Handle(CreateStockCountCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        var warehouse = await _warehouseRepository.GetByIdAsync(data.WarehouseId, cancellationToken);
        if (warehouse == null)
        {
            return Result<StockCountDto>.Failure(new Error("Warehouse.NotFound", $"Warehouse with ID {data.WarehouseId} not found", ErrorType.NotFound));
        }

        var stockCount = new StockCount(
            data.CountNumber,
            data.CountDate,
            data.WarehouseId,
            data.CountType,
            data.CreatedByUserId);

        stockCount.SetLocation(data.LocationId);
        stockCount.SetDescription(data.Description);
        stockCount.SetNotes(data.Notes);
        stockCount.SetAutoAdjust(data.AutoAdjust);

        foreach (var itemDto in data.Items)
        {
            var item = stockCount.AddItem(itemDto.ProductId, itemDto.SystemQuantity);

            if (itemDto.LocationId.HasValue)
                item.SetLocation(itemDto.LocationId);

            if (!string.IsNullOrEmpty(itemDto.SerialNumber))
                item.SetSerialNumber(itemDto.SerialNumber);

            if (!string.IsNullOrEmpty(itemDto.LotNumber))
                item.SetLotNumber(itemDto.LotNumber);
        }

        await _stockCountRepository.AddAsync(stockCount, cancellationToken);

        return Result<StockCountDto>.Success(new StockCountDto
        {
            Id = stockCount.Id,
            CountNumber = stockCount.CountNumber,
            CountDate = stockCount.CountDate,
            WarehouseId = stockCount.WarehouseId,
            WarehouseName = warehouse.Name,
            LocationId = stockCount.LocationId,
            CountType = stockCount.CountType,
            Status = stockCount.Status,
            Description = stockCount.Description,
            Notes = stockCount.Notes,
            AutoAdjust = stockCount.AutoAdjust,
            TotalSystemQuantity = stockCount.GetTotalSystemQuantity(),
            TotalCountedQuantity = stockCount.GetTotalCountedQuantity(),
            TotalDifference = stockCount.GetTotalDifference(),
            ItemsWithDifferenceCount = stockCount.GetItemsWithDifferenceCount(),
            CreatedByUserId = stockCount.CreatedByUserId,
            CreatedAt = stockCount.CreatedDate
        });
    }
}
