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

        // If no items exist, add demo items from active products
        if (!cycleCount.Items.Any())
        {
            var activeProducts = await _unitOfWork.Products.GetActiveProductsAsync(cancellationToken);

            foreach (var product in activeProducts.Take(10))
            {
                cycleCount.AddItem(product.Id, null, 0, product.UnitPrice?.Amount);
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
            CountNotes = cc.CountNotes
        };
    }
}
