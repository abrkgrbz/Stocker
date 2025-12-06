using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Commands;

/// <summary>
/// Command to complete/submit a performance review
/// </summary>
public class CompletePerformanceReviewCommand : IRequest<Result<PerformanceReviewDto>>
{
    public Guid TenantId { get; set; }
    public int ReviewId { get; set; }
    public PerformanceRating OverallRating { get; set; }
    public string? FinalComments { get; set; }
}

/// <summary>
/// Validator for CompletePerformanceReviewCommand
/// </summary>
public class CompletePerformanceReviewCommandValidator : AbstractValidator<CompletePerformanceReviewCommand>
{
    public CompletePerformanceReviewCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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
    private readonly IPerformanceReviewRepository _reviewRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CompletePerformanceReviewCommandHandler(
        IPerformanceReviewRepository reviewRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _reviewRepository = reviewRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PerformanceReviewDto>> Handle(CompletePerformanceReviewCommand request, CancellationToken cancellationToken)
    {
        // Get review with criteria
        var review = await _reviewRepository.GetWithCriteriaAsync(request.ReviewId, cancellationToken);
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
        var employee = await _employeeRepository.GetByIdAsync(review.EmployeeId, cancellationToken);
        var reviewer = await _employeeRepository.GetByIdAsync(review.ReviewerId, cancellationToken);

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
