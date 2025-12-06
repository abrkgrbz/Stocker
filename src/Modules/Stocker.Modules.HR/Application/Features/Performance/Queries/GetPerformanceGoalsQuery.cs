using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Queries;

/// <summary>
/// Query to get performance goals with filters
/// </summary>
public class GetPerformanceGoalsQuery : IRequest<Result<List<PerformanceGoalDto>>>
{
    public Guid TenantId { get; set; }
    public int? EmployeeId { get; set; }
    public int? ReviewId { get; set; }
    public GoalStatus? Status { get; set; }
    public string? Category { get; set; }
    public bool? ActiveOnly { get; set; }
    public bool? OverdueOnly { get; set; }
}

/// <summary>
/// Validator for GetPerformanceGoalsQuery
/// </summary>
public class GetPerformanceGoalsQueryValidator : AbstractValidator<GetPerformanceGoalsQuery>
{
    public GetPerformanceGoalsQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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
    private readonly IPerformanceGoalRepository _goalRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public GetPerformanceGoalsQueryHandler(
        IPerformanceGoalRepository goalRepository,
        IEmployeeRepository employeeRepository)
    {
        _goalRepository = goalRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<Result<List<PerformanceGoalDto>>> Handle(GetPerformanceGoalsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<PerformanceGoal> goals;

        // Apply filters based on query parameters
        if (request.OverdueOnly == true)
        {
            goals = await _goalRepository.GetOverdueAsync(cancellationToken);
        }
        else if (request.EmployeeId.HasValue && request.ActiveOnly == true)
        {
            goals = await _goalRepository.GetActiveByEmployeeAsync(request.EmployeeId.Value, cancellationToken);
        }
        else if (request.EmployeeId.HasValue)
        {
            goals = await _goalRepository.GetByEmployeeAsync(request.EmployeeId.Value, cancellationToken);
        }
        else if (request.ReviewId.HasValue)
        {
            goals = await _goalRepository.GetByPerformanceReviewAsync(request.ReviewId.Value, cancellationToken);
        }
        else
        {
            goals = await _goalRepository.GetAllAsync(cancellationToken);
        }

        // Filter by tenant
        goals = goals.Where(g => g.TenantId == request.TenantId).ToList();

        // Apply additional filters
        if (request.Status.HasValue)
        {
            goals = goals.Where(g => g.Status == request.Status.Value).ToList();
        }

        if (!string.IsNullOrEmpty(request.Category))
        {
            goals = goals.Where(g => g.Category != null &&
                                    g.Category.Equals(request.Category, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        // Get employee and assigned by information
        var employeeIds = goals.Select(g => g.EmployeeId).Distinct().ToList();
        var assignedByIds = goals.Where(g => g.AssignedById.HasValue)
            .Select(g => g.AssignedById!.Value).Distinct().ToList();
        var allEmployeeIds = employeeIds.Union(assignedByIds).Distinct().ToList();

        var employees = new Dictionary<int, Employee>();
        foreach (var empId in allEmployeeIds)
        {
            var emp = await _employeeRepository.GetByIdAsync(empId, cancellationToken);
            if (emp != null)
            {
                employees[empId] = emp;
            }
        }

        // Map to DTOs
        var goalDtos = goals.Select(goal => new PerformanceGoalDto
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
