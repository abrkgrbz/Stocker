using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Commands;

/// <summary>
/// Command to complete/submit a performance review
/// </summary>
public record CompletePerformanceReviewCommand : IRequest<Result<PerformanceReviewDto>>
{
    public int ReviewId { get; init; }
    public PerformanceRating OverallRating { get; init; }
    public string? FinalComments { get; init; }
}

/// <summary>
/// Validator for CompletePerformanceReviewCommand
/// </summary>
public class CompletePerformanceReviewCommandValidator : AbstractValidator<CompletePerformanceReviewCommand>
{
    public CompletePerformanceReviewCommandValidator()
    {
        RuleFor(x => x.ReviewId)
            .GreaterThan(0).WithMessage("Review ID is required");

        RuleFor(x => x.OverallRating)
            .IsInEnum().WithMessage("Valid overall rating is required");
    }
}

/// <summary>
/// Handler for CompletePerformanceReviewCommand
/// </summary>
public class CompletePerformanceReviewCommandHandler : IRequestHandler<CompletePerformanceReviewCommand, Result<PerformanceReviewDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CompletePerformanceReviewCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PerformanceReviewDto>> Handle(CompletePerformanceReviewCommand request, CancellationToken cancellationToken)
    {
        // Get review with criteria
        var review = await _unitOfWork.PerformanceReviews.GetWithCriteriaAsync(request.ReviewId, cancellationToken);
        if (review == null)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.NotFound("PerformanceReview", $"Performance review with ID {request.ReviewId} not found"));
        }

        // Set the overall rating
        review.SetRating(request.OverallRating);

        // Add final comments if provided
        if (!string.IsNullOrEmpty(request.FinalComments))
        {
            review.AddReviewerComments(request.FinalComments);
        }

        // Submit the review (validates that rating is set)
        try
        {
            review.Submit();
        }
        catch (InvalidOperationException ex)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.Validation("PerformanceReview.Submit", ex.Message));
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
            SubmittedDate = review.ReviewDate,
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
