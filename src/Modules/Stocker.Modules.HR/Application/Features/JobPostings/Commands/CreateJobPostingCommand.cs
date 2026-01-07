using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobPostings.Commands;

/// <summary>
/// Command to create a new job posting
/// </summary>
public record CreateJobPostingCommand : IRequest<Result<int>>
{
    // Basic Info
    public string Title { get; init; } = string.Empty;
    public string EmploymentType { get; init; } = "FullTime";
    public string ExperienceLevel { get; init; } = "MidLevel";

    // Department & Position
    public int DepartmentId { get; init; }
    public int? PositionId { get; init; }
    public int? HiringManagerId { get; init; }
    public int NumberOfOpenings { get; init; } = 1;

    // Location
    public int? WorkLocationId { get; init; }
    public string RemoteWorkType { get; init; } = "OnSite";
    public string? City { get; init; }
    public string? Country { get; init; }

    // Job Description
    public string Description { get; init; } = string.Empty;
    public string? Requirements { get; init; }
    public string? Responsibilities { get; init; }
    public string? Qualifications { get; init; }
    public string? PreferredQualifications { get; init; }
    public string? Benefits { get; init; }

    // Salary
    public decimal? SalaryMin { get; init; }
    public decimal? SalaryMax { get; init; }
    public string? Currency { get; init; }
    public bool ShowSalary { get; init; }
    public string SalaryPeriod { get; init; } = "Monthly";

    // Dates
    public DateTime? PostedDate { get; init; }
    public DateTime? ApplicationDeadline { get; init; }
    public DateTime? ExpectedStartDate { get; init; }

    // Publishing
    public bool IsInternal { get; init; }
    public bool IsFeatured { get; init; }
    public bool IsUrgent { get; init; }

    // Additional
    public string? Tags { get; init; }
    public string? Keywords { get; init; }
    public string? InternalNotes { get; init; }
}

/// <summary>
/// Validator for CreateJobPostingCommand
/// </summary>
public class CreateJobPostingCommandValidator : AbstractValidator<CreateJobPostingCommand>
{
    public CreateJobPostingCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("Department ID must be greater than 0");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(5000).WithMessage("Description must not exceed 5000 characters");

        RuleFor(x => x.NumberOfOpenings)
            .GreaterThan(0).WithMessage("Number of openings must be greater than 0");

        RuleFor(x => x.SalaryMin)
            .GreaterThan(0).When(x => x.SalaryMin.HasValue)
            .WithMessage("Minimum salary must be greater than 0");

        RuleFor(x => x.SalaryMax)
            .GreaterThanOrEqualTo(x => x.SalaryMin ?? 0).When(x => x.SalaryMax.HasValue && x.SalaryMin.HasValue)
            .WithMessage("Maximum salary must be greater than or equal to minimum salary");
    }
}

/// <summary>
/// Handler for CreateJobPostingCommand
/// </summary>
public class CreateJobPostingCommandHandler : IRequestHandler<CreateJobPostingCommand, Result<int>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateJobPostingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(CreateJobPostingCommand request, CancellationToken cancellationToken)
    {
        // Verify department exists
        var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Department", $"Department with ID {request.DepartmentId} not found"));
        }

        // Verify hiring manager if specified
        if (request.HiringManagerId.HasValue)
        {
            var hiringManager = await _unitOfWork.Employees.GetByIdAsync(request.HiringManagerId.Value, cancellationToken);
            if (hiringManager == null)
            {
                return Result<int>.Failure(
                    Error.NotFound("Employee", $"Hiring manager with ID {request.HiringManagerId} not found"));
            }
        }

        // Parse enums
        if (!Enum.TryParse<JobEmploymentType>(request.EmploymentType, true, out var employmentType))
            employmentType = JobEmploymentType.FullTime;

        if (!Enum.TryParse<ExperienceLevel>(request.ExperienceLevel, true, out var experienceLevel))
            experienceLevel = ExperienceLevel.MidLevel;

        if (!Enum.TryParse<RemoteWorkType>(request.RemoteWorkType, true, out var remoteWorkType))
            remoteWorkType = RemoteWorkType.OnSite;

        if (!Enum.TryParse<SalaryPeriod>(request.SalaryPeriod, true, out var salaryPeriod))
            salaryPeriod = SalaryPeriod.Monthly;

        // Generate posting code
        var postingCode = await GeneratePostingCodeAsync(cancellationToken);

        // Create the job posting
        var jobPosting = new JobPosting(
            request.Title,
            postingCode,
            request.DepartmentId,
            request.Description,
            employmentType,
            experienceLevel);

        // Set tenant ID
        jobPosting.SetTenantId(_unitOfWork.TenantId);

        // Update basic info
        jobPosting.UpdateBasicInfo(request.Title, request.Description, request.NumberOfOpenings);

        // Set requirements
        jobPosting.UpdateRequirements(
            request.Requirements,
            request.Responsibilities,
            request.Qualifications,
            request.PreferredQualifications);

        // Set benefits
        if (!string.IsNullOrEmpty(request.Benefits))
            jobPosting.SetBenefits(request.Benefits);

        // Set salary range
        var currency = request.Currency ?? "TRY";
        jobPosting.UpdateSalaryRange(request.SalaryMin, request.SalaryMax, currency, request.ShowSalary, salaryPeriod);

        // Set location
        jobPosting.UpdateLocation(request.WorkLocationId, request.City, request.Country, remoteWorkType);

        // Set optional properties
        if (request.HiringManagerId.HasValue)
            jobPosting.SetHiringManager(request.HiringManagerId);

        if (request.PositionId.HasValue)
            jobPosting.SetPosition(request.PositionId);

        if (request.ApplicationDeadline.HasValue)
            jobPosting.SetDeadline(request.ApplicationDeadline);

        if (request.ExpectedStartDate.HasValue)
            jobPosting.SetExpectedStartDate(request.ExpectedStartDate);

        // Set publishing options
        jobPosting.SetInternal(request.IsInternal);
        jobPosting.SetFeatured(request.IsFeatured);
        jobPosting.SetUrgent(request.IsUrgent);

        // Set additional info
        if (!string.IsNullOrEmpty(request.Tags))
            jobPosting.SetTags(request.Tags);

        if (!string.IsNullOrEmpty(request.Keywords))
            jobPosting.SetKeywords(request.Keywords);

        if (!string.IsNullOrEmpty(request.InternalNotes))
            jobPosting.SetInternalNotes(request.InternalNotes);

        // Save to repository
        await _unitOfWork.JobPostings.AddAsync(jobPosting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(jobPosting.Id);
    }

    private async Task<string> GeneratePostingCodeAsync(CancellationToken cancellationToken)
    {
        var year = DateTime.UtcNow.Year;
        var allPostings = await _unitOfWork.JobPostings.GetAllAsync(cancellationToken);
        var currentYearCount = allPostings.Count(p => p.CreatedDate.Year == year) + 1;
        return $"JP-{year}-{currentYearCount:D4}";
    }
}