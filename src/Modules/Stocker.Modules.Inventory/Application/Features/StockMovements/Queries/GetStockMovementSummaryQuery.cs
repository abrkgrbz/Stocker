using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockMovements.Queries;

/// <summary>
/// Query to get stock movement summary for a period
/// </summary>
public class GetStockMovementSummaryQuery : IRequest<Result<StockMovementSummaryDto>>
{
    public Guid TenantId { get; set; }
    public int? WarehouseId { get; set; }
    public int? ProductId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// Handler for GetStockMovementSummaryQuery
/// </summary>
public class GetStockMovementSummaryQueryHandler : IRequestHandler<GetStockMovementSummaryQuery, Result<StockMovementSummaryDto>>
{
    private readonly IStockMovementRepository _stockMovementRepository;

    public GetStockMovementSummaryQueryHandler(IStockMovementRepository stockMovementRepository)
    {
        _stockMovementRepository = stockMovementRepository;
    }

    public async Task<Result<StockMovementSummaryDto>> Handle(GetStockMovementSummaryQuery request, CancellationToken cancellationToken)
    {
        var fromDate = request.FromDate ?? DateTime.UtcNow.AddMonths(-1);
        var toDate = request.ToDate ?? DateTime.UtcNow;

        // Get movements by date range
        var movements = await _stockMovementRepository.GetByDateRangeAsync(fromDate, toDate, cancellationToken);

        // Filter by warehouse if specified
        if (request.WarehouseId.HasValue)
        {
            movements = movements.Where(m => m.WarehouseId == request.WarehouseId.Value).ToList();
        }

        // Filter by product if specified
        if (request.ProductId.HasValue)
        {
            movements = movements.Where(m => m.ProductId == request.ProductId.Value).ToList();
        }

        var totalInbound = movements
            .Where(m => m.MovementType == StockMovementType.Purchase ||
                        m.MovementType == StockMovementType.Production ||
                        m.MovementType == StockMovementType.SalesReturn ||
                        m.MovementType == StockMovementType.Found)
            .Sum(m => m.Quantity);

        var totalOutbound = movements
            .Where(m => m.MovementType == StockMovementType.Sales ||
                        m.MovementType == StockMovementType.Consumption ||
                        m.MovementType == StockMovementType.PurchaseReturn ||
                        m.MovementType == StockMovementType.Damage ||
                        m.MovementType == StockMovementType.Loss)
            .Sum(m => m.Quantity);

        var totalAdjustments = movements
            .Where(m => m.MovementType == StockMovementType.AdjustmentIncrease ||
                        m.MovementType == StockMovementType.AdjustmentDecrease ||
                        m.MovementType == StockMovementType.Opening ||
                        m.MovementType == StockMovementType.Counting)
            .Sum(m => m.MovementType == StockMovementType.AdjustmentDecrease ? -m.Quantity : m.Quantity);

        var totalTransfers = movements
            .Where(m => m.MovementType == StockMovementType.Transfer)
            .Sum(m => m.Quantity);

        var summary = new StockMovementSummaryDto
        {
            TotalMovements = movements.Count(),
            TotalInbound = totalInbound,
            TotalOutbound = totalOutbound,
            TotalAdjustments = totalAdjustments,
            TotalTransfers = totalTransfers,
            NetChange = totalInbound - totalOutbound + totalAdjustments,
            PeriodStart = fromDate,
            PeriodEnd = toDate
        };

        return Result<StockMovementSummaryDto>.Success(summary);
    }
}
