using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Queries;

/// <summary>
/// Query to get performance reviews with filters
/// </summary>
public record GetPerformanceReviewsQuery : IRequest<Result<List<PerformanceReviewDto>>>
{
    public int? EmployeeId { get; init; }
    public int? ReviewerId { get; init; }
    public int? Year { get; init; }
    public int? Quarter { get; init; }
    public PerformanceReviewStatus? Status { get; init; }
    public DateTime? PeriodStart { get; init; }
    public DateTime? PeriodEnd { get; init; }
    public bool IncludeCriteria { get; init; } = false;
}

/// <summary>
/// Validator for GetPerformanceReviewsQuery
/// </summary>
public class GetPerformanceReviewsQueryValidator : AbstractValidator<GetPerformanceReviewsQuery>
{
    public GetPerformanceReviewsQueryValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Invalid employee ID")
            .When(x => x.EmployeeId.HasValue);

        RuleFor(x => x.ReviewerId)
            .GreaterThan(0).WithMessage("Invalid reviewer ID")
            .When(x => x.ReviewerId.HasValue);

        RuleFor(x => x.Year)
            .GreaterThan(1900).WithMessage("Invalid year")
            .LessThanOrEqualTo(DateTime.Now.Year + 1).WithMessage("Year cannot be in the future")
            .When(x => x.Year.HasValue);

        RuleFor(x => x.Quarter)
            .InclusiveBetween(1, 4).WithMessage("Quarter must be between 1 and 4")
            .When(x => x.Quarter.HasValue);

        RuleFor(x => x.PeriodEnd)
            .GreaterThan(x => x.PeriodStart)
            .When(x => x.PeriodStart.HasValue && x.PeriodEnd.HasValue)
            .WithMessage("Period end must be after period start");
    }
}

/// <summary>
/// Handler for GetPerformanceReviewsQuery
/// </summary>
public class GetPerformanceReviewsQueryHandler : IRequestHandler<GetPerformanceReviewsQuery, Result<List<PerformanceReviewDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetPerformanceReviewsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PerformanceReviewDto>>> Handle(GetPerformanceReviewsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<PerformanceReview> reviews;

        // Apply filters based on query parameters
        if (request.Status.HasValue)
        {
            reviews = await _unitOfWork.PerformanceReviews.GetByStatusAsync(request.Status.Value, cancellationToken);
        }
        else if (request.EmployeeId.HasValue)
        {
            reviews = await _unitOfWork.PerformanceReviews.GetByEmployeeAsync(request.EmployeeId.Value, cancellationToken);
        }
        else if (request.ReviewerId.HasValue)
        {
            reviews = await _unitOfWork.PerformanceReviews.GetByReviewerAsync(request.ReviewerId.Value, cancellationToken);
        }
        else if (request.Year.HasValue && request.Quarter.HasValue)
        {
            reviews = await _unitOfWork.PerformanceReviews.GetByYearAndQuarterAsync(request.Year.Value, request.Quarter.Value, cancellationToken);
        }
        else if (request.Year.HasValue)
        {
            reviews = await _unitOfWork.PerformanceReviews.GetByYearAsync(request.Year.Value, cancellationToken);
        }
        else if (request.PeriodStart.HasValue && request.PeriodEnd.HasValue)
        {
            reviews = await _unitOfWork.PerformanceReviews.GetByPeriodAsync(request.PeriodStart.Value, request.PeriodEnd.Value, cancellationToken);
        }
        else
        {
            reviews = await _unitOfWork.PerformanceReviews.GetAllAsync(cancellationToken);
        }

        // Load criteria if requested
        var reviewsList = reviews.ToList();
        if (request.IncludeCriteria)
        {
            var reviewsWithCriteria = new List<PerformanceReview>();
            foreach (var review in reviewsList)
            {
                var reviewWithCriteria = await _unitOfWork.PerformanceReviews.GetWithCriteriaAsync(review.Id, cancellationToken);
                if (reviewWithCriteria != null)
                {
                    reviewsWithCriteria.Add(reviewWithCriteria);
                }
            }
            reviewsList = reviewsWithCriteria;
        }

        // Get employee and reviewer information
        var employeeIds = reviewsList.Select(r => r.EmployeeId).Distinct().ToList();
        var reviewerIds = reviewsList.Select(r => r.ReviewerId).Distinct().ToList();
        var allEmployeeIds = employeeIds.Union(reviewerIds).Distinct().ToList();

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
        var reviewDtos = reviewsList.Select(review => new PerformanceReviewDto
        {
            Id = review.Id,
            EmployeeId = review.EmployeeId,
            EmployeeName = employees.ContainsKey(review.EmployeeId)
                ? $"{employees[review.EmployeeId].FirstName} {employees[review.EmployeeId].LastName}"
                : string.Empty,
            EmployeeCode = employees.ContainsKey(review.EmployeeId)
                ? employees[review.EmployeeId].EmployeeCode
                : null,
            DepartmentName = employees.ContainsKey(review.EmployeeId)
                ? employees[review.EmployeeId].Department?.Name
                : null,
            PositionTitle = employees.ContainsKey(review.EmployeeId)
                ? employees[review.EmployeeId].Position?.Title
                : null,
            ReviewerId = review.ReviewerId,
            ReviewerName = employees.ContainsKey(review.ReviewerId)
                ? $"{employees[review.ReviewerId].FirstName} {employees[review.ReviewerId].LastName}"
                : string.Empty,
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
            ApprovedByName = review.ApprovedById.HasValue && employees.ContainsKey(review.ApprovedById.Value)
                ? $"{employees[review.ApprovedById.Value].FirstName} {employees[review.ApprovedById.Value].LastName}"
                : null,
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
        }).ToList();

        return Result<List<PerformanceReviewDto>>.Success(reviewDtos);
    }
}
