using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.CycleCounts.Commands;

/// <summary>
/// Command to complete a cycle count
/// </summary>
public class CompleteCycleCountCommand : IRequest<Result<CycleCountDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

public class CompleteCycleCountCommandHandler : IRequestHandler<CompleteCycleCountCommand, Result<CycleCountDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CompleteCycleCountCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CycleCountDto>> Handle(CompleteCycleCountCommand request, CancellationToken cancellationToken)
    {
        var cycleCount = await _unitOfWork.CycleCounts.GetByIdWithItemsAsync(request.Id, cancellationToken);

        if (cycleCount == null || cycleCount.TenantId != request.TenantId)
        {
            return Result<CycleCountDto>.Failure(
                new Error("CycleCount.NotFound", "Dönemsel sayım bulunamadı", ErrorType.NotFound));
        }

        if (cycleCount.Status != CycleCountStatus.InProgress)
        {
            return Result<CycleCountDto>.Failure(
                new Error("CycleCount.InvalidStatus", "Sadece devam eden sayımlar tamamlanabilir", ErrorType.Validation));
        }

        try
        {
            // Mark all uncounted items as counted with system quantity (auto-complete)
            foreach (var item in cycleCount.Items.Where(i => !i.IsCounted))
            {
                cycleCount.RecordCount(item.Id, item.SystemQuantity, "Otomatik tamamlama");
            }

            cycleCount.Complete();
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = MapToDto(cycleCount);
            return Result<CycleCountDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<CycleCountDto>.Failure(
                new Error("CycleCount.CompleteFailed", ex.Message, ErrorType.Validation));
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
