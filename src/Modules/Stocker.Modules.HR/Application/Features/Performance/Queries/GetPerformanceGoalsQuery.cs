using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Queries;

/// <summary>
/// Query to get performance goals with filters
/// </summary>
public record GetPerformanceGoalsQuery : IRequest<Result<List<PerformanceGoalDto>>>
{
    public int? EmployeeId { get; init; }
    public int? ReviewId { get; init; }
    public GoalStatus? Status { get; init; }
    public string? Category { get; init; }
    public bool? ActiveOnly { get; init; }
    public bool? OverdueOnly { get; init; }
}

/// <summary>
/// Validator for GetPerformanceGoalsQuery
/// </summary>
public class GetPerformanceGoalsQueryValidator : AbstractValidator<GetPerformanceGoalsQuery>
{
    public GetPerformanceGoalsQueryValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Invalid employee ID")
            .When(x => x.EmployeeId.HasValue);

        RuleFor(x => x.ReviewId)
            .GreaterThan(0).WithMessage("Invalid performance review ID")
            .When(x => x.ReviewId.HasValue);
    }
}

/// <summary>
/// Handler for GetPerformanceGoalsQuery
/// </summary>
public class GetPerformanceGoalsQueryHandler : IRequestHandler<GetPerformanceGoalsQuery, Result<List<PerformanceGoalDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetPerformanceGoalsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PerformanceGoalDto>>> Handle(GetPerformanceGoalsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<PerformanceGoal> goals;

        // Apply filters based on query parameters
        if (request.OverdueOnly == true)
        {
            goals = await _unitOfWork.PerformanceGoals.GetOverdueAsync(cancellationToken);
        }
        else if (request.EmployeeId.HasValue && request.ActiveOnly == true)
        {
            goals = await _unitOfWork.PerformanceGoals.GetActiveByEmployeeAsync(request.EmployeeId.Value, cancellationToken);
        }
        else if (request.EmployeeId.HasValue)
        {
            goals = await _unitOfWork.PerformanceGoals.GetByEmployeeAsync(request.EmployeeId.Value, cancellationToken);
        }
        else if (request.ReviewId.HasValue)
        {
            goals = await _unitOfWork.PerformanceGoals.GetByPerformanceReviewAsync(request.ReviewId.Value, cancellationToken);
        }
        else
        {
            goals = await _unitOfWork.PerformanceGoals.GetAllAsync(cancellationToken);
        }

        // Apply additional filters
        var filteredGoals = goals.AsEnumerable();

        if (request.Status.HasValue)
        {
            filteredGoals = filteredGoals.Where(g => g.Status == request.Status.Value);
        }

        if (!string.IsNullOrEmpty(request.Category))
        {
            filteredGoals = filteredGoals.Where(g => g.Category != null &&
                                    g.Category.Equals(request.Category, StringComparison.OrdinalIgnoreCase));
        }

        var goalsList = filteredGoals.ToList();

        // Get employee and assigned by information
        var employeeIds = goalsList.Select(g => g.EmployeeId).Distinct().ToList();
        var assignedByIds = goalsList.Where(g => g.AssignedById.HasValue)
            .Select(g => g.AssignedById!.Value).Distinct().ToList();
        var allEmployeeIds = employeeIds.Union(assignedByIds).Distinct().ToList();

        var employees = new Dictionary<int, Employee>();
        foreach (var empId in allEmployeeIds)
        {
            var emp = await _unitOfWork.Employees.GetByIdAsync(empId, cancellationToken);
            if (emp != null)
            {
                employees[empId] = emp;
            }
        }

        // Map to DTOs
        var goalDtos = goalsList.Select(goal => new PerformanceGoalDto
        {
            Id = goal.Id,
            EmployeeId = goal.EmployeeId,
            EmployeeName = employees.ContainsKey(goal.EmployeeId)
                ? $"{employees[goal.EmployeeId].FirstName} {employees[goal.EmployeeId].LastName}"
                : string.Empty,
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
            AssignedByName = goal.AssignedById.HasValue && employees.ContainsKey(goal.AssignedById.Value)
                ? $"{employees[goal.AssignedById.Value].FirstName} {employees[goal.AssignedById.Value].LastName}"
                : null,
            Notes = goal.Notes,
            CreatedAt = goal.CreatedDate
        }).ToList();

        return Result<List<PerformanceGoalDto>>.Success(goalDtos);
    }
}
