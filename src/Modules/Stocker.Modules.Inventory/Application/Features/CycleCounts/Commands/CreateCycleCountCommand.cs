using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.CycleCounts.Commands;

/// <summary>
/// Command to create a new cycle count
/// </summary>
public class CreateCycleCountCommand : IRequest<Result<CycleCountDto>>
{
    public Guid TenantId { get; set; }
    public CreateCycleCountDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateCycleCountCommand
/// </summary>
public class CreateCycleCountCommandValidator : AbstractValidator<CreateCycleCountCommand>
{
    public CreateCycleCountCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.PlanName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Data.WarehouseId).GreaterThan(0);
        RuleFor(x => x.Data.CountType).NotEmpty();
        RuleFor(x => x.Data.ScheduledStartDate).NotEmpty();
        RuleFor(x => x.Data.ScheduledEndDate).GreaterThan(x => x.Data.ScheduledStartDate);
        RuleFor(x => x.Data.Description).MaximumLength(500);
    }
}

/// <summary>
/// Handler for CreateCycleCountCommand
/// </summary>
public class CreateCycleCountCommandHandler : IRequestHandler<CreateCycleCountCommand, Result<CycleCountDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateCycleCountCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CycleCountDto>> Handle(CreateCycleCountCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // Generate plan number
        var planNumber = $"CC-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

        // Check if plan number already exists
        var existingPlan = await _unitOfWork.CycleCounts.GetByPlanNumberAsync(planNumber, cancellationToken);
        if (existingPlan != null)
        {
            return Result<CycleCountDto>.Failure(new Error("CycleCount.DuplicateNumber", $"Cycle count with plan number '{planNumber}' already exists", ErrorType.Conflict));
        }

        var countType = Enum.Parse<CycleCountType>(data.CountType);
        var entity = new CycleCount(planNumber, data.PlanName, data.WarehouseId, data.ScheduledStartDate, data.ScheduledEndDate, countType);

        entity.SetDescription(data.Description);
        entity.SetZone(data.ZoneId);
        entity.SetCategory(data.CategoryId);

        if (!string.IsNullOrEmpty(data.AbcClassFilter))
        {
            var abcClass = Enum.Parse<Domain.Entities.AbcClass>(data.AbcClassFilter);
            entity.SetAbcClassFilter(abcClass);
        }

        if (!string.IsNullOrEmpty(data.Frequency))
        {
            var frequency = Enum.Parse<RecurrenceFrequency>(data.Frequency);
            entity.SetFrequency(frequency);
        }

        entity.SetTolerance(data.QuantityTolerancePercent, data.ValueTolerance);
        entity.SetOnlyNegativeStocks(data.OnlyNegativeStocks);
        entity.SetOnlyZeroStocks(data.OnlyZeroStocks);
        entity.SetDaysSinceLastMovement(data.DaysSinceLastMovement);
        entity.SetPlanningNotes(data.PlanningNotes);

        if (!string.IsNullOrEmpty(data.AssignedTo) || data.AssignedUserId.HasValue)
        {
            entity.AssignTo(data.AssignedTo ?? "", data.AssignedUserId);
        }

        entity.SetTenantId(request.TenantId);
        await _unitOfWork.CycleCounts.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
            Frequency = entity.Frequency?.ToString(),
            NextScheduledDate = entity.NextScheduledDate,
            WarehouseId = entity.WarehouseId,
            ZoneId = entity.ZoneId,
            CategoryId = entity.CategoryId,
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
            AssignedTo = entity.AssignedTo,
            AssignedUserId = entity.AssignedUserId,
            PlanningNotes = entity.PlanningNotes,
            CreatedAt = entity.CreatedDate
        };

        return Result<CycleCountDto>.Success(dto);
    }
}
