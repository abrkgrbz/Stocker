namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for SuccessionPlan entity
/// </summary>
public record SuccessionPlanDto
{
    public int Id { get; init; }
    public string PlanName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public int PositionId { get; init; }
    public string? PositionTitle { get; init; }
    public int DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public int? CurrentIncumbentId { get; init; }
    public string? CurrentIncumbentName { get; init; }
    public bool IsCriticalPosition { get; init; }
    public string RiskLevel { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime? TargetDate { get; init; }
    public DateTime? LastReviewDate { get; init; }
    public DateTime? NextReviewDate { get; init; }
    public DateTime? ExpectedVacancyDate { get; init; }
    public string? VacancyReason { get; init; }
    public decimal CompletionPercentage { get; init; }
    public bool HasReadyCandidate { get; init; }
    public bool HasEmergencyBackup { get; init; }
    public string? RequiredCompetencies { get; init; }
    public int? RequiredExperienceYears { get; init; }
    public string? RequiredCertifications { get; init; }
    public string? RequiredEducation { get; init; }
    public string? CriticalSuccessFactors { get; init; }
    public int? PlanOwnerId { get; init; }
    public string? PlanOwnerName { get; init; }
    public int? HrResponsibleId { get; init; }
    public string? HrResponsibleName { get; init; }
    public string? Description { get; init; }
    public string? Notes { get; init; }
    public bool ExternalHiringNeeded { get; init; }
    public decimal? Budget { get; init; }
    public string Currency { get; init; } = "TRY";
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

