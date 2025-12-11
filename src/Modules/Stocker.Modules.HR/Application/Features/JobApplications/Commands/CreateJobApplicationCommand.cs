using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobApplications.Commands;

/// <summary>
/// Command to create a new job application
/// </summary>
public record CreateJobApplicationCommand(
    Guid TenantId,
    string ApplicationCode,
    int JobPostingId,
    string FirstName,
    string LastName,
    string Email,
    ApplicationSource Source = ApplicationSource.Website,
    string? Phone = null,
    string? ResumeUrl = null,
    string? CoverLetter = null,
    int? ReferredByEmployeeId = null,
    decimal? ExpectedSalary = null,
    int? TotalExperienceYears = null) : IRequest<Result<int>>;

/// <summary>
/// Validator for CreateJobApplicationCommand
/// </summary>
public class CreateJobApplicationCommandValidator : AbstractValidator<CreateJobApplicationCommand>
{
    public CreateJobApplicationCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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
    private readonly IJobApplicationRepository _jobApplicationRepository;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateJobApplicationCommandHandler(
        IJobApplicationRepository jobApplicationRepository,
        IJobPostingRepository jobPostingRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _jobApplicationRepository = jobApplicationRepository;
        _jobPostingRepository = jobPostingRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateJobApplicationCommand request, CancellationToken cancellationToken)
    {
        // Verify job posting exists
        var jobPosting = await _jobPostingRepository.GetByIdAsync(request.JobPostingId, cancellationToken);
        if (jobPosting == null)
        {
            return Result<int>.Failure(
                Error.NotFound("JobPosting", $"Job Posting with ID {request.JobPostingId} not found"));
        }

        // Check if application code already exists
        var existingApplication = await _jobApplicationRepository.GetByCodeAsync(request.ApplicationCode, cancellationToken);
        if (existingApplication != null)
        {
            return Result<int>.Failure(
                Error.Conflict("JobApplication.Code", "A job application with this code already exists"));
        }

        // Verify referred by employee if specified
        if (request.ReferredByEmployeeId.HasValue)
        {
            var referrer = await _employeeRepository.GetByIdAsync(request.ReferredByEmployeeId.Value, cancellationToken);
            if (referrer == null)
            {
                return Result<int>.Failure(
                    Error.NotFound("Employee", $"Referring employee with ID {request.ReferredByEmployeeId} not found"));
            }
        }

        // Create the job application
        var jobApplication = new JobApplication(
            request.ApplicationCode,
            request.JobPostingId,
            request.FirstName,
            request.LastName,
            request.Email,
            request.Source);

        // Set tenant ID
        jobApplication.SetTenantId(request.TenantId);

        // Set optional contact info
        if (!string.IsNullOrEmpty(request.Phone))
            jobApplication.UpdateContactInfo(request.Phone, null, null, null, null);

        // Set documents
        if (!string.IsNullOrEmpty(request.ResumeUrl))
            jobApplication.SetResumeUrl(request.ResumeUrl);

        if (!string.IsNullOrEmpty(request.CoverLetter))
            jobApplication.SetCoverLetter(request.CoverLetter);

        // Set referral
        if (request.ReferredByEmployeeId.HasValue)
            jobApplication.SetReferredBy(request.ReferredByEmployeeId);

        // Set experience and salary expectations
        if (request.TotalExperienceYears.HasValue || request.ExpectedSalary.HasValue)
            jobApplication.UpdateExperience(
                request.TotalExperienceYears,
                null,
                null,
                null,
                request.ExpectedSalary,
                null);

        // Save to repository
        await _jobApplicationRepository.AddAsync(jobApplication, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(jobApplication.Id);
    }
}
