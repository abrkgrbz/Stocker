namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for JobApplication entity
/// </summary>
public record JobApplicationDto
{
    public int Id { get; init; }
    public string ApplicationCode { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime ApplicationDate { get; init; }
    public int JobPostingId { get; init; }
    public string? JobTitle { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
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
    public string Currency { get; init; } = string.Empty;
    public int? NoticePeriodDays { get; init; }
    public DateTime? AvailableStartDate { get; init; }
    public string? HighestEducation { get; init; }
    public string? University { get; init; }
    public string? Major { get; init; }
    public int? GraduationYear { get; init; }
    public string? ResumeUrl { get; init; }
    public string? CoverLetter { get; init; }
    public string? AdditionalDocumentsJson { get; init; }
    public int? OverallRating { get; init; }
    public int? TechnicalScore { get; init; }
    public int? CulturalFitScore { get; init; }
    public string? EvaluationNotes { get; init; }
    public int? EvaluatedByUserId { get; init; }
    public DateTime? EvaluationDate { get; init; }
    public string Source { get; init; } = string.Empty;
    public int? ReferredByEmployeeId { get; init; }
    public string? ReferredByEmployeeName { get; init; }
    public string? SourceDetail { get; init; }
    public string CurrentStage { get; init; } = string.Empty;
    public DateTime? LastStageChangeDate { get; init; }
    public string? RejectionReason { get; init; }
    public string? RejectionCategory { get; init; }
    public string? WithdrawalReason { get; init; }
    public bool OfferExtended { get; init; }
    public DateTime? OfferDate { get; init; }
    public decimal? OfferedSalary { get; init; }
    public DateTime? HireDate { get; init; }
    public int? CreatedEmployeeId { get; init; }
    public string? Skills { get; init; }
    public string? Languages { get; init; }
    public string? Notes { get; init; }
    public string? Tags { get; init; }
    public bool InTalentPool { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
