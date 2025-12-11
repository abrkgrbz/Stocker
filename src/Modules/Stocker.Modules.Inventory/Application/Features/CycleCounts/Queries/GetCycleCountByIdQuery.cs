using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.CycleCounts.Queries;

/// <summary>
/// Query to get a cycle count by ID
/// </summary>
public class GetCycleCountByIdQuery : IRequest<Result<CycleCountDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetCycleCountByIdQuery
/// </summary>
public class GetCycleCountByIdQueryHandler : IRequestHandler<GetCycleCountByIdQuery, Result<CycleCountDto>>
{
    private readonly ICycleCountRepository _repository;

    public GetCycleCountByIdQueryHandler(ICycleCountRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<CycleCountDto>> Handle(GetCycleCountByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<CycleCountDto>.Failure(new Error("CycleCount.NotFound", $"Cycle count with ID {request.Id} not found", ErrorType.NotFound));
        }

        var dto = new CycleCountDto
        {
            Id = entity.Id,
            PlanNumber = entity.PlanNumber,
            PlanName = entity.PlanName,
            Description = entity.Description,
            CountType = entity.CountType.ToString(),
            Status = entity.Status.ToString(),
            ScheduledStartDate = entity.ScheduledStartDate,
            ScheduledEndDate = entity.ScheduledEndDate,
            ActualStartDate = entity.ActualStartDate,
            ActualEndDate = entity.ActualEndDate,
            Frequency = entity.Frequency?.ToString(),
            NextScheduledDate = entity.NextScheduledDate,
            WarehouseId = entity.WarehouseId,
            WarehouseName = entity.Warehouse?.Name,
            ZoneId = entity.ZoneId,
            ZoneName = entity.Zone?.Name,
            CategoryId = entity.CategoryId,
            CategoryName = entity.Category?.Name,
            AbcClassFilter = entity.AbcClassFilter?.ToString(),
            OnlyNegativeStocks = entity.OnlyNegativeStocks,
            OnlyZeroStocks = entity.OnlyZeroStocks,
            DaysSinceLastMovement = entity.DaysSinceLastMovement,
            TotalItems = entity.TotalItems,
            CountedItems = entity.CountedItems,
            ItemsWithVariance = entity.ItemsWithVariance,
            ProgressPercent = entity.ProgressPercent,
            AccuracyPercent = entity.AccuracyPercent,
            QuantityTolerancePercent = entity.QuantityTolerancePercent,
            ValueTolerance = entity.ValueTolerance,
            BlockAutoApproveOnToleranceExceeded = entity.BlockAutoApproveOnToleranceExceeded,
            AssignedTo = entity.AssignedTo,
            AssignedUserId = entity.AssignedUserId,
            ApprovedBy = entity.ApprovedBy,
            ApprovedDate = entity.ApprovedDate,
            PlanningNotes = entity.PlanningNotes,
            CountNotes = entity.CountNotes,
            Items = entity.Items?.Select(i => new CycleCountItemDto
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
            }).ToList() ?? new List<CycleCountItemDto>(),
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<CycleCountDto>.Success(dto);
    }
}
