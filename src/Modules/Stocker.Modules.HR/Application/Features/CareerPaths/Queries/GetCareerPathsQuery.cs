using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;

namespace Stocker.Modules.HR.Application.Features.CareerPaths.Queries;

public record GetCareerPathsQuery() : IRequest<List<CareerPathDto>>;

public class GetCareerPathsQueryHandler : IRequestHandler<GetCareerPathsQuery, List<CareerPathDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetCareerPathsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CareerPathDto>> Handle(GetCareerPathsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _unitOfWork.CareerPaths.GetAllAsync(cancellationToken);
        return entities.Select(entity => new CareerPathDto
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            EmployeeName = entity.Employee?.FullName ?? string.Empty,
            PathName = entity.PathName,
            Status = entity.Status.ToString(),
            CareerTrack = entity.CareerTrack.ToString(),

            // Current State
            CurrentPositionId = entity.CurrentPositionId,
            CurrentPositionName = entity.CurrentPosition?.Title ?? string.Empty,
            CurrentLevel = entity.CurrentLevel,
            CurrentPositionStartDate = entity.CurrentPositionStartDate,

            // Target Information
            TargetPositionId = entity.TargetPositionId,
            TargetPositionName = entity.TargetPositionName,
            TargetLevel = entity.TargetLevel,
            ExpectedTargetDate = entity.ExpectedTargetDate,
            TargetTimelineMonths = entity.TargetTimelineMonths,

            // Progress
            ProgressPercentage = entity.ProgressPercentage,
            ReadinessScore = entity.ReadinessScore,
            ReadyForPromotion = entity.ReadyForPromotion,
            LastAssessmentDate = entity.LastAssessmentDate,

            // Development Plan
            DevelopmentAreas = entity.DevelopmentAreas,
            RequiredCompetencies = entity.RequiredCompetencies,
            RequiredCertifications = entity.RequiredCertifications,
            RequiredTraining = entity.RequiredTraining,
            RequiredExperienceYears = entity.RequiredExperienceYears,

            // Mentorship
            MentorId = entity.MentorId,
            MentorName = entity.Mentor?.FullName,
            MentorAssignmentDate = entity.MentorAssignmentDate,
            MentorshipNotes = entity.MentorshipNotes,

            // Manager Assessment
            ManagerAssessment = entity.ManagerAssessment,
            ManagerRecommendation = entity.ManagerRecommendation?.ToString(),
            LastManagerMeetingDate = entity.LastManagerMeetingDate,

            // Additional Information
            Notes = entity.Notes,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            NextReviewDate = entity.NextReviewDate,

            IsActive = !entity.IsDeleted,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        }).ToList();
    }
}
