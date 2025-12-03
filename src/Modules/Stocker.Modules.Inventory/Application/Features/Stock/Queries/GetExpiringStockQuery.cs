using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Stock.Queries;

/// <summary>
/// Query to get stock items that are expiring within specified days
/// </summary>
public class GetExpiringStockQuery : IRequest<Result<List<ExpiringStockDto>>>
{
    public int TenantId { get; set; }
    public int DaysUntilExpiry { get; set; } = 30;
    public int? WarehouseId { get; set; }
}

/// <summary>
/// Handler for GetExpiringStockQuery
/// </summary>
public class GetExpiringStockQueryHandler : IRequestHandler<GetExpiringStockQuery, Result<List<ExpiringStockDto>>>
{
    private readonly IStockRepository _stockRepository;
    private readonly ILotBatchRepository _lotBatchRepository;

    public GetExpiringStockQueryHandler(
        IStockRepository stockRepository,
        ILotBatchRepository lotBatchRepository)
    {
        _stockRepository = stockRepository;
        _lotBatchRepository = lotBatchRepository;
    }

    public async Task<Result<List<ExpiringStockDto>>> Handle(GetExpiringStockQuery request, CancellationToken cancellationToken)
    {
        // Get expiring stocks from Stock entity
        var expiringStocks = await _stockRepository.GetExpiringStocksAsync(request.DaysUntilExpiry, cancellationToken);

        // Filter by warehouse if specified
        if (request.WarehouseId.HasValue)
        {
            expiringStocks = expiringStocks.Where(s => s.WarehouseId == request.WarehouseId.Value).ToList();
        }

        // Get expiring lot batches
        var expiringLotBatches = await _lotBatchRepository.GetExpiringLotsAsync(request.DaysUntilExpiry, cancellationToken);

        var result = new List<ExpiringStockDto>();

        // Map expiring stocks
        foreach (var stock in expiringStocks)
        {
            if (!stock.ExpiryDate.HasValue) continue;

            var daysUntilExpiry = (int)(stock.ExpiryDate.Value - DateTime.UtcNow).TotalDays;

            result.Add(new ExpiringStockDto
            {
                StockId = stock.Id,
                ProductId = stock.ProductId,
                ProductName = stock.Product?.Name ?? "Unknown",
                ProductCode = stock.Product?.Code ?? "Unknown",
                WarehouseName = stock.Warehouse?.Name ?? "Unknown",
                LocationName = stock.Location?.Name,
                Quantity = stock.Quantity,
                LotNumber = stock.LotNumber,
                ExpiryDate = stock.ExpiryDate.Value,
                DaysUntilExpiry = daysUntilExpiry
            });
        }

        // Map expiring lot batches
        foreach (var batch in expiringLotBatches)
        {
            if (!batch.ExpiryDate.HasValue) continue;

            // Avoid duplicates if already added from stock
            if (!result.Any(r => r.LotNumber == batch.LotNumber && r.ProductId == batch.ProductId))
            {
                var daysUntilExpiry = batch.GetDaysUntilExpiry() ?? 0;

                result.Add(new ExpiringStockDto
                {
                    StockId = 0, // No stock ID for lot batch records
                    ProductId = batch.ProductId,
                    ProductName = batch.Product?.Name ?? "Unknown",
                    ProductCode = batch.Product?.Code ?? "Unknown",
                    WarehouseName = string.Empty,
                    LocationName = null,
                    Quantity = batch.CurrentQuantity,
                    LotNumber = batch.LotNumber,
                    ExpiryDate = batch.ExpiryDate.Value,
                    DaysUntilExpiry = daysUntilExpiry
                });
            }
        }

        // Order by days until expiry
        result = result.OrderBy(r => r.DaysUntilExpiry).ToList();

        return Result<List<ExpiringStockDto>>.Success(result);
    }
}
