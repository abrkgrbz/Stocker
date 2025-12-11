namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for CareerPath entity
/// </summary>
public record CareerPathDto
{
    public int Id { get; init; }
    public int EmployeeId { get; init; }
    public string EmployeeName { get; init; } = string.Empty;
    public string PathName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string CareerTrack { get; init; } = string.Empty;

    // Current State
    public int CurrentPositionId { get; init; }
    public string CurrentPositionName { get; init; } = string.Empty;
    public int CurrentLevel { get; init; }
    public DateTime CurrentPositionStartDate { get; init; }

    // Target Information
    public int? TargetPositionId { get; init; }
    public string? TargetPositionName { get; init; }
    public int? TargetLevel { get; init; }
    public DateTime? ExpectedTargetDate { get; init; }
    public int? TargetTimelineMonths { get; init; }

    // Progress
    public decimal ProgressPercentage { get; init; }
    public int? ReadinessScore { get; init; }
    public bool ReadyForPromotion { get; init; }
    public DateTime? LastAssessmentDate { get; init; }

    // Development Plan
    public string? DevelopmentAreas { get; init; }
    public string? RequiredCompetencies { get; init; }
    public string? RequiredCertifications { get; init; }
    public string? RequiredTraining { get; init; }
    public int? RequiredExperienceYears { get; init; }

    // Mentorship
    public int? MentorId { get; init; }
    public string? MentorName { get; init; }
    public DateTime? MentorAssignmentDate { get; init; }
    public string? MentorshipNotes { get; init; }

    // Manager Assessment
    public string? ManagerAssessment { get; init; }
    public string? ManagerRecommendation { get; init; }
    public DateTime? LastManagerMeetingDate { get; init; }

    // Additional Information
    public string? Notes { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public DateTime? NextReviewDate { get; init; }

    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
