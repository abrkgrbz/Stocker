namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Certification entity
/// </summary>
public record CertificationDto
{
    public int Id { get; init; }
    public int EmployeeId { get; init; }
    public string EmployeeName { get; init; } = string.Empty;
    public string CertificationName { get; init; } = string.Empty;
    public string CertificationType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;

    // Issuing Authority
    public string IssuingAuthority { get; init; } = string.Empty;
    public string? IssuingCountry { get; init; }
    public string? AccreditationBody { get; init; }

    // Certification Details
    public string? CertificationNumber { get; init; }
    public string? CredentialId { get; init; }
    public string? VerificationUrl { get; init; }
    public string? CertificationLevel { get; init; }
    public string? Specialization { get; init; }

    // Dates
    public DateTime IssueDate { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public DateTime? LastRenewalDate { get; init; }
    public DateTime? NextRenewalDate { get; init; }

    // Training Information
    public bool TrainingRequired { get; init; }
    public int? TotalTrainingHours { get; init; }
    public int? CompletedTrainingHours { get; init; }
    public string? TrainingProvider { get; init; }
    public DateTime? TrainingCompletionDate { get; init; }

    // Exam Information
    public bool ExamRequired { get; init; }
    public DateTime? ExamDate { get; init; }
    public decimal? ExamScore { get; init; }
    public decimal? PassingScore { get; init; }
    public int AttemptNumber { get; init; }

    // Cost Information
    public decimal? CertificationCost { get; init; }
    public decimal? RenewalCost { get; init; }
    public bool CompanySponsored { get; init; }
    public string Currency { get; init; } = "TRY";

    // CPE/CEU Information
    public bool CpeRequired { get; init; }
    public int? RequiredCpeUnits { get; init; }
    public int? EarnedCpeUnits { get; init; }
    public DateTime? CpePeriodStart { get; init; }
    public DateTime? CpePeriodEnd { get; init; }

    // Document Information
    public string? CertificateFileUrl { get; init; }
    public string? BadgeUrl { get; init; }

    // Additional Information
    public string? Description { get; init; }
    public string? Notes { get; init; }
    public bool RequiredForJob { get; init; }
    public bool ReminderSent { get; init; }
    public DateTime? ReminderDate { get; init; }

    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    // Computed Properties
    public bool IsExpired => ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
    public bool IsExpiringSoon => ExpiryDate.HasValue && ExpiryDate.Value <= DateTime.UtcNow.AddDays(90);
}
