using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Queries;

/// <summary>
/// Query to get summary/report for a stock count
/// </summary>
public class GetStockCountSummaryQuery : IRequest<Result<StockCountSummaryDto>>
{
    public int TenantId { get; set; }
    public int StockCountId { get; set; }
}

/// <summary>
/// Handler for GetStockCountSummaryQuery
/// </summary>
public class GetStockCountSummaryQueryHandler : IRequestHandler<GetStockCountSummaryQuery, Result<StockCountSummaryDto>>
{
    private readonly IStockCountRepository _stockCountRepository;

    public GetStockCountSummaryQueryHandler(IStockCountRepository stockCountRepository)
    {
        _stockCountRepository = stockCountRepository;
    }

    public async Task<Result<StockCountSummaryDto>> Handle(GetStockCountSummaryQuery request, CancellationToken cancellationToken)
    {
        var stockCount = await _stockCountRepository.GetWithItemsAsync(request.StockCountId, cancellationToken);
        if (stockCount == null)
        {
            return Result<StockCountSummaryDto>.Failure(
                Error.NotFound("StockCount", $"Stock count with ID {request.StockCountId} not found"));
        }

        var countedItems = stockCount.Items.Where(i => i.IsCounted).ToList();

        var itemsWithPositiveDifference = countedItems.Where(i => i.Difference > 0).ToList();
        var itemsWithNegativeDifference = countedItems.Where(i => i.Difference < 0).ToList();
        var itemsWithNoChange = countedItems.Where(i => i.Difference == 0).ToList();

        var totalPositiveDifference = itemsWithPositiveDifference.Sum(i => i.Difference);
        var totalNegativeDifference = Math.Abs(itemsWithNegativeDifference.Sum(i => i.Difference));
        var netDifference = totalPositiveDifference - totalNegativeDifference;

        // Estimate value impact (simplified - in real scenario would use product costs)
        var estimatedValueImpact = netDifference; // This would normally multiply by unit cost

        var summary = new StockCountSummaryDto
        {
            StockCountId = stockCount.Id,
            CountNumber = stockCount.CountNumber,
            WarehouseName = stockCount.Warehouse?.Name ?? string.Empty,
            TotalItems = stockCount.Items.Count,
            ItemsWithNoChange = itemsWithNoChange.Count,
            ItemsWithPositiveDifference = itemsWithPositiveDifference.Count,
            ItemsWithNegativeDifference = itemsWithNegativeDifference.Count,
            TotalPositiveDifference = totalPositiveDifference,
            TotalNegativeDifference = totalNegativeDifference,
            NetDifference = netDifference,
            EstimatedValueImpact = estimatedValueImpact
        };

        return Result<StockCountSummaryDto>.Success(summary);
    }
}
