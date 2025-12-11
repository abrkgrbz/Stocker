using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;

namespace Stocker.Modules.HR.Application.Features.CareerPaths.Queries;

public record GetCareerPathByIdQuery(int Id) : IRequest<CareerPathDto?>;

public class GetCareerPathByIdQueryHandler : IRequestHandler<GetCareerPathByIdQuery, CareerPathDto?>
{
    private readonly ICareerPathRepository _repository;

    public GetCareerPathByIdQueryHandler(ICareerPathRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<CareerPathDto?> Handle(GetCareerPathByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null) return null;

        return new CareerPathDto
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
        };
    }
}
