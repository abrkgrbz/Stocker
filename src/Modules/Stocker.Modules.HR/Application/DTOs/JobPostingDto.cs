namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for JobPosting entity
/// </summary>
public record JobPostingDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string PostingCode { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string EmploymentType { get; init; } = string.Empty;
    public string ExperienceLevel { get; init; } = string.Empty;
    public int DepartmentId { get; init; }
    public string DepartmentName { get; init; } = string.Empty;
    public int? PositionId { get; init; }
    public string? PositionTitle { get; init; }
    public int? HiringManagerId { get; init; }
    public string? HiringManagerName { get; init; }
    public int NumberOfOpenings { get; init; }
    public int? WorkLocationId { get; init; }
    public string? WorkLocationName { get; init; }
    public string RemoteWorkType { get; init; } = string.Empty;
    public string? City { get; init; }
    public string? Country { get; init; }
    public string Description { get; init; } = string.Empty;
    public string? Requirements { get; init; }
    public string? Responsibilities { get; init; }
    public string? Qualifications { get; init; }
    public string? PreferredQualifications { get; init; }
    public string? Benefits { get; init; }
    public decimal? SalaryMin { get; init; }
    public decimal? SalaryMax { get; init; }
    public string Currency { get; init; } = string.Empty;
    public bool ShowSalary { get; init; }
    public string SalaryPeriod { get; init; } = string.Empty;
    public DateTime? PostedDate { get; init; }
    public DateTime? ApplicationDeadline { get; init; }
    public DateTime? ExpectedStartDate { get; init; }
    public DateTime? ClosedDate { get; init; }
    public int TotalApplications { get; init; }
    public int ViewsCount { get; init; }
    public int HiredCount { get; init; }
    public bool IsInternal { get; init; }
    public bool IsFeatured { get; init; }
    public bool IsUrgent { get; init; }
    public int? PostedByUserId { get; init; }
    public string? Tags { get; init; }
    public string? Keywords { get; init; }
    public string? InternalNotes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
