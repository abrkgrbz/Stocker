using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Performance.Commands;

/// <summary>
/// Command to create a new performance review
/// </summary>
public class CreatePerformanceReviewCommand : IRequest<Result<PerformanceReviewDto>>
{
    public Guid TenantId { get; set; }
    public CreatePerformanceReviewDto ReviewData { get; set; } = null!;
}

/// <summary>
/// Validator for CreatePerformanceReviewCommand
/// </summary>
public class CreatePerformanceReviewCommandValidator : AbstractValidator<CreatePerformanceReviewCommand>
{
    public CreatePerformanceReviewCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.ReviewData)
            .NotNull().WithMessage("Review data is required");

        When(x => x.ReviewData != null, () =>
        {
            RuleFor(x => x.ReviewData.EmployeeId)
                .GreaterThan(0).WithMessage("Employee ID is required");

            RuleFor(x => x.ReviewData.ReviewerId)
                .GreaterThan(0).WithMessage("Reviewer ID is required");

            RuleFor(x => x.ReviewData.ReviewPeriod)
                .NotEmpty().WithMessage("Review period is required")
                .MaximumLength(100).WithMessage("Review period must not exceed 100 characters");

            RuleFor(x => x.ReviewData.ReviewDate)
                .NotEmpty().WithMessage("Review date is required");

            RuleFor(x => x.ReviewData.ReviewType)
                .NotEmpty().WithMessage("Review type is required")
                .MaximumLength(50).WithMessage("Review type must not exceed 50 characters");

            RuleFor(x => x.ReviewData.DueDate)
                .GreaterThan(x => x.ReviewData.ReviewDate)
                .When(x => x.ReviewData.DueDate.HasValue)
                .WithMessage("Due date must be after review date");

            RuleFor(x => x.ReviewData.Criteria)
                .Must(criteria => criteria == null || criteria.All(c => c.Weight > 0))
                .WithMessage("All criteria weights must be greater than 0");
        });
    }
}

/// <summary>
/// Handler for CreatePerformanceReviewCommand
/// </summary>
public class CreatePerformanceReviewCommandHandler : IRequestHandler<CreatePerformanceReviewCommand, Result<PerformanceReviewDto>>
{
    private readonly IPerformanceReviewRepository _reviewRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePerformanceReviewCommandHandler(
        IPerformanceReviewRepository reviewRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _reviewRepository = reviewRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PerformanceReviewDto>> Handle(CreatePerformanceReviewCommand request, CancellationToken cancellationToken)
    {
        var data = request.ReviewData;

        // Validate employee
        var employee = await _employeeRepository.GetByIdAsync(data.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {data.EmployeeId} not found"));
        }

        // Validate reviewer
        var reviewer = await _employeeRepository.GetByIdAsync(data.ReviewerId, cancellationToken);
        if (reviewer == null)
        {
            return Result<PerformanceReviewDto>.Failure(
                Error.NotFound("Reviewer", $"Reviewer with ID {data.ReviewerId} not found"));
        }

        // Parse review period to extract year and dates
        var year = data.ReviewDate.Year;
        var reviewPeriodStart = new DateTime(year, 1, 1);
        var reviewPeriodEnd = new DateTime(year, 12, 31);
        int? quarter = null;

        // Try to extract quarter from review period if it contains "Q1", "Q2", etc.
        if (data.ReviewPeriod.Contains("Q1", StringComparison.OrdinalIgnoreCase))
        {
            quarter = 1;
            reviewPeriodStart = new DateTime(year, 1, 1);
            reviewPeriodEnd = new DateTime(year, 3, 31);
        }
        else if (data.ReviewPeriod.Contains("Q2", StringComparison.OrdinalIgnoreCase))
        {
            quarter = 2;
            reviewPeriodStart = new DateTime(year, 4, 1);
            reviewPeriodEnd = new DateTime(year, 6, 30);
        }
        else if (data.ReviewPeriod.Contains("Q3", StringComparison.OrdinalIgnoreCase))
        {
            quarter = 3;
            reviewPeriodStart = new DateTime(year, 7, 1);
            reviewPeriodEnd = new DateTime(year, 9, 30);
        }
        else if (data.ReviewPeriod.Contains("Q4", StringComparison.OrdinalIgnoreCase))
        {
            quarter = 4;
            reviewPeriodStart = new DateTime(year, 10, 1);
            reviewPeriodEnd = new DateTime(year, 12, 31);
        }

        // Create the review
        var review = new PerformanceReview(
            data.EmployeeId,
            data.ReviewerId,
            $"{data.ReviewType} - {data.ReviewPeriod}",
            year,
            reviewPeriodStart,
            reviewPeriodEnd,
            quarter);

        // Set tenant ID
        review.SetTenantId(request.TenantId);

        // Add criteria if provided
        if (data.Criteria != null && data.Criteria.Any())
        {
            int displayOrder = 0;
            foreach (var criteriaDto in data.Criteria)
            {
                var criteria = new PerformanceReviewCriteria(
                    review.Id,
                    criteriaDto.CriteriaName,
                    criteriaDto.Weight,
                    criteriaDto.Description,
                    displayOrder++);
                review.AddCriteria(criteria);
            }
        }

        // Save to repository
        await _reviewRepository.AddAsync(review, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Reload with criteria to get IDs
        var savedReview = await _reviewRepository.GetWithCriteriaAsync(review.Id, cancellationToken);

        // Map to DTO
        var reviewDto = new PerformanceReviewDto
        {
            Id = review.Id,
            EmployeeId = review.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            EmployeeCode = employee.EmployeeCode,
            ReviewerId = review.ReviewerId,
            ReviewerName = $"{reviewer.FirstName} {reviewer.LastName}",
            ReviewPeriod = data.ReviewPeriod,
            ReviewDate = data.ReviewDate,
            DueDate = data.DueDate,
            ReviewType = data.ReviewType,
            Status = PerformanceReviewStatus.Draft.ToString(),
            CreatedAt = review.CreatedDate,
            Criteria = savedReview?.Criteria.Select(c => new PerformanceReviewCriteriaDto
            {
                Id = c.Id,
                PerformanceReviewId = c.PerformanceReviewId,
                CriteriaName = c.Name,
                Description = c.Description,
                Weight = c.Weight,
                Rating = c.Rating,
                Score = c.Score,
                Comments = c.Comments
            }).ToList() ?? new List<PerformanceReviewCriteriaDto>()
        };

        return Result<PerformanceReviewDto>.Success(reviewDto);
    }
}
