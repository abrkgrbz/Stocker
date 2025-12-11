using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobApplications.Commands;

/// <summary>
/// Command to update a job application
/// </summary>
public record UpdateJobApplicationCommand(
    Guid TenantId,
    int JobApplicationId,
    ApplicationStatus? Status = null,
    ApplicationStage? CurrentStage = null,
    string? Phone = null,
    string? City = null,
    string? Country = null,
    int? TotalExperienceYears = null,
    decimal? ExpectedSalary = null,
    string? Skills = null,
    string? Notes = null,
    int? OverallRating = null) : IRequest<Result<bool>>;

/// <summary>
/// Validator for UpdateJobApplicationCommand
/// </summary>
public class UpdateJobApplicationCommandValidator : AbstractValidator<UpdateJobApplicationCommand>
{
    public UpdateJobApplicationCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.JobApplicationId)
            .GreaterThan(0).WithMessage("Job Application ID must be greater than 0");

        RuleFor(x => x.ExpectedSalary)
            .GreaterThan(0).When(x => x.ExpectedSalary.HasValue)
            .WithMessage("Expected salary must be greater than 0");

        RuleFor(x => x.TotalExperienceYears)
            .GreaterThanOrEqualTo(0).When(x => x.TotalExperienceYears.HasValue)
            .WithMessage("Total experience years must be non-negative");

        RuleFor(x => x.OverallRating)
            .InclusiveBetween(1, 10).When(x => x.OverallRating.HasValue)
            .WithMessage("Overall rating must be between 1 and 10");
    }
}

/// <summary>
/// Handler for UpdateJobApplicationCommand
/// </summary>
public class UpdateJobApplicationCommandHandler : IRequestHandler<UpdateJobApplicationCommand, Result<bool>>
{
    private readonly IJobApplicationRepository _jobApplicationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateJobApplicationCommandHandler(
        IJobApplicationRepository jobApplicationRepository,
        IUnitOfWork unitOfWork)
    {
        _jobApplicationRepository = jobApplicationRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateJobApplicationCommand request, CancellationToken cancellationToken)
    {
        // Get existing job application
        var jobApplication = await _jobApplicationRepository.GetByIdAsync(request.JobApplicationId, cancellationToken);
        if (jobApplication == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobApplication", $"Job Application with ID {request.JobApplicationId} not found"));
        }

        // Update stage if provided
        if (request.CurrentStage.HasValue)
            jobApplication.MoveToStage(request.CurrentStage.Value);

        // Update contact info if provided
        if (!string.IsNullOrEmpty(request.Phone) || !string.IsNullOrEmpty(request.City) || !string.IsNullOrEmpty(request.Country))
            jobApplication.UpdateContactInfo(request.Phone, null, null, request.City, request.Country);

        // Update experience if provided
        if (request.TotalExperienceYears.HasValue || request.ExpectedSalary.HasValue)
            jobApplication.UpdateExperience(
                request.TotalExperienceYears,
                null,
                null,
                null,
                request.ExpectedSalary,
                null);

        // Update skills and notes
        if (!string.IsNullOrEmpty(request.Skills))
            jobApplication.SetSkills(request.Skills);

        if (!string.IsNullOrEmpty(request.Notes))
            jobApplication.SetNotes(request.Notes);

        // Update evaluation if rating provided
        if (request.OverallRating.HasValue)
            jobApplication.Evaluate(request.OverallRating.Value, null, null, request.Notes, 0);

        // Save changes
        _jobApplicationRepository.Update(jobApplication);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
