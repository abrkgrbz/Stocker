using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobApplications.Commands;

/// <summary>
/// Command to update a job application
/// </summary>
public record UpdateJobApplicationCommand : IRequest<Result<bool>>
{
    public int JobApplicationId { get; init; }
    public string? Status { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Email { get; init; }
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
    public int? NoticePeriodDays { get; init; }
    public DateTime? AvailableStartDate { get; init; }
    public string? HighestEducation { get; init; }
    public string? University { get; init; }
    public string? Major { get; init; }
    public int? GraduationYear { get; init; }
    public string? CoverLetter { get; init; }
    // Evaluation
    public int? OverallRating { get; init; }
    public int? TechnicalScore { get; init; }
    public int? CulturalFitScore { get; init; }
    public string? EvaluationNotes { get; init; }
    public string? CurrentStage { get; init; }
    public string? RejectionReason { get; init; }
    public string? RejectionCategory { get; init; }
    public string? WithdrawalReason { get; init; }
    // Offer
    public bool? OfferExtended { get; init; }
    public DateTime? OfferDate { get; init; }
    public decimal? OfferedSalary { get; init; }
    public DateTime? HireDate { get; init; }
    // Other
    public string? Skills { get; init; }
    public string? Languages { get; init; }
    public string? Notes { get; init; }
    public string? Tags { get; init; }
    public bool? InTalentPool { get; init; }
}

/// <summary>
/// Validator for UpdateJobApplicationCommand
/// </summary>
public class UpdateJobApplicationCommandValidator : AbstractValidator<UpdateJobApplicationCommand>
{
    public UpdateJobApplicationCommandValidator()
    {
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
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateJobApplicationCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(UpdateJobApplicationCommand request, CancellationToken cancellationToken)
    {
        // Get existing job application
        var jobApplication = await _unitOfWork.JobApplications.GetByIdAsync(request.JobApplicationId, cancellationToken);
        if (jobApplication == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobApplication", $"Job Application with ID {request.JobApplicationId} not found"));
        }

        // Update basic info
        if (!string.IsNullOrEmpty(request.FirstName))
            jobApplication.SetFirstName(request.FirstName);

        if (!string.IsNullOrEmpty(request.LastName))
            jobApplication.SetLastName(request.LastName);

        if (!string.IsNullOrEmpty(request.Email))
            jobApplication.SetEmail(request.Email);

        // Update stage if provided
        if (!string.IsNullOrEmpty(request.CurrentStage) && Enum.TryParse<ApplicationStage>(request.CurrentStage, true, out var stage))
            jobApplication.MoveToStage(stage);

        // Update contact info
        if (!string.IsNullOrEmpty(request.Phone) || !string.IsNullOrEmpty(request.MobilePhone) ||
            !string.IsNullOrEmpty(request.Address) || !string.IsNullOrEmpty(request.City) || !string.IsNullOrEmpty(request.Country))
            jobApplication.UpdateContactInfo(
                request.Phone ?? jobApplication.Phone, 
                request.MobilePhone ?? jobApplication.MobilePhone, 
                request.Address ?? jobApplication.Address, 
                request.City ?? jobApplication.City, 
                request.Country ?? jobApplication.Country);

        // Update online profiles
        if (!string.IsNullOrEmpty(request.LinkedInUrl))
            jobApplication.SetLinkedInUrl(request.LinkedInUrl);

        if (!string.IsNullOrEmpty(request.PortfolioUrl))
            jobApplication.SetPortfolioUrl(request.PortfolioUrl);

        // Update experience
        if (request.TotalExperienceYears.HasValue || !string.IsNullOrEmpty(request.CurrentCompany) ||
            !string.IsNullOrEmpty(request.CurrentPosition) || request.CurrentSalary.HasValue ||
            request.ExpectedSalary.HasValue || request.NoticePeriodDays.HasValue)
            jobApplication.UpdateExperience(
                request.TotalExperienceYears ?? jobApplication.TotalExperienceYears,
                request.CurrentCompany ?? jobApplication.CurrentCompany,
                request.CurrentPosition ?? jobApplication.CurrentPosition,
                request.CurrentSalary ?? jobApplication.CurrentSalary,
                request.ExpectedSalary ?? jobApplication.ExpectedSalary,
                request.NoticePeriodDays ?? jobApplication.NoticePeriodDays);

        if (request.AvailableStartDate.HasValue)
            jobApplication.SetAvailableStartDate(request.AvailableStartDate);

        // Update education
        if (!string.IsNullOrEmpty(request.HighestEducation))
            jobApplication.SetHighestEducation(request.HighestEducation);

        if (!string.IsNullOrEmpty(request.University) || !string.IsNullOrEmpty(request.Major) || request.GraduationYear.HasValue)
            jobApplication.UpdateEducation(
                jobApplication.HighestEducation,
                request.University ?? jobApplication.University,
                request.Major ?? jobApplication.Major,
                request.GraduationYear ?? jobApplication.GraduationYear);

        if (!string.IsNullOrEmpty(request.CoverLetter))
            jobApplication.SetCoverLetter(request.CoverLetter);

        // Update evaluation
        if (request.OverallRating.HasValue || request.TechnicalScore.HasValue || 
            request.CulturalFitScore.HasValue || !string.IsNullOrEmpty(request.EvaluationNotes))
            jobApplication.Evaluate(
                request.OverallRating ?? jobApplication.OverallRating ?? 0,
                request.TechnicalScore ?? jobApplication.TechnicalScore,
                request.CulturalFitScore ?? jobApplication.CulturalFitScore,
                request.EvaluationNotes ?? jobApplication.EvaluationNotes,
                0);

        // Handle rejection
        if (!string.IsNullOrEmpty(request.RejectionReason))
        {
            var rejectionCategory = RejectionCategory.Other;
            if (!string.IsNullOrEmpty(request.RejectionCategory) && Enum.TryParse<RejectionCategory>(request.RejectionCategory, true, out var parsedCategory))
                rejectionCategory = parsedCategory;
            jobApplication.Reject(request.RejectionReason, rejectionCategory);
        }

        // Handle withdrawal
        if (!string.IsNullOrEmpty(request.WithdrawalReason))
            jobApplication.Withdraw(request.WithdrawalReason);

        // Handle offer
        if (request.OfferExtended == true && request.OfferedSalary.HasValue)
            jobApplication.ExtendOffer(request.OfferedSalary.Value, request.OfferDate ?? DateTime.UtcNow);

        if (request.HireDate.HasValue)
            jobApplication.AcceptOffer(request.HireDate.Value);

        // Update skills, languages, notes, tags
        if (!string.IsNullOrEmpty(request.Skills))
            jobApplication.SetSkills(request.Skills);

        if (!string.IsNullOrEmpty(request.Languages))
            jobApplication.SetLanguages(request.Languages);

        if (!string.IsNullOrEmpty(request.Notes))
            jobApplication.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(request.Tags))
            jobApplication.SetTags(request.Tags);

        // Handle talent pool
        if (request.InTalentPool.HasValue)
        {
            if (request.InTalentPool.Value)
                jobApplication.AddToTalentPool();
            else
                jobApplication.RemoveFromTalentPool();
        }

        // Save changes
        _unitOfWork.JobApplications.Update(jobApplication);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
