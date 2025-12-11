namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Interview entity
/// </summary>
public record InterviewDto
{
    public int Id { get; init; }
    public string InterviewType { get; init; } = string.Empty;
    public int Round { get; init; }
    public string Status { get; init; } = string.Empty;
    public int JobApplicationId { get; init; }
    public string? CandidateName { get; init; }
    public int InterviewerId { get; init; }
    public string InterviewerName { get; init; } = string.Empty;
    public DateTime ScheduledDateTime { get; init; }
    public int DurationMinutes { get; init; }
    public string? Timezone { get; init; }
    public DateTime? ActualDateTime { get; init; }
    public int? ActualDurationMinutes { get; init; }
    public string Format { get; init; } = string.Empty;
    public string? Location { get; init; }
    public string? MeetingRoom { get; init; }
    public string? VideoConferenceLink { get; init; }
    public string? VideoConferencePlatform { get; init; }
    public string? PhoneNumber { get; init; }
    public string? Topics { get; init; }
    public string? QuestionsToAsk { get; init; }
    public string? InterviewerNotes { get; init; }
    public string? CandidateInstructions { get; init; }
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
    public bool InvitationSentToCandidate { get; init; }
    public DateTime? InvitationSentDate { get; init; }
    public bool CandidateConfirmed { get; init; }
    public bool ReminderSent { get; init; }
    public string? CancellationReason { get; init; }
    public string? CancelledBy { get; init; }
    public bool WasRescheduled { get; init; }
    public DateTime? PreviousDateTime { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
