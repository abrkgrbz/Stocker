using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Queries;

/// <summary>
/// Query to get a single performance review by ID
/// </summary>
public record GetPerformanceReviewByIdQuery(int ReviewId, bool IncludeCriteria = true, bool IncludeGoals = false) : IRequest<Result<PerformanceReviewDto>>;

/// <summary>
/// Validator for GetPerformanceReviewByIdQuery
/// </summary>
public class GetPerformanceReviewByIdQueryValidator : AbstractValidator<GetPerformanceReviewByIdQuery>
{
    public GetPerformanceReviewByIdQueryValidator()
    {
        RuleFor(x => x.ReviewId)
            .GreaterThan(0).WithMessage("Review ID is required");
    }
}

/// <summary>
/// Handler for GetPerformanceReviewByIdQuery
/// </summary>
public class GetPerformanceReviewByIdQueryHandler : IRequestHandler<GetPerformanceReviewByIdQuery, Result<PerformanceReviewDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetPerformanceReviewByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PerformanceReviewDto>> Handle(GetPerformanceReviewByIdQuery request, CancellationToken cancellationToken)
    {
        // Get review with relationships
        var review = request.IncludeGoals
            ? await _unitOfWork.PerformanceReviews.GetWithGoalsAsync(request.ReviewId, cancellationToken)
            : request.IncludeCriteria
                ? await _unitOfWork.PerformanceReviews.GetWithCriteriaAsync(request.ReviewId, cancellationToken)
                : await _unitOfWork.PerformanceReviews.GetByIdAsync(request.ReviewId, cancellationToken);

        if (review == null)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.NotFound("PerformanceReview", $"Performance review with ID {request.ReviewId} not found"));
        }

        // Get employee info
        var employee = await _unitOfWork.Employees.GetByIdAsync(review.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {review.EmployeeId} not found"));
        }

        // Get reviewer info
        var reviewer = await _unitOfWork.Employees.GetByIdAsync(review.ReviewerId, cancellationToken);
        if (reviewer == null)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.NotFound("Reviewer", $"Reviewer with ID {review.ReviewerId} not found"));
        }

        // Get approved by info if available
        string? approvedByName = null;
        if (review.ApprovedById.HasValue)
        {
            var approvedBy = await _unitOfWork.Employees.GetByIdAsync(review.ApprovedById.Value, cancellationToken);
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
