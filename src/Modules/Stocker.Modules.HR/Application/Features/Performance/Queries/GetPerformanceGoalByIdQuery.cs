using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Queries;

/// <summary>
/// Query to get a single performance goal by ID
/// </summary>
public class GetPerformanceGoalByIdQuery : IRequest<Result<PerformanceGoalDto>>
{
    public Guid TenantId { get; set; }
    public int GoalId { get; set; }
}

/// <summary>
/// Validator for GetPerformanceGoalByIdQuery
/// </summary>
public class GetPerformanceGoalByIdQueryValidator : AbstractValidator<GetPerformanceGoalByIdQuery>
{
    public GetPerformanceGoalByIdQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.GoalId)
            .GreaterThan(0).WithMessage("Goal ID is required");
    }
}

/// <summary>
/// Handler for GetPerformanceGoalByIdQuery
/// </summary>
public class GetPerformanceGoalByIdQueryHandler : IRequestHandler<GetPerformanceGoalByIdQuery, Result<PerformanceGoalDto>>
{
    private readonly IPerformanceGoalRepository _goalRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public GetPerformanceGoalByIdQueryHandler(
        IPerformanceGoalRepository goalRepository,
        IEmployeeRepository employeeRepository)
    {
        _goalRepository = goalRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<Result<PerformanceGoalDto>> Handle(GetPerformanceGoalByIdQuery request, CancellationToken cancellationToken)
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

        // Get employee info
        var employee = await _employeeRepository.GetByIdAsync(goal.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<PerformanceGoalDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {goal.EmployeeId} not found"));
        }

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
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
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
