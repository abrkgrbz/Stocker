using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Commands;

/// <summary>
/// Command to update goal progress
/// </summary>
public class UpdateGoalProgressCommand : IRequest<Result<PerformanceGoalDto>>
{
    public Guid TenantId { get; set; }
    public int GoalId { get; set; }
    public decimal Progress { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Validator for UpdateGoalProgressCommand
/// </summary>
public class UpdateGoalProgressCommandValidator : AbstractValidator<UpdateGoalProgressCommand>
{
    public UpdateGoalProgressCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.GoalId)
            .GreaterThan(0).WithMessage("Goal ID is required");

        RuleFor(x => x.Progress)
            .GreaterThanOrEqualTo(0).WithMessage("Progress must be at least 0")
            .LessThanOrEqualTo(100).WithMessage("Progress cannot exceed 100");
    }
}

/// <summary>
/// Handler for UpdateGoalProgressCommand
/// </summary>
public class UpdateGoalProgressCommandHandler : IRequestHandler<UpdateGoalProgressCommand, Result<PerformanceGoalDto>>
{
    private readonly IPerformanceGoalRepository _goalRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateGoalProgressCommandHandler(
        IPerformanceGoalRepository goalRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _goalRepository = goalRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PerformanceGoalDto>> Handle(UpdateGoalProgressCommand request, CancellationToken cancellationToken)
    {
        // Get the goal
        var goal = await _goalRepository.GetByIdAsync(request.GoalId, cancellationToken);
        if (goal == null)
        {
            return Result<PerformanceGoalDto>.Failure(
                Error.NotFound("PerformanceGoal", $"Performance goal with ID {request.GoalId} not found"));
        }

        // Verify tenant
        if (goal.TenantId != request.TenantId)
        {
            return Result<PerformanceGoalDto>.Failure(
                Error.Forbidden("PerformanceGoal.Tenant", "Access denied to this performance goal"));
        }

        // Check if goal can be updated
        if (goal.Status == GoalStatus.Cancelled)
        {
            return Result<PerformanceGoalDto>.Failure(
                Error.Validation("PerformanceGoal.Status", "Cannot update progress of a cancelled goal"));
        }

        if (goal.Status == GoalStatus.Completed)
        {
            return Result<PerformanceGoalDto>.Failure(
                Error.Validation("PerformanceGoal.Status", "Goal is already completed"));
        }

        // Update progress (this automatically updates status based on progress)
        try
        {
            goal.UpdateProgress(request.Progress);
        }
        catch (ArgumentException ex)
        {
            return Result<PerformanceGoalDto>.Failure(
                Error.Validation("PerformanceGoal.Progress", ex.Message));
        }

        // Update notes if provided
        if (!string.IsNullOrEmpty(request.Notes))
        {
            var currentNotes = goal.Notes ?? string.Empty;
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
            var progressNote = $"[{timestamp}] Progress: {request.Progress}% - {request.Notes}";

            goal.SetNotes(string.IsNullOrEmpty(currentNotes)
                ? progressNote
                : $"{currentNotes}\n{progressNote}");
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get employee info
        var employee = await _employeeRepository.GetByIdAsync(goal.EmployeeId, cancellationToken);

        // Get assigned by info if available
        string? assignedByName = null;
        if (goal.AssignedById.HasValue)
        {
            var assignedBy = await _employeeRepository.GetByIdAsync(goal.AssignedById.Value, cancellationToken);
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
            PerformanceReviewId = goal.PerformanceReviewId,
            AssignedById = goal.AssignedById,
            AssignedByName = assignedByName,
            Notes = goal.Notes,
            CreatedAt = goal.CreatedDate
        };

        return Result<PerformanceGoalDto>.Success(goalDto);
    }
}
