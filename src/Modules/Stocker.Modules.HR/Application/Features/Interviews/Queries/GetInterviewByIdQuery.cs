using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Interviews.Queries;

/// <summary>
/// Query to get an interview by ID
/// </summary>
public record GetInterviewByIdQuery(int Id) : IRequest<Result<InterviewDto>>;

/// <summary>
/// Handler for GetInterviewByIdQuery
/// </summary>
public class GetInterviewByIdQueryHandler : IRequestHandler<GetInterviewByIdQuery, Result<InterviewDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetInterviewByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InterviewDto>> Handle(GetInterviewByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.Interviews.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<InterviewDto>.Failure(
                Error.NotFound("Interview", $"Interview with ID {request.Id} not found"));
        }

        // Get related names
        var interviewer = await _unitOfWork.Employees.GetByIdAsync(entity.InterviewerId, cancellationToken);
        var interviewerName = interviewer != null ? $"{interviewer.FirstName} {interviewer.LastName}" : string.Empty;

        string? candidateName = null;
        var jobApplication = await _unitOfWork.JobApplications.GetByIdAsync(entity.JobApplicationId, cancellationToken);
        if (jobApplication != null)
        {
            candidateName = $"{jobApplication.FirstName} {jobApplication.LastName}";
        }

        var dto = new InterviewDto
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
        };

        return Result<InterviewDto>.Success(dto);
    }
}
