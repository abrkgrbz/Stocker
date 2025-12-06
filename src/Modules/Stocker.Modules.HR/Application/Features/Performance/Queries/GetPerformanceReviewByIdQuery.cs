using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Queries;

/// <summary>
/// Query to get a single performance review by ID
/// </summary>
public class GetPerformanceReviewByIdQuery : IRequest<Result<PerformanceReviewDto>>
{
    public Guid TenantId { get; set; }
    public int ReviewId { get; set; }
    public bool IncludeCriteria { get; set; } = true;
    public bool IncludeGoals { get; set; } = false;
}

/// <summary>
/// Validator for GetPerformanceReviewByIdQuery
/// </summary>
public class GetPerformanceReviewByIdQueryValidator : AbstractValidator<GetPerformanceReviewByIdQuery>
{
    public GetPerformanceReviewByIdQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.ReviewId)
            .GreaterThan(0).WithMessage("Review ID is required");
    }
}

/// <summary>
/// Handler for GetPerformanceReviewByIdQuery
/// </summary>
public class GetPerformanceReviewByIdQueryHandler : IRequestHandler<GetPerformanceReviewByIdQuery, Result<PerformanceReviewDto>>
{
    private readonly IPerformanceReviewRepository _reviewRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public GetPerformanceReviewByIdQueryHandler(
        IPerformanceReviewRepository reviewRepository,
        IEmployeeRepository employeeRepository)
    {
        _reviewRepository = reviewRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<Result<PerformanceReviewDto>> Handle(GetPerformanceReviewByIdQuery request, CancellationToken cancellationToken)
    {
        // Get review with relationships
        var review = request.IncludeGoals
            ? await _reviewRepository.GetWithGoalsAsync(request.ReviewId, cancellationToken)
            : request.IncludeCriteria
                ? await _reviewRepository.GetWithCriteriaAsync(request.ReviewId, cancellationToken)
                : await _reviewRepository.GetByIdAsync(request.ReviewId, cancellationToken);

        if (review == null)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.NotFound("PerformanceReview", $"Performance review with ID {request.ReviewId} not found"));
        }

        // Verify tenant
        if (review.TenantId != request.TenantId)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.Forbidden("PerformanceReview.Tenant", "Access denied to this performance review"));
        }

        // Get employee info
        var employee = await _employeeRepository.GetByIdAsync(review.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {review.EmployeeId} not found"));
        }

        // Get reviewer info
        var reviewer = await _employeeRepository.GetByIdAsync(review.ReviewerId, cancellationToken);
        if (reviewer == null)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.NotFound("Reviewer", $"Reviewer with ID {review.ReviewerId} not found"));
        }

        // Get approved by info if available
        string? approvedByName = null;
        if (review.ApprovedById.HasValue)
        {
            var approvedBy = await _employeeRepository.GetByIdAsync(review.ApprovedById.Value, cancellationToken);
            if (approvedBy != null)
            {
                approvedByName = $"{approvedBy.FirstName} {approvedBy.LastName}";
            }
        }

        // Map to DTO
        var reviewDto = new PerformanceReviewDto
        {
            Id = review.Id,
            EmployeeId = review.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            EmployeeCode = employee.EmployeeCode,
            DepartmentName = employee.Department?.Name,
            PositionTitle = employee.Position?.Title,
            ReviewerId = review.ReviewerId,
            ReviewerName = $"{reviewer.FirstName} {reviewer.LastName}",
            ReviewPeriod = $"{review.Year}" + (review.Quarter.HasValue ? $" Q{review.Quarter}" : ""),
            ReviewDate = review.ReviewDate ?? review.ReviewPeriodEnd,
            ReviewType = review.Title,
            OverallRating = review.OverallRating,
            Strengths = review.Strengths,
            AreasForImprovement = review.AreasForImprovement,
            ManagerComments = review.ReviewerComments,
            EmployeeComments = review.EmployeeComments,
            DevelopmentPlan = review.Notes,
            Status = review.Status.ToString(),
            SubmittedDate = review.ReviewDate,
            ApprovedById = review.ApprovedById,
            ApprovedByName = approvedByName,
            ApprovedDate = review.ApprovedDate,
            IsEmployeeAcknowledged = review.EmployeeAcknowledgedDate.HasValue,
            EmployeeAcknowledgedDate = review.EmployeeAcknowledgedDate,
            CreatedAt = review.CreatedDate,
            Criteria = request.IncludeCriteria
                ? review.Criteria.Select(c => new PerformanceReviewCriteriaDto
                {
                    Id = c.Id,
                    PerformanceReviewId = c.PerformanceReviewId,
                    CriteriaName = c.Name,
                    Description = c.Description,
                    Weight = c.Weight,
                    Rating = c.Rating,
                    Score = c.Score,
                    Comments = c.Comments
                }).ToList()
                : new List<PerformanceReviewCriteriaDto>()
        };

        return Result<PerformanceReviewDto>.Success(reviewDto);
    }
}
