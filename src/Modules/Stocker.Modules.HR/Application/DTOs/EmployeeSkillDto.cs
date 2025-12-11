namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for EmployeeSkill entity
/// </summary>
public record EmployeeSkillDto
{
    public int Id { get; init; }
    public int EmployeeId { get; init; }
    public int? SkillId { get; init; }
    public string SkillName { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string SkillType { get; init; } = string.Empty;
    public string ProficiencyLevel { get; init; } = string.Empty;
    public decimal? YearsOfExperience { get; init; }
    public int? SelfAssessment { get; init; }
    public int? ManagerAssessment { get; init; }
    public DateTime? LastAssessmentDate { get; init; }
    public bool IsVerified { get; init; }
    public string? VerificationMethod { get; init; }
    public DateTime? VerificationDate { get; init; }
    public int? VerifiedByUserId { get; init; }
    public bool IsCertified { get; init; }
    public string? CertificationName { get; init; }
    public string? CertifyingAuthority { get; init; }
    public string? CertificationNumber { get; init; }
    public DateTime? CertificationDate { get; init; }
    public DateTime? CertificationExpiryDate { get; init; }
    public string? CertificationUrl { get; init; }
    public bool IsPrimary { get; init; }
    public bool IsActivelyUsed { get; init; }
    public DateTime? LastUsedDate { get; init; }
    public string? UsageFrequency { get; init; }
    public string? Notes { get; init; }
    public string? LearningSource { get; init; }
    public string? RelatedProjects { get; init; }
    public bool CanMentor { get; init; }
    public bool CanTrain { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
