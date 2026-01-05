using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Interviews.Queries;

/// <summary>
/// Query to get all interviews
/// </summary>
public record GetInterviewsQuery(int? JobApplicationId = null, int? InterviewerId = null, bool UpcomingOnly = false) : IRequest<Result<List<InterviewDto>>>;

/// <summary>
/// Handler for GetInterviewsQuery
/// </summary>
public class GetInterviewsQueryHandler : IRequestHandler<GetInterviewsQuery, Result<List<InterviewDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetInterviewsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<InterviewDto>>> Handle(GetInterviewsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _unitOfWork.Interviews.GetAllAsync(cancellationToken);

        var filteredEntities = entities.AsEnumerable();

        if (request.JobApplicationId.HasValue)
        {
            filteredEntities = filteredEntities.Where(e => e.JobApplicationId == request.JobApplicationId.Value);
        }

        if (request.InterviewerId.HasValue)
        {
            filteredEntities = filteredEntities.Where(e => e.InterviewerId == request.InterviewerId.Value);
        }

        if (request.UpcomingOnly)
        {
            filteredEntities = filteredEntities.Where(e =>
                e.ScheduledDateTime > DateTime.UtcNow &&
                e.Status != Domain.Entities.InterviewStatus.Cancelled &&
                e.Status != Domain.Entities.InterviewStatus.Completed);
        }

        var dtos = new List<InterviewDto>();
        foreach (var entity in filteredEntities)
        {
            var interviewer = await _unitOfWork.Employees.GetByIdAsync(entity.InterviewerId, cancellationToken);
            var interviewerName = interviewer != null ? $"{interviewer.FirstName} {interviewer.LastName}" : string.Empty;

            string? candidateName = null;
            var jobApplication = await _unitOfWork.JobApplications.GetByIdAsync(entity.JobApplicationId, cancellationToken);
            if (jobApplication != null)
            {
                candidateName = $"{jobApplication.FirstName} {jobApplication.LastName}";
            }

            dtos.Add(new InterviewDto
            {
                Id = entity.Id,
                InterviewType = entity.InterviewType.ToString(),
                Round = entity.Round,
                Status = entity.Status.ToString(),
                JobApplicationId = entity.JobApplicationId,
                CandidateName = candidateName,
                InterviewerId = entity.InterviewerId,
                InterviewerName = interviewerName,
                ScheduledDateTime = entity.ScheduledDateTime,
                DurationMinutes = entity.DurationMinutes,
                Timezone = entity.Timezone,
                ActualDateTime = entity.ActualDateTime,
                ActualDurationMinutes = entity.ActualDurationMinutes,
                Format = entity.Format.ToString(),
                Location = entity.Location,
                MeetingRoom = entity.MeetingRoom,
                VideoConferenceLink = entity.VideoConferenceLink,
                VideoConferencePlatform = entity.VideoConferencePlatform,
                PhoneNumber = entity.PhoneNumber,
                Topics = entity.Topics,
                QuestionsToAsk = entity.QuestionsToAsk,
                InterviewerNotes = entity.InterviewerNotes,
                CandidateInstructions = entity.CandidateInstructions,
                OverallRating = entity.OverallRating,
                TechnicalCompetency = entity.TechnicalCompetency,
                CommunicationSkills = entity.CommunicationSkills,
                ProblemSolving = entity.ProblemSolving,
                CulturalFit = entity.CulturalFit,
                LeadershipPotential = entity.LeadershipPotential,
                Recommendation = entity.Recommendation?.ToString(),
                EvaluationSummary = entity.EvaluationSummary,
                Strengths = entity.Strengths,
                AreasOfImprovement = entity.AreasOfImprovement,
                InvitationSentToCandidate = entity.InvitationSentToCandidate,
                InvitationSentDate = entity.InvitationSentDate,
                CandidateConfirmed = entity.CandidateConfirmed,
                ReminderSent = entity.ReminderSent,
                CancellationReason = entity.CancellationReason,
                CancelledBy = entity.CancelledBy,
                WasRescheduled = entity.WasRescheduled,
                PreviousDateTime = entity.PreviousDateTime,
                CreatedAt = entity.CreatedDate,
                UpdatedAt = entity.UpdatedDate
            });
        }

        return Result<List<InterviewDto>>.Success(dtos.OrderBy(i => i.ScheduledDateTime).ToList());
    }
}
