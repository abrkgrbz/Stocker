using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.CycleCounts.Commands;

/// <summary>
/// Command to update an existing cycle count
/// </summary>
public class UpdateCycleCountCommand : IRequest<Result<CycleCountDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateCycleCountDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateCycleCountCommand
/// </summary>
public class UpdateCycleCountCommandValidator : AbstractValidator<UpdateCycleCountCommand>
{
    public UpdateCycleCountCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.PlanName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Data.Description).MaximumLength(500);
    }
}

/// <summary>
/// Handler for UpdateCycleCountCommand
/// </summary>
public class UpdateCycleCountCommandHandler : IRequestHandler<UpdateCycleCountCommand, Result<CycleCountDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateCycleCountCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CycleCountDto>> Handle(UpdateCycleCountCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.CycleCounts.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<CycleCountDto>.Failure(new Error("CycleCount.NotFound", $"Cycle count with ID {request.Id} not found", ErrorType.NotFound));
        }

        var data = request.Data;

        entity.SetDescription(data.Description);
        entity.SetZone(data.ZoneId);
        entity.SetCategory(data.CategoryId);

        if (!string.IsNullOrEmpty(data.AbcClassFilter))
        {
            var abcClass = Enum.Parse<Domain.Entities.AbcClass>(data.AbcClassFilter);
            entity.SetAbcClassFilter(abcClass);
        }
        else
        {
            entity.SetAbcClassFilter(null);
        }

        if (!string.IsNullOrEmpty(data.Frequency))
        {
            var frequency = Enum.Parse<RecurrenceFrequency>(data.Frequency);
            entity.SetFrequency(frequency);
        }
        else
        {
            entity.SetFrequency(null);
        }

        if (data.QuantityTolerancePercent.HasValue)
            entity.SetTolerance(data.QuantityTolerancePercent.Value, data.ValueTolerance);
        if (data.OnlyNegativeStocks.HasValue)
            entity.SetOnlyNegativeStocks(data.OnlyNegativeStocks.Value);
        if (data.OnlyZeroStocks.HasValue)
            entity.SetOnlyZeroStocks(data.OnlyZeroStocks.Value);
        entity.SetDaysSinceLastMovement(data.DaysSinceLastMovement);
        entity.SetPlanningNotes(data.PlanningNotes);
        entity.SetCountNotes(data.CountNotes);

        if (!string.IsNullOrEmpty(data.AssignedTo) || data.AssignedUserId.HasValue)
        {
            entity.AssignTo(data.AssignedTo ?? "", data.AssignedUserId);
        }

        await _unitOfWork.CycleCounts.UpdateAsync(entity, cancellationToken);
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
            ActualStartDate = entity.ActualStartDate,
            ActualEndDate = entity.ActualEndDate,
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
            ApprovedBy = entity.ApprovedBy,
            ApprovedDate = entity.ApprovedDate,
            PlanningNotes = entity.PlanningNotes,
            CountNotes = entity.CountNotes,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<CycleCountDto>.Success(dto);
    }
}
