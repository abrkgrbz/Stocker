using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.CycleCounts.Commands;

/// <summary>
/// Command to start a cycle count
/// </summary>
public class StartCycleCountCommand : IRequest<Result<CycleCountDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

public class StartCycleCountCommandHandler : IRequestHandler<StartCycleCountCommand, Result<CycleCountDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public StartCycleCountCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CycleCountDto>> Handle(StartCycleCountCommand request, CancellationToken cancellationToken)
    {
        var cycleCount = await _unitOfWork.CycleCounts.GetByIdWithItemsAsync(request.Id, cancellationToken);

        if (cycleCount == null || cycleCount.TenantId != request.TenantId)
        {
            return Result<CycleCountDto>.Failure(
                new Error("CycleCount.NotFound", "Dönemsel sayım bulunamadı", ErrorType.NotFound));
        }

        if (cycleCount.Status != CycleCountStatus.Planned)
        {
            return Result<CycleCountDto>.Failure(
                new Error("CycleCount.InvalidStatus", "Sadece planlanmış sayımlar başlatılabilir", ErrorType.Validation));
        }

        // If no items exist, populate from warehouse stocks
        if (!cycleCount.Items.Any())
        {
            var stocks = await _unitOfWork.Stocks.GetByWarehouseAsync(cycleCount.WarehouseId, cancellationToken);

            if (stocks.Any())
            {
                foreach (var stock in stocks)
                {
                    cycleCount.AddItem(
                        stock.ProductId,
                        stock.LocationId,
                        stock.Quantity,
                        stock.Product?.CostPrice?.Amount);
                }
            }
            else
            {
                // Fallback: use active products with 0 quantity if no stocks exist
                var activeProducts = await _unitOfWork.Products.GetActiveProductsAsync(cancellationToken);

                if (!activeProducts.Any())
                {
                    return Result<CycleCountDto>.Failure(
                        new Error("CycleCount.NoItems", "Bu depoda sayım yapılacak ürün bulunamadı. Lütfen önce ürün ekleyin.", ErrorType.Validation));
                }

                foreach (var product in activeProducts)
                {
                    cycleCount.AddItem(product.Id, null, 0, product.CostPrice?.Amount);
                }
            }
        }

        try
        {
            cycleCount.Start();
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = MapToDto(cycleCount);
            return Result<CycleCountDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<CycleCountDto>.Failure(
                new Error("CycleCount.StartFailed", ex.Message, ErrorType.Validation));
        }
    }

    private static CycleCountDto MapToDto(CycleCount cc)
    {
        return new CycleCountDto
        {
            Id = cc.Id,
            PlanNumber = cc.PlanNumber,
            PlanName = cc.PlanName,
            Description = cc.Description,
            CountType = cc.CountType.ToString(),
            Status = cc.Status.ToString(),
            ScheduledStartDate = cc.ScheduledStartDate,
            ScheduledEndDate = cc.ScheduledEndDate,
            ActualStartDate = cc.ActualStartDate,
            ActualEndDate = cc.ActualEndDate,
            WarehouseId = cc.WarehouseId,
            ZoneId = cc.ZoneId,
            CategoryId = cc.CategoryId,
            TotalItems = cc.TotalItems,
            CountedItems = cc.CountedItems,
            ItemsWithVariance = cc.ItemsWithVariance,
            ProgressPercent = cc.ProgressPercent,
            AccuracyPercent = cc.AccuracyPercent,
            AssignedTo = cc.AssignedTo,
            ApprovedBy = cc.ApprovedBy,
            ApprovedDate = cc.ApprovedDate,
            PlanningNotes = cc.PlanningNotes,
            CountNotes = cc.CountNotes,
            Items = cc.Items?.Select(i => new CycleCountItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name,
                LocationId = i.LocationId,
                LocationName = i.Location?.Name,
                LotNumber = i.LotNumber,
                SystemQuantity = i.SystemQuantity,
                CountedQuantity = i.CountedQuantity,
                VarianceQuantity = i.VarianceQuantity,
                VariancePercent = i.VariancePercent,
                IsCounted = i.IsCounted,
                HasVariance = i.HasVariance,
                UnitCost = i.UnitCost,
                VarianceValue = i.VarianceValue,
                CountedDate = i.CountedDate,
                CountedBy = i.CountedBy,
                Notes = i.Notes,
                CountAttempts = i.CountAttempts
            }).ToList() ?? new List<CycleCountItemDto>()
        };
    }
}
