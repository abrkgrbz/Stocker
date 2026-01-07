using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobPostings.Commands;

/// <summary>
/// Command to update a job posting
/// </summary>
public record UpdateJobPostingCommand : IRequest<Result<bool>>
{
    public int JobPostingId { get; init; }

    // Basic Info
    public string Title { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
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
    public bool ShowSalary { get; init; }
    public string SalaryPeriod { get; init; } = "Monthly";

    // Dates
    public DateTime? ApplicationDeadline { get; init; }
    public DateTime? ExpectedStartDate { get; init; }
    public DateTime? ClosedDate { get; init; }

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
/// Validator for UpdateJobPostingCommand
/// </summary>
public class UpdateJobPostingCommandValidator : AbstractValidator<UpdateJobPostingCommand>
{
    public UpdateJobPostingCommandValidator()
    {
        RuleFor(x => x.JobPostingId)
            .GreaterThan(0).WithMessage("Job Posting ID must be greater than 0");

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
/// Handler for UpdateJobPostingCommand
/// </summary>
public class UpdateJobPostingCommandHandler : IRequestHandler<UpdateJobPostingCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateJobPostingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(UpdateJobPostingCommand request, CancellationToken cancellationToken)
    {
        // Get existing job posting
        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(request.JobPostingId, cancellationToken);
        if (jobPosting == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobPosting", $"Job Posting with ID {request.JobPostingId} not found"));
        }

        // Verify department exists
        var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Department", $"Department with ID {request.DepartmentId} not found"));
        }

        // Verify hiring manager if specified
        if (request.HiringManagerId.HasValue)
        {
            var hiringManager = await _unitOfWork.Employees.GetByIdAsync(request.HiringManagerId.Value, cancellationToken);
            if (hiringManager == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("Employee", $"Hiring manager with ID {request.HiringManagerId} not found"));
            }
        }

        // Parse enums
        if (!Enum.TryParse<RemoteWorkType>(request.RemoteWorkType, true, out var remoteWorkType))
            remoteWorkType = RemoteWorkType.OnSite;

        if (!Enum.TryParse<SalaryPeriod>(request.SalaryPeriod, true, out var salaryPeriod))
            salaryPeriod = SalaryPeriod.Monthly;

        // Update basic info
        jobPosting.UpdateBasicInfo(request.Title, request.Description, request.NumberOfOpenings);

        // Update requirements
        jobPosting.UpdateRequirements(
            request.Requirements,
            request.Responsibilities,
            request.Qualifications,
            request.PreferredQualifications);

        // Set benefits
        jobPosting.SetBenefits(request.Benefits);

        // Update salary range
        jobPosting.UpdateSalaryRange(request.SalaryMin, request.SalaryMax, "TRY", request.ShowSalary, salaryPeriod);

        // Update location
        jobPosting.UpdateLocation(request.WorkLocationId, request.City, request.Country, remoteWorkType);

        // Update optional properties
        jobPosting.SetHiringManager(request.HiringManagerId);
        jobPosting.SetPosition(request.PositionId);
        jobPosting.SetDeadline(request.ApplicationDeadline);
        jobPosting.SetExpectedStartDate(request.ExpectedStartDate);

        // Update publishing options
        jobPosting.SetInternal(request.IsInternal);
        jobPosting.SetFeatured(request.IsFeatured);
        jobPosting.SetUrgent(request.IsUrgent);

        // Update additional info
        jobPosting.SetTags(request.Tags);
        jobPosting.SetKeywords(request.Keywords);
        jobPosting.SetInternalNotes(request.InternalNotes);

        // Update status if provided
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<JobPostingStatus>(request.Status, true, out var status))
        {
            switch (status)
            {
                case JobPostingStatus.Open:
                    jobPosting.Publish();
                    break;
                case JobPostingStatus.OnHold:
                    jobPosting.PutOnHold();
                    break;
                case JobPostingStatus.Closed:
                    jobPosting.Close();
                    break;
                case JobPostingStatus.Cancelled:
                    jobPosting.Cancel();
                    break;
                case JobPostingStatus.Filled:
                    jobPosting.MarkAsFilled();
                    break;
            }
        }

        // Save changes
        await _unitOfWork.JobPostings.UpdateAsync(jobPosting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}