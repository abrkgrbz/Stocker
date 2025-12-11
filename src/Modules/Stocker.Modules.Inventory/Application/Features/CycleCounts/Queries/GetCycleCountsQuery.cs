using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.CycleCounts.Queries;

/// <summary>
/// Query to get all cycle counts
/// </summary>
public class GetCycleCountsQuery : IRequest<Result<List<CycleCountDto>>>
{
    public Guid TenantId { get; set; }
    public int? WarehouseId { get; set; }
    public int? ZoneId { get; set; }
    public string? Status { get; set; }
    public string? CountType { get; set; }
}

/// <summary>
/// Handler for GetCycleCountsQuery
/// </summary>
public class GetCycleCountsQueryHandler : IRequestHandler<GetCycleCountsQuery, Result<List<CycleCountDto>>>
{
    private readonly ICycleCountRepository _repository;

    public GetCycleCountsQueryHandler(ICycleCountRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<CycleCountDto>>> Handle(GetCycleCountsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<CycleCount> entities;

        if (request.WarehouseId.HasValue)
        {
            entities = await _repository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(request.Status))
        {
            var status = Enum.Parse<CycleCountStatus>(request.Status);
            entities = await _repository.GetByStatusAsync(status, cancellationToken);
        }
        else
        {
            entities = await _repository.GetAllAsync(cancellationToken);
        }

        var dtos = entities.Select(e => new CycleCountDto
        {
            Id = e.Id,
            PlanNumber = e.PlanNumber,
            PlanName = e.PlanName,
            Description = e.Description,
            CountType = e.CountType.ToString(),
            Status = e.Status.ToString(),
            ScheduledStartDate = e.ScheduledStartDate,
            ScheduledEndDate = e.ScheduledEndDate,
            ActualStartDate = e.ActualStartDate,
            ActualEndDate = e.ActualEndDate,
            Frequency = e.Frequency?.ToString(),
            NextScheduledDate = e.NextScheduledDate,
            WarehouseId = e.WarehouseId,
            WarehouseName = e.Warehouse?.Name,
            ZoneId = e.ZoneId,
            ZoneName = e.Zone?.Name,
            CategoryId = e.CategoryId,
            CategoryName = e.Category?.Name,
            AbcClassFilter = e.AbcClassFilter?.ToString(),
            OnlyNegativeStocks = e.OnlyNegativeStocks,
            OnlyZeroStocks = e.OnlyZeroStocks,
            DaysSinceLastMovement = e.DaysSinceLastMovement,
            TotalItems = e.TotalItems,
            CountedItems = e.CountedItems,
            ItemsWithVariance = e.ItemsWithVariance,
            ProgressPercent = e.ProgressPercent,
            AccuracyPercent = e.AccuracyPercent,
            QuantityTolerancePercent = e.QuantityTolerancePercent,
            ValueTolerance = e.ValueTolerance,
            BlockAutoApproveOnToleranceExceeded = e.BlockAutoApproveOnToleranceExceeded,
            AssignedTo = e.AssignedTo,
            AssignedUserId = e.AssignedUserId,
            ApprovedBy = e.ApprovedBy,
            ApprovedDate = e.ApprovedDate,
            PlanningNotes = e.PlanningNotes,
            CountNotes = e.CountNotes,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();

        return Result<List<CycleCountDto>>.Success(dtos);
    }
}
