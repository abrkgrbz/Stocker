using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Commands;

/// <summary>
/// Command to update a performance review
/// </summary>
public record UpdatePerformanceReviewCommand : IRequest<Result<PerformanceReviewDto>>
{
    public int ReviewId { get; init; }
    public UpdatePerformanceReviewDto ReviewData { get; init; } = null!;
    public List<RateCriteriaDto>? CriteriaRatings { get; init; }
}

/// <summary>
/// Validator for UpdatePerformanceReviewCommand
/// </summary>
public class UpdatePerformanceReviewCommandValidator : AbstractValidator<UpdatePerformanceReviewCommand>
{
    public UpdatePerformanceReviewCommandValidator()
    {
        RuleFor(x => x.ReviewId)
            .GreaterThan(0).WithMessage("Review ID is required");

        RuleFor(x => x.ReviewData)
            .NotNull().WithMessage("Review data is required");

        When(x => x.CriteriaRatings != null && x.CriteriaRatings.Any(), () =>
        {
            RuleForEach(x => x.CriteriaRatings)
                .Must(c => c.CriteriaId > 0)
                .WithMessage("Invalid criteria ID");

            RuleForEach(x => x.CriteriaRatings)
                .Must(c => c.Score == null || (c.Score >= 0 && c.Score <= 100))
                .WithMessage("Score must be between 0 and 100");
        });
    }
}

/// <summary>
/// Handler for UpdatePerformanceReviewCommand
/// </summary>
public class UpdatePerformanceReviewCommandHandler : IRequestHandler<UpdatePerformanceReviewCommand, Result<PerformanceReviewDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdatePerformanceReviewCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PerformanceReviewDto>> Handle(UpdatePerformanceReviewCommand request, CancellationToken cancellationToken)
    {
        // Get review with criteria
        var review = await _unitOfWork.PerformanceReviews.GetWithCriteriaAsync(request.ReviewId, cancellationToken);
        if (review == null)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.NotFound("PerformanceReview", $"Performance review with ID {request.ReviewId} not found"));
        }

        // Check if review can be updated
        if (review.Status == PerformanceReviewStatus.Approved)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.Validation("PerformanceReview.Status", "Cannot update an approved review"));
        }

        var data = request.ReviewData;

        // Update review feedback
        review.SetFeedback(
            data.Strengths,
            data.AreasForImprovement,
            null, // goals
            null); // achievements

        if (!string.IsNullOrEmpty(data.ManagerComments))
        {
            review.AddReviewerComments(data.ManagerComments);
        }

        if (!string.IsNullOrEmpty(data.DevelopmentPlan))
        {
            review.SetNotes(data.DevelopmentPlan);
        }

        // Update criteria ratings if provided
        if (request.CriteriaRatings != null && request.CriteriaRatings.Any())
        {
            foreach (var ratingDto in request.CriteriaRatings)
            {
                var criteria = review.Criteria.FirstOrDefault(c => c.Id == ratingDto.CriteriaId);
                if (criteria != null)
                {
                    if (ratingDto.Score.HasValue)
                    {
                        criteria.SetScore(ratingDto.Score.Value, ratingDto.Comments);
                    }
                    else
                    {
                        criteria.SetRating(ratingDto.Rating, ratingDto.Comments);
                    }
                }
            }

            // Calculate overall rating based on weighted criteria
            var ratedCriteria = review.Criteria.Where(c => c.Rating.HasValue).ToList();
            if (ratedCriteria.Any())
            {
                var totalWeight = ratedCriteria.Sum(c => c.Weight);
                var weightedSum = ratedCriteria.Sum(c => (int)c.Rating!.Value * c.Weight);
                var averageRating = (int)Math.Round(weightedSum / totalWeight);

                if (Enum.IsDefined(typeof(Domain.Enums.PerformanceRating), averageRating))
                {
                    review.SetRating((Domain.Enums.PerformanceRating)averageRating);
                }
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get employee and reviewer info
        var employee = await _unitOfWork.Employees.GetByIdAsync(review.EmployeeId, cancellationToken);
        var reviewer = await _unitOfWork.Employees.GetByIdAsync(review.ReviewerId, cancellationToken);

        // Map to DTO
        var reviewDto = new PerformanceReviewDto
        {
            Id = review.Id,
            EmployeeId = review.EmployeeId,
            EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : string.Empty,
            EmployeeCode = employee?.EmployeeCode,
            ReviewerId = review.ReviewerId,
            ReviewerName = reviewer != null ? $"{reviewer.FirstName} {reviewer.LastName}" : string.Empty,
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
            CreatedAt = review.CreatedDate,
            Criteria = review.Criteria.Select(c => new PerformanceReviewCriteriaDto
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
        };

        return Result<PerformanceReviewDto>.Success(reviewDto);
    }
}
