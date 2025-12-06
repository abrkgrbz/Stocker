using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Commands;

/// <summary>
/// Command to create a performance goal for an employee
/// </summary>
public class CreatePerformanceGoalCommand : IRequest<Result<PerformanceGoalDto>>
{
    public Guid TenantId { get; set; }
    public CreatePerformanceGoalDto GoalData { get; set; } = null!;
    public int? AssignedById { get; set; }
}

/// <summary>
/// Validator for CreatePerformanceGoalCommand
/// </summary>
public class CreatePerformanceGoalCommandValidator : AbstractValidator<CreatePerformanceGoalCommand>
{
    public CreatePerformanceGoalCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.GoalData)
            .NotNull().WithMessage("Goal data is required");

        When(x => x.GoalData != null, () =>
        {
            RuleFor(x => x.GoalData.EmployeeId)
                .GreaterThan(0).WithMessage("Employee ID is required");

            RuleFor(x => x.GoalData.Title)
                .NotEmpty().WithMessage("Goal title is required")
                .MaximumLength(200).WithMessage("Goal title must not exceed 200 characters");

            RuleFor(x => x.GoalData.StartDate)
                .NotEmpty().WithMessage("Start date is required");

            RuleFor(x => x.GoalData.TargetDate)
                .NotEmpty().WithMessage("Target date is required")
                .GreaterThan(x => x.GoalData.StartDate)
                .WithMessage("Target date must be after start date");

            RuleFor(x => x.GoalData.Weight)
                .GreaterThan(0).WithMessage("Weight must be greater than 0")
                .LessThanOrEqualTo(10).WithMessage("Weight must not exceed 10");

            RuleFor(x => x.GoalData.Category)
                .MaximumLength(100).WithMessage("Category must not exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.GoalData.Category));

            RuleFor(x => x.GoalData.PerformanceReviewId)
                .GreaterThan(0).WithMessage("Invalid performance review ID")
                .When(x => x.GoalData.PerformanceReviewId.HasValue);
        });
    }
}

/// <summary>
/// Handler for CreatePerformanceGoalCommand
/// </summary>
public class CreatePerformanceGoalCommandHandler : IRequestHandler<CreatePerformanceGoalCommand, Result<PerformanceGoalDto>>
{
    private readonly IPerformanceGoalRepository _goalRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IPerformanceReviewRepository _reviewRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePerformanceGoalCommandHandler(
        IPerformanceGoalRepository goalRepository,
        IEmployeeRepository employeeRepository,
        IPerformanceReviewRepository reviewRepository,
        IUnitOfWork unitOfWork)
    {
        _goalRepository = goalRepository;
        _employeeRepository = employeeRepository;
        _reviewRepository = reviewRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PerformanceGoalDto>> Handle(CreatePerformanceGoalCommand request, CancellationToken cancellationToken)
    {
        var data = request.GoalData;

        // Validate employee
        var employee = await _employeeRepository.GetByIdAsync(data.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<PerformanceGoalDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {data.EmployeeId} not found"));
        }

        // Validate performance review if specified
        if (data.PerformanceReviewId.HasValue)
        {
            var review = await _reviewRepository.GetByIdAsync(data.PerformanceReviewId.Value, cancellationToken);
            if (review == null)
            {
                return Result<PerformanceGoalDto>.Failure(
                    Error.NotFound("PerformanceReview", $"Performance review with ID {data.PerformanceReviewId} not found"));
            }

            if (review.EmployeeId != data.EmployeeId)
            {
                return Result<PerformanceGoalDto>.Failure(
                    Error.Validation("PerformanceGoal.Review", "Performance review does not belong to the specified employee"));
            }
        }

        // Validate assigned by if specified
        string? assignedByName = null;
        if (request.AssignedById.HasValue)
        {
            var assignedBy = await _employeeRepository.GetByIdAsync(request.AssignedById.Value, cancellationToken);
            if (assignedBy == null)
            {
                return Result<PerformanceGoalDto>.Failure(
                    Error.NotFound("AssignedBy", $"Employee with ID {request.AssignedById} not found"));
            }
            assignedByName = $"{assignedBy.FirstName} {assignedBy.LastName}";
        }

        // Create the goal
        var goal = new PerformanceGoal(
            data.EmployeeId,
            data.Title,
            data.StartDate,
            data.TargetDate,
            data.Weight,
            data.Description,
            data.Category,
            data.PerformanceReviewId);

        // Set tenant ID
        goal.SetTenantId(request.TenantId);

        // Set metrics if provided
        if (!string.IsNullOrEmpty(data.Metrics))
        {
            goal.SetNotes(data.Metrics);
        }

        // Set assigned by if specified
        if (request.AssignedById.HasValue)
        {
            goal.SetAssignedBy(request.AssignedById.Value);
        }

        // Save to repository
        await _goalRepository.AddAsync(goal, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
            Weight = goal.Weight,
            ProgressPercentage = goal.Progress ?? 0,
            Status = goal.Status.ToString(),
            Metrics = data.Metrics,
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
