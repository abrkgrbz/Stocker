namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for DisciplinaryAction entity
/// </summary>
public record DisciplinaryActionDto
{
    public int Id { get; init; }
    public int EmployeeId { get; init; }
    public string EmployeeName { get; init; } = string.Empty;
    public string ActionCode { get; init; } = string.Empty;
    public string ActionType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string SeverityLevel { get; init; } = string.Empty;

    // Incident Information
    public DateTime IncidentDate { get; init; }
    public string? IncidentLocation { get; init; }
    public string IncidentDescription { get; init; } = string.Empty;
    public string? ViolatedPolicy { get; init; }
    public string? Witnesses { get; init; }
    public string? Evidence { get; init; }

    // Investigation
    public DateTime? InvestigationStartDate { get; init; }
    public DateTime? InvestigationEndDate { get; init; }
    public int? InvestigatorId { get; init; }
    public string? InvestigatorName { get; init; }
    public string? InvestigationNotes { get; init; }
    public string? InvestigationFindings { get; init; }

    // Defense
    public bool DefenseRequested { get; init; }
    public DateTime? DefenseDeadline { get; init; }
    public bool DefenseReceived { get; init; }
    public DateTime? DefenseDate { get; init; }
    public string? DefenseText { get; init; }

    // Decision
    public DateTime? DecisionDate { get; init; }
    public int? DecisionMakerId { get; init; }
    public string? DecisionMakerName { get; init; }
    public string? Decision { get; init; }
    public string? DecisionRationale { get; init; }

    // Applied Sanction
    public string? AppliedSanction { get; init; }
    public string? SanctionDetails { get; init; }
    public DateTime? SanctionStartDate { get; init; }
    public DateTime? SanctionEndDate { get; init; }
    public int? SanctionDurationDays { get; init; }
    public decimal? SalaryDeductionAmount { get; init; }
    public string Currency { get; init; } = "TRY";

    // Follow-up
    public bool FollowUpRequired { get; init; }
    public DateTime? FollowUpDate { get; init; }
    public string? FollowUpNotes { get; init; }
    public bool HasPerformanceImprovementPlan { get; init; }
    public int? PerformanceImprovementPlanId { get; init; }

    // Appeal
    public bool WasAppealed { get; init; }
    public DateTime? AppealDate { get; init; }
    public string? AppealOutcome { get; init; }
    public string? AppealNotes { get; init; }

    // Additional Information
    public int? ReportedById { get; init; }
    public string? ReportedByName { get; init; }
    public int? HrRepresentativeId { get; init; }
    public string? HrRepresentativeName { get; init; }
    public bool IsConfidential { get; init; }
    public int PreviousWarningsCount { get; init; }
    public string? InternalNotes { get; init; }

    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
