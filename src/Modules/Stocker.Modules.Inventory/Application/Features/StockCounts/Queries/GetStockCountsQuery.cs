using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Queries;

/// <summary>
/// Query to get stock counts
/// </summary>
public class GetStockCountsQuery : IRequest<Result<List<StockCountListDto>>>
{
    public int TenantId { get; set; }
    public int? WarehouseId { get; set; }
    public StockCountStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// Handler for GetStockCountsQuery
/// </summary>
public class GetStockCountsQueryHandler : IRequestHandler<GetStockCountsQuery, Result<List<StockCountListDto>>>
{
    private readonly IStockCountRepository _stockCountRepository;

    public GetStockCountsQueryHandler(IStockCountRepository stockCountRepository)
    {
        _stockCountRepository = stockCountRepository;
    }

    public async Task<Result<List<StockCountListDto>>> Handle(GetStockCountsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.StockCount> stockCounts;

        if (request.Status.HasValue)
        {
            stockCounts = await _stockCountRepository.GetByStatusAsync(request.Status.Value, cancellationToken);
        }
        else if (request.WarehouseId.HasValue)
        {
            stockCounts = await _stockCountRepository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken);
        }
        else if (request.FromDate.HasValue && request.ToDate.HasValue)
        {
            stockCounts = await _stockCountRepository.GetByDateRangeAsync(request.FromDate.Value, request.ToDate.Value, cancellationToken);
        }
        else
        {
            stockCounts = await _stockCountRepository.GetAllAsync(cancellationToken);
        }

        var dtos = stockCounts.Select(c => new StockCountListDto
        {
            Id = c.Id,
            CountNumber = c.CountNumber,
            CountDate = c.CountDate,
            WarehouseName = c.Warehouse?.Name ?? string.Empty,
            LocationName = c.Location?.Name,
            Status = c.Status,
            CountType = c.CountType,
            TotalItems = c.Items?.Count ?? 0,
            CountedItems = c.Items?.Count(i => i.IsCounted) ?? 0,
            ItemsWithDifference = c.Items?.Count(i => i.HasDifference) ?? 0
        }).ToList();

        return Result<List<StockCountListDto>>.Success(dtos);
    }
}
