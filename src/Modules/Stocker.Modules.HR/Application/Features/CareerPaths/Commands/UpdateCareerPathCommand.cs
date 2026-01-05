using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.CareerPaths.Commands;

/// <summary>
/// Command to update a career path
/// </summary>
public record UpdateCareerPathCommand : IRequest<Result<int>>
{
    public int CareerPathId { get; init; }
    public int? TargetPositionId { get; init; }
    public string? TargetPositionName { get; init; }
    public int? TargetLevel { get; init; }
    public DateTime? ExpectedTargetDate { get; init; }
    public int? TargetTimelineMonths { get; init; }
    public int? ReadinessScore { get; init; }
    public bool? ReadyForPromotion { get; init; }
    public int? MentorId { get; init; }
    public string? DevelopmentAreas { get; init; }
    public string? RequiredCompetencies { get; init; }
    public string? RequiredCertifications { get; init; }
    public string? RequiredTraining { get; init; }
    public int? RequiredExperienceYears { get; init; }
    public string? ManagerAssessment { get; init; }
    public ManagerRecommendation? ManagerRecommendation { get; init; }
    public string? MentorshipNotes { get; init; }
    public string? Notes { get; init; }
    public DateTime? NextReviewDate { get; init; }
}

/// <summary>
/// Handler for UpdateCareerPathCommand
/// </summary>
public class UpdateCareerPathCommandHandler : IRequestHandler<UpdateCareerPathCommand, Result<int>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateCareerPathCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(UpdateCareerPathCommand request, CancellationToken cancellationToken)
    {
        var careerPath = await _unitOfWork.CareerPaths.GetByIdAsync(request.CareerPathId, cancellationToken);
        if (careerPath == null)
        {
            return Result<int>.Failure(
                Error.NotFound("CareerPath", $"Career path with ID {request.CareerPathId} not found"));
        }

        if (request.TargetPositionId.HasValue && !string.IsNullOrEmpty(request.TargetPositionName))
        {
            careerPath.SetTarget(
                request.TargetPositionId.Value,
                request.TargetPositionName,
                request.TargetLevel ?? 0,
                request.ExpectedTargetDate,
                request.TargetTimelineMonths);
        }

        if (request.ReadinessScore.HasValue && request.ReadyForPromotion.HasValue)
        {
            careerPath.UpdateReadiness(request.ReadinessScore.Value, request.ReadyForPromotion.Value);
        }

        if (request.MentorId.HasValue)
        {
            careerPath.AssignMentor(request.MentorId.Value);
        }

        if (!string.IsNullOrEmpty(request.DevelopmentAreas))
            careerPath.SetDevelopmentAreas(request.DevelopmentAreas);

        if (!string.IsNullOrEmpty(request.RequiredCompetencies))
            careerPath.SetRequiredCompetencies(request.RequiredCompetencies);

        if (!string.IsNullOrEmpty(request.RequiredCertifications))
            careerPath.SetRequiredCertifications(request.RequiredCertifications);

        if (!string.IsNullOrEmpty(request.RequiredTraining))
            careerPath.SetRequiredTraining(request.RequiredTraining);

        if (request.RequiredExperienceYears.HasValue)
            careerPath.SetRequiredExperience(request.RequiredExperienceYears);

        if (!string.IsNullOrEmpty(request.ManagerAssessment) && request.ManagerRecommendation.HasValue)
        {
            careerPath.RecordManagerMeeting(request.ManagerAssessment, request.ManagerRecommendation.Value);
        }

        if (!string.IsNullOrEmpty(request.MentorshipNotes))
            careerPath.SetMentorshipNotes(request.MentorshipNotes);

        if (!string.IsNullOrEmpty(request.Notes))
            careerPath.SetNotes(request.Notes);

        if (request.NextReviewDate.HasValue)
            careerPath.SetNextReviewDate(request.NextReviewDate);

        _unitOfWork.CareerPaths.Update(careerPath);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(careerPath.Id);
    }
}
