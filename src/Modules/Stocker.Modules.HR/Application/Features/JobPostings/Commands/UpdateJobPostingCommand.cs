using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobPostings.Commands;

/// <summary>
/// Command to update a job posting
/// </summary>
public record UpdateJobPostingCommand(
    Guid TenantId,
    int JobPostingId,
    string? Title = null,
    string? Description = null,
    int? NumberOfOpenings = null,
    JobPostingStatus? Status = null,
    string? Requirements = null,
    string? Responsibilities = null,
    decimal? SalaryMin = null,
    decimal? SalaryMax = null,
    DateTime? ApplicationDeadline = null,
    int? HiringManagerId = null,
    bool? IsFeatured = null,
    bool? IsUrgent = null) : IRequest<Result<bool>>;

/// <summary>
/// Validator for UpdateJobPostingCommand
/// </summary>
public class UpdateJobPostingCommandValidator : AbstractValidator<UpdateJobPostingCommand>
{
    public UpdateJobPostingCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.JobPostingId)
            .GreaterThan(0).WithMessage("Job Posting ID must be greater than 0");

        RuleFor(x => x.Title)
            .MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Title))
            .WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(5000).When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description must not exceed 5000 characters");

        RuleFor(x => x.NumberOfOpenings)
            .GreaterThan(0).When(x => x.NumberOfOpenings.HasValue)
            .WithMessage("Number of openings must be greater than 0");

        RuleFor(x => x.SalaryMin)
            .GreaterThan(0).When(x => x.SalaryMin.HasValue)
            .WithMessage("Minimum salary must be greater than 0");

        RuleFor(x => x.ApplicationDeadline)
            .GreaterThan(DateTime.UtcNow).When(x => x.ApplicationDeadline.HasValue)
            .WithMessage("Application deadline must be in the future");
    }
}

/// <summary>
/// Handler for UpdateJobPostingCommand
/// </summary>
public class UpdateJobPostingCommandHandler : IRequestHandler<UpdateJobPostingCommand, Result<bool>>
{
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateJobPostingCommandHandler(
        IJobPostingRepository jobPostingRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _jobPostingRepository = jobPostingRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateJobPostingCommand request, CancellationToken cancellationToken)
    {
        // Get existing job posting
        var jobPosting = await _jobPostingRepository.GetByIdAsync(request.JobPostingId, cancellationToken);
        if (jobPosting == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobPosting", $"Job Posting with ID {request.JobPostingId} not found"));
        }

        // Verify hiring manager if specified
        if (request.HiringManagerId.HasValue)
        {
            var hiringManager = await _employeeRepository.GetByIdAsync(request.HiringManagerId.Value, cancellationToken);
            if (hiringManager == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("Employee", $"Hiring manager with ID {request.HiringManagerId} not found"));
            }
            jobPosting.SetHiringManager(request.HiringManagerId);
        }

        // Update basic info if provided
        if (!string.IsNullOrEmpty(request.Title) && !string.IsNullOrEmpty(request.Description) && request.NumberOfOpenings.HasValue)
            jobPosting.UpdateBasicInfo(request.Title, request.Description, request.NumberOfOpenings.Value);

        // Update requirements if provided
        if (!string.IsNullOrEmpty(request.Requirements) || !string.IsNullOrEmpty(request.Responsibilities))
            jobPosting.UpdateRequirements(request.Requirements, request.Responsibilities, null, null);

        // Update salary range if provided
        if (request.SalaryMin.HasValue || request.SalaryMax.HasValue)
            jobPosting.UpdateSalaryRange(request.SalaryMin, request.SalaryMax, "TRY", false, SalaryPeriod.Monthly);

        // Update deadline if provided
        if (request.ApplicationDeadline.HasValue)
            jobPosting.SetDeadline(request.ApplicationDeadline);

        // Update flags
        if (request.IsFeatured.HasValue)
            jobPosting.SetFeatured(request.IsFeatured.Value);

        if (request.IsUrgent.HasValue)
            jobPosting.SetUrgent(request.IsUrgent.Value);

        // Update status if provided
        if (request.Status.HasValue)
        {
            switch (request.Status.Value)
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
        _jobPostingRepository.Update(jobPosting);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
