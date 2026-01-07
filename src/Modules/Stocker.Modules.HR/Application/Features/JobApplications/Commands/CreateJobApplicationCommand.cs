using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobApplications.Commands;

/// <summary>
/// Command to create a new job application
/// </summary>
public record CreateJobApplicationCommand : IRequest<Result<int>>
{
    public string ApplicationCode { get; init; } = string.Empty;
    public int JobPostingId { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? MobilePhone { get; init; }
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? Country { get; init; }
    public string? LinkedInUrl { get; init; }
    public string? PortfolioUrl { get; init; }
    public int? TotalExperienceYears { get; init; }
    public string? CurrentCompany { get; init; }
    public string? CurrentPosition { get; init; }
    public decimal? CurrentSalary { get; init; }
    public decimal? ExpectedSalary { get; init; }
    public string? Currency { get; init; }
    public int? NoticePeriodDays { get; init; }
    public DateTime? AvailableStartDate { get; init; }
    public string? HighestEducation { get; init; }
    public string? University { get; init; }
    public string? Major { get; init; }
    public int? GraduationYear { get; init; }
    public string? CoverLetter { get; init; }
    public string? ResumeUrl { get; init; }
    public string Source { get; init; } = "Website";
    public int? ReferredByEmployeeId { get; init; }
    public string? SourceDetail { get; init; }
    public string? Skills { get; init; }
    public string? Languages { get; init; }
    public string? Notes { get; init; }
    public string? Tags { get; init; }
}

/// <summary>
/// Validator for CreateJobApplicationCommand
/// </summary>
public class CreateJobApplicationCommandValidator : AbstractValidator<CreateJobApplicationCommand>
{
    public CreateJobApplicationCommandValidator()
    {
        RuleFor(x => x.ApplicationCode)
            .NotEmpty().WithMessage("Application code is required")
            .MaximumLength(50).WithMessage("Application code must not exceed 50 characters");

        RuleFor(x => x.JobPostingId)
            .GreaterThan(0).WithMessage("Job Posting ID must be greater than 0");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email must be a valid email address")
            .MaximumLength(200).WithMessage("Email must not exceed 200 characters");

        RuleFor(x => x.ExpectedSalary)
            .GreaterThan(0).When(x => x.ExpectedSalary.HasValue)
            .WithMessage("Expected salary must be greater than 0");

        RuleFor(x => x.TotalExperienceYears)
            .GreaterThanOrEqualTo(0).When(x => x.TotalExperienceYears.HasValue)
            .WithMessage("Total experience years must be non-negative");
    }
}

/// <summary>
/// Handler for CreateJobApplicationCommand
/// </summary>
public class CreateJobApplicationCommandHandler : IRequestHandler<CreateJobApplicationCommand, Result<int>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateJobApplicationCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(CreateJobApplicationCommand request, CancellationToken cancellationToken)
    {
        // Verify job posting exists
        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(request.JobPostingId, cancellationToken);
        if (jobPosting == null)
        {
            return Result<int>.Failure(
                Error.NotFound("JobPosting", $"Job Posting with ID {request.JobPostingId} not found"));
        }

        // Check if application code already exists
        var existingApplication = await _unitOfWork.JobApplications.GetByCodeAsync(request.ApplicationCode, cancellationToken);
        if (existingApplication != null)
        {
            return Result<int>.Failure(
                Error.Conflict("JobApplication.Code", "A job application with this code already exists"));
        }

        // Verify referred by employee if specified
        if (request.ReferredByEmployeeId.HasValue)
        {
            var referrer = await _unitOfWork.Employees.GetByIdAsync(request.ReferredByEmployeeId.Value, cancellationToken);
            if (referrer == null)
            {
                return Result<int>.Failure(
                    Error.NotFound("Employee", $"Referring employee with ID {request.ReferredByEmployeeId} not found"));
            }
        }

        // Parse source
        var source = ApplicationSource.Website;
        if (!string.IsNullOrEmpty(request.Source) && Enum.TryParse<ApplicationSource>(request.Source, true, out var parsedSource))
            source = parsedSource;

        // Create the job application
        var jobApplication = new JobApplication(
            request.ApplicationCode,
            request.JobPostingId,
            request.FirstName,
            request.LastName,
            request.Email,
            source);

        // Set tenant ID
        jobApplication.SetTenantId(_unitOfWork.TenantId);

        // Set contact info
        jobApplication.UpdateContactInfo(
            request.Phone, 
            request.MobilePhone, 
            request.Address, 
            request.City, 
            request.Country);

        // Set online profiles
        if (!string.IsNullOrEmpty(request.LinkedInUrl))
            jobApplication.SetLinkedInUrl(request.LinkedInUrl);

        if (!string.IsNullOrEmpty(request.PortfolioUrl))
            jobApplication.SetPortfolioUrl(request.PortfolioUrl);

        // Set documents
        if (!string.IsNullOrEmpty(request.ResumeUrl))
            jobApplication.SetResumeUrl(request.ResumeUrl);

        if (!string.IsNullOrEmpty(request.CoverLetter))
            jobApplication.SetCoverLetter(request.CoverLetter);

        // Set referral and source detail
        if (request.ReferredByEmployeeId.HasValue)
            jobApplication.SetReferredBy(request.ReferredByEmployeeId);

        if (!string.IsNullOrEmpty(request.SourceDetail))
            jobApplication.SetSourceDetail(request.SourceDetail);

        // Set experience and salary expectations
        jobApplication.UpdateExperience(
            request.TotalExperienceYears,
            request.CurrentCompany,
            request.CurrentPosition,
            request.CurrentSalary,
            request.ExpectedSalary,
            request.NoticePeriodDays);

        if (!string.IsNullOrEmpty(request.Currency))
            jobApplication.SetCurrency(request.Currency);

        if (request.AvailableStartDate.HasValue)
            jobApplication.SetAvailableStartDate(request.AvailableStartDate.Value);

        // Set education
        if (!string.IsNullOrEmpty(request.HighestEducation))
            jobApplication.SetHighestEducation(request.HighestEducation);

        if (!string.IsNullOrEmpty(request.University) || !string.IsNullOrEmpty(request.Major) || request.GraduationYear.HasValue)
            jobApplication.UpdateEducation(null, request.University, request.Major, request.GraduationYear);

        // Set skills and languages
        if (!string.IsNullOrEmpty(request.Skills))
            jobApplication.SetSkills(request.Skills);

        if (!string.IsNullOrEmpty(request.Languages))
            jobApplication.SetLanguages(request.Languages);

        // Set notes and tags
        if (!string.IsNullOrEmpty(request.Notes))
            jobApplication.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(request.Tags))
            jobApplication.SetTags(request.Tags);

        // Save to repository
        await _unitOfWork.JobApplications.AddAsync(jobApplication, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(jobApplication.Id);
    }
}
