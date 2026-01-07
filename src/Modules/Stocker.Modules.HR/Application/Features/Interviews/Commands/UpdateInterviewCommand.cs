using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Interviews.Commands;

/// <summary>
/// Command to update an interview
/// </summary>
public record UpdateInterviewCommand : IRequest<Result<bool>>
{
    public int InterviewId { get; init; }
    public string? InterviewType { get; init; }
    public string? Status { get; init; }
    public int? InterviewerId { get; init; }
    public DateTime? ScheduledDateTime { get; init; }
    public int? DurationMinutes { get; init; }
    public string? Timezone { get; init; }
    public DateTime? ActualDateTime { get; init; }
    public int? ActualDurationMinutes { get; init; }
    public string? Format { get; init; }
    public string? Location { get; init; }
    public string? MeetingRoom { get; init; }
    public string? VideoConferenceLink { get; init; }
    public string? VideoConferencePlatform { get; init; }
    public string? PhoneNumber { get; init; }
    public string? Topics { get; init; }
    public string? QuestionsToAsk { get; init; }
    public string? InterviewerNotes { get; init; }
    public string? CandidateInstructions { get; init; }
    // Evaluation
    public int? OverallRating { get; init; }
    public int? TechnicalCompetency { get; init; }
    public int? CommunicationSkills { get; init; }
    public int? ProblemSolving { get; init; }
    public int? CulturalFit { get; init; }
    public int? LeadershipPotential { get; init; }
    public string? Recommendation { get; init; }
    public string? EvaluationSummary { get; init; }
    public string? Strengths { get; init; }
    public string? AreasOfImprovement { get; init; }
    public string? CancellationReason { get; init; }
}

/// <summary>
/// Validator for UpdateInterviewCommand
/// </summary>
public class UpdateInterviewCommandValidator : AbstractValidator<UpdateInterviewCommand>
{
    public UpdateInterviewCommandValidator()
    {
        RuleFor(x => x.InterviewId)
            .GreaterThan(0).WithMessage("Interview ID must be greater than 0");

        RuleFor(x => x.ScheduledDateTime)
            .GreaterThan(DateTime.UtcNow).When(x => x.ScheduledDateTime.HasValue)
            .WithMessage("Scheduled date time must be in the future");

        RuleFor(x => x.DurationMinutes)
            .GreaterThan(0).When(x => x.DurationMinutes.HasValue)
            .WithMessage("Duration must be greater than 0")
            .LessThanOrEqualTo(480).When(x => x.DurationMinutes.HasValue)
            .WithMessage("Duration must not exceed 8 hours (480 minutes)");

        RuleFor(x => x.OverallRating)
            .InclusiveBetween(1, 10).When(x => x.OverallRating.HasValue)
            .WithMessage("Overall rating must be between 1 and 10");
    }
}

/// <summary>
/// Handler for UpdateInterviewCommand
/// </summary>
public class UpdateInterviewCommandHandler : IRequestHandler<UpdateInterviewCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateInterviewCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(UpdateInterviewCommand request, CancellationToken cancellationToken)
    {
        // Get existing interview
        var interview = await _unitOfWork.Interviews.GetByIdAsync(request.InterviewId, cancellationToken);
        if (interview == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Interview", $"Interview with ID {request.InterviewId} not found"));
        }

        // Update interview type if provided
        if (!string.IsNullOrEmpty(request.InterviewType) && Enum.TryParse<InterviewType>(request.InterviewType, true, out var interviewType))
            interview.SetInterviewType(interviewType);

        // Update format if provided
        if (!string.IsNullOrEmpty(request.Format) && Enum.TryParse<InterviewFormat>(request.Format, true, out var format))
            interview.SetFormat(format);

        // Update scheduling if provided
        if (request.ScheduledDateTime.HasValue || request.DurationMinutes.HasValue)
        {
            var scheduledDateTime = request.ScheduledDateTime ?? interview.ScheduledDateTime;
            var durationMinutes = request.DurationMinutes ?? interview.DurationMinutes;
            interview.Schedule(scheduledDateTime, durationMinutes);
        }

        if (!string.IsNullOrEmpty(request.Timezone))
            interview.SetTimezone(request.Timezone);

        if (request.ActualDateTime.HasValue || request.ActualDurationMinutes.HasValue)
            interview.SetActualTiming(request.ActualDateTime, request.ActualDurationMinutes);

        // Update location if provided
        if (!string.IsNullOrEmpty(request.Location) || !string.IsNullOrEmpty(request.MeetingRoom))
            interview.SetLocation(request.Location ?? interview.Location, request.MeetingRoom ?? interview.MeetingRoom);

        if (!string.IsNullOrEmpty(request.VideoConferenceLink))
            interview.SetVideoConference(request.VideoConferenceLink, request.VideoConferencePlatform ?? "Teams");

        if (!string.IsNullOrEmpty(request.PhoneNumber))
            interview.SetPhoneNumber(request.PhoneNumber);

        // Update topics and notes
        if (!string.IsNullOrEmpty(request.Topics))
            interview.SetTopics(request.Topics);

        if (!string.IsNullOrEmpty(request.QuestionsToAsk))
            interview.SetQuestionsToAsk(request.QuestionsToAsk);

        if (!string.IsNullOrEmpty(request.InterviewerNotes))
            interview.SetInterviewerNotes(request.InterviewerNotes);

        if (!string.IsNullOrEmpty(request.CandidateInstructions))
            interview.SetCandidateInstructions(request.CandidateInstructions);

        // Update evaluation if provided
        if (request.OverallRating.HasValue || request.TechnicalCompetency.HasValue || 
            request.CommunicationSkills.HasValue || request.ProblemSolving.HasValue || 
            request.CulturalFit.HasValue || !string.IsNullOrEmpty(request.Recommendation))
        {
            var recommendation = InterviewRecommendation.Undecided;
            if (!string.IsNullOrEmpty(request.Recommendation) && Enum.TryParse<InterviewRecommendation>(request.Recommendation, true, out var parsedRecommendation))
                recommendation = parsedRecommendation;

            interview.SubmitEvaluation(
                request.OverallRating ?? interview.OverallRating ?? 0,
                request.TechnicalCompetency ?? interview.TechnicalCompetency,
                request.CommunicationSkills ?? interview.CommunicationSkills,
                request.ProblemSolving ?? interview.ProblemSolving,
                request.CulturalFit ?? interview.CulturalFit,
                recommendation,
                request.EvaluationSummary ?? interview.EvaluationSummary);
        }

        if (request.LeadershipPotential.HasValue)
            interview.SetLeadershipPotential(request.LeadershipPotential);

        if (!string.IsNullOrEmpty(request.Strengths))
            interview.SetStrengths(request.Strengths);

        if (!string.IsNullOrEmpty(request.AreasOfImprovement))
            interview.SetAreasOfImprovement(request.AreasOfImprovement);

        // Handle cancellation
        if (!string.IsNullOrEmpty(request.CancellationReason))
            interview.Cancel(request.CancellationReason, "System");

        // Save changes
        _unitOfWork.Interviews.Update(interview);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
