using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Commands;

/// <summary>
/// Command to update a performance goal
/// </summary>
public record UpdatePerformanceGoalCommand : IRequest<Result<PerformanceGoalDto>>
{
    public int GoalId { get; init; }
    public UpdatePerformanceGoalDto GoalData { get; init; } = null!;
}

/// <summary>
/// Validator for UpdatePerformanceGoalCommand
/// </summary>
public class UpdatePerformanceGoalCommandValidator : AbstractValidator<UpdatePerformanceGoalCommand>
{
    public UpdatePerformanceGoalCommandValidator()
    {
        RuleFor(x => x.GoalId)
            .GreaterThan(0).WithMessage("Goal ID is required");

        RuleFor(x => x.GoalData)
            .NotNull().WithMessage("Goal data is required");

        When(x => x.GoalData != null, () =>
        {
            RuleFor(x => x.GoalData.Title)
                .NotEmpty().WithMessage("Goal title is required")
                .MaximumLength(200).WithMessage("Goal title must not exceed 200 characters");

            RuleFor(x => x.GoalData.TargetDate)
                .NotEmpty().WithMessage("Target date is required");

            RuleFor(x => x.GoalData.Weight)
                .GreaterThan(0).WithMessage("Weight must be greater than 0")
                .LessThanOrEqualTo(10).WithMessage("Weight must not exceed 10");

            RuleFor(x => x.GoalData.Category)
                .MaximumLength(100).WithMessage("Category must not exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.GoalData.Category));
        });
    }
}

/// <summary>
/// Handler for UpdatePerformanceGoalCommand
/// </summary>
public class UpdatePerformanceGoalCommandHandler : IRequestHandler<UpdatePerformanceGoalCommand, Result<PerformanceGoalDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdatePerformanceGoalCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PerformanceGoalDto>> Handle(UpdatePerformanceGoalCommand request, CancellationToken cancellationToken)
    {
        // Get the goal
        var goal = await _unitOfWork.PerformanceGoals.GetByIdAsync(request.GoalId, cancellationToken);
        if (goal == null)
        {
            return Result<PerformanceGoalDto>.Failure(
                Error.NotFound("PerformanceGoal", $"Performance goal with ID {request.GoalId} not found"));
        }

        // Check if goal can be updated
        if (goal.Status == GoalStatus.Completed)
        {
            return Result<PerformanceGoalDto>.Failure(
                Error.Validation("PerformanceGoal.Status", "Cannot update a completed goal"));
        }

        if (goal.Status == GoalStatus.Cancelled)
        {
            return Result<PerformanceGoalDto>.Failure(
                Error.Validation("PerformanceGoal.Status", "Cannot update a cancelled goal"));
        }

        var data = request.GoalData;

        // Update the goal
        goal.Update(
            data.Title,
            data.Description,
            data.TargetDate,
            data.Weight,
            data.Category,
            data.Metrics);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get employee info
        var employee = await _unitOfWork.Employees.GetByIdAsync(goal.EmployeeId, cancellationToken);

        // Get assigned by info if available
        string? assignedByName = null;
        if (goal.AssignedById.HasValue)
        {
            var assignedBy = await _unitOfWork.Employees.GetByIdAsync(goal.AssignedById.Value, cancellationToken);
            if (assignedBy != null)
            {
                assignedByName = $"{assignedBy.FirstName} {assignedBy.LastName}";
            }
        }

        // Map to DTO
        var goalDto = new PerformanceGoalDto
        {
            Id = goal.Id,
            EmployeeId = goal.EmployeeId,
            EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : string.Empty,
            Title = goal.Title,
            Description = goal.Description,
            Category = goal.Category,
            StartDate = goal.StartDate,
            TargetDate = goal.DueDate,
            CompletedDate = goal.CompletedDate,
            Weight = goal.Weight,
            ProgressPercentage = goal.Progress ?? 0,
            Status = goal.Status.ToString(),
            Metrics = goal.Metrics,
            TargetValue = data.TargetValue,
            PerformanceReviewId = goal.PerformanceReviewId,
            AssignedById = goal.AssignedById,
            AssignedByName = assignedByName,
            Notes = goal.Notes,
            CreatedAt = goal.CreatedDate
        };

        return Result<PerformanceGoalDto>.Success(goalDto);
    }
}
