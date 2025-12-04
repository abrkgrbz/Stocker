using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Queries;

/// <summary>
/// Query to get a stock count by ID
/// </summary>
public class GetStockCountByIdQuery : IRequest<Result<StockCountDto>>
{
    public Guid TenantId { get; set; }
    public int StockCountId { get; set; }
}

/// <summary>
/// Handler for GetStockCountByIdQuery
/// </summary>
public class GetStockCountByIdQueryHandler : IRequestHandler<GetStockCountByIdQuery, Result<StockCountDto>>
{
    private readonly IStockCountRepository _stockCountRepository;

    public GetStockCountByIdQueryHandler(IStockCountRepository stockCountRepository)
    {
        _stockCountRepository = stockCountRepository;
    }

    public async Task<Result<StockCountDto>> Handle(GetStockCountByIdQuery request, CancellationToken cancellationToken)
    {
        var stockCount = await _stockCountRepository.GetWithItemsAsync(request.StockCountId, cancellationToken);

        if (stockCount == null)
        {
            return Result<StockCountDto>.Failure(new Error("StockCount.NotFound", $"Stock count with ID {request.StockCountId} not found", ErrorType.NotFound));
        }

        var dto = new StockCountDto
        {
            Id = stockCount.Id,
            CountNumber = stockCount.CountNumber,
            CountDate = stockCount.CountDate,
            WarehouseId = stockCount.WarehouseId,
            WarehouseName = stockCount.Warehouse?.Name ?? string.Empty,
            LocationId = stockCount.LocationId,
            LocationName = stockCount.Location?.Name,
            Status = stockCount.Status,
            CountType = stockCount.CountType,
            Description = stockCount.Description,
            Notes = stockCount.Notes,
            StartedDate = stockCount.StartedAt,
            CompletedDate = stockCount.CompletedAt,
            CancelledDate = stockCount.CancelledAt,
            CancellationReason = stockCount.CancellationReason,
            CreatedByUserId = stockCount.CreatedByUserId,
            CompletedByUserId = stockCount.CountedByUserId,
            CreatedAt = stockCount.CreatedDate,
            TotalItems = stockCount.Items?.Count ?? 0,
            CountedItems = stockCount.Items?.Count(i => i.IsCounted) ?? 0,
            ItemsWithDifferenceCount = stockCount.Items?.Count(i => i.HasDifference) ?? 0,
            TotalSystemQuantity = stockCount.Items != null ? stockCount.Items.Sum(i => i.SystemQuantity) : 0m,
            TotalCountedQuantity = stockCount.Items != null ? stockCount.Items.Where(i => i.IsCounted).Sum(i => i.CountedQuantity ?? 0m) : 0m,
            TotalDifference = stockCount.Items != null ? stockCount.Items.Where(i => i.HasDifference).Sum(i => i.Difference) : 0m,
            AutoAdjust = stockCount.AutoAdjust,
            Items = stockCount.Items?.Select(i => new StockCountItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductCode = i.Product?.Code ?? string.Empty,
                ProductName = i.Product?.Name ?? string.Empty,
                LocationId = i.LocationId,
                LocationName = i.Location?.Name,
                SystemQuantity = i.SystemQuantity,
                CountedQuantity = i.CountedQuantity,
                Difference = i.Difference,
                HasDifference = i.HasDifference,
                SerialNumber = i.SerialNumber,
                LotNumber = i.LotNumber,
                Notes = i.Notes,
                IsCounted = i.IsCounted
            }).ToList() ?? new List<StockCountItemDto>()
        };

        return Result<StockCountDto>.Success(dto);
    }
}
