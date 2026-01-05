using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobPostings.Commands;

/// <summary>
/// Command to create a new job posting
/// </summary>
public record CreateJobPostingCommand(
    string Title,
    string PostingCode,
    int DepartmentId,
    string Description,
    JobEmploymentType EmploymentType = JobEmploymentType.FullTime,
    ExperienceLevel ExperienceLevel = ExperienceLevel.MidLevel,
    int NumberOfOpenings = 1,
    string? Requirements = null,
    string? Responsibilities = null,
    decimal? SalaryMin = null,
    decimal? SalaryMax = null,
    DateTime? ApplicationDeadline = null,
    int? HiringManagerId = null,
    int? PositionId = null) : IRequest<Result<int>>;

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

        RuleFor(x => x.PostingCode)
            .NotEmpty().WithMessage("Posting code is required")
            .MaximumLength(50).WithMessage("Posting code must not exceed 50 characters");

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

        RuleFor(x => x.ApplicationDeadline)
            .GreaterThan(DateTime.UtcNow).When(x => x.ApplicationDeadline.HasValue)
            .WithMessage("Application deadline must be in the future");
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

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateJobPostingCommand request, CancellationToken cancellationToken)
    {
        // Verify department exists
        var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Department", $"Department with ID {request.DepartmentId} not found"));
        }

        // Check if posting code already exists
        var existingPosting = await _unitOfWork.JobPostings.GetByCodeAsync(request.PostingCode, cancellationToken);
        if (existingPosting != null)
        {
            return Result<int>.Failure(
                Error.Conflict("JobPosting.Code", "A job posting with this code already exists"));
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

        // Create the job posting
        var jobPosting = new JobPosting(
            request.Title,
            request.PostingCode,
            request.DepartmentId,
            request.Description,
            request.EmploymentType,
            request.ExperienceLevel);

        // Set tenant ID
        jobPosting.SetTenantId(_unitOfWork.TenantId);

        // Update basic info
        jobPosting.UpdateBasicInfo(request.Title, request.Description, request.NumberOfOpenings);

        // Set requirements if provided
        if (!string.IsNullOrEmpty(request.Requirements) || !string.IsNullOrEmpty(request.Responsibilities))
            jobPosting.UpdateRequirements(request.Requirements, request.Responsibilities, null, null);

        // Set salary range if provided
        if (request.SalaryMin.HasValue || request.SalaryMax.HasValue)
            jobPosting.UpdateSalaryRange(request.SalaryMin, request.SalaryMax, "TRY", false, SalaryPeriod.Monthly);

        // Set optional properties
        if (request.HiringManagerId.HasValue)
            jobPosting.SetHiringManager(request.HiringManagerId);

        if (request.PositionId.HasValue)
            jobPosting.SetPosition(request.PositionId);

        if (request.ApplicationDeadline.HasValue)
            jobPosting.SetDeadline(request.ApplicationDeadline);

        // Save to repository
        await _unitOfWork.JobPostings.AddAsync(jobPosting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(jobPosting.Id);
    }
}
