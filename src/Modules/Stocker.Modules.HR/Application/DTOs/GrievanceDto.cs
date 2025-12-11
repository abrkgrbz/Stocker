namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Grievance entity
/// </summary>
public record GrievanceDto
{
    public int Id { get; init; }
    public string GrievanceCode { get; init; } = string.Empty;
    public int ComplainantId { get; init; }
    public string ComplainantName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string GrievanceType { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public string Subject { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public DateTime? IncidentDate { get; init; }
    public string? IncidentLocation { get; init; }
    public int? AccusedPersonId { get; init; }
    public string? AccusedPersonName { get; init; }
    public string? AccusedPersonDescription { get; init; }
    public string? Witnesses { get; init; }
    public string? Evidence { get; init; }
    public bool IsAnonymous { get; init; }
    public bool IsConfidential { get; init; }
    public bool RetaliationProtectionRequested { get; init; }
    public int? AssignedToId { get; init; }
    public string? AssignedToName { get; init; }
    public int? HrRepresentativeId { get; init; }
    public string? HrRepresentativeName { get; init; }
    public DateTime? AssignedDate { get; init; }
    public DateTime FiledDate { get; init; }
    public DateTime? AcknowledgedDate { get; init; }
    public DateTime? TargetResolutionDate { get; init; }
    public DateTime? ResolutionDate { get; init; }
    public DateTime? ClosedDate { get; init; }
    public bool InvestigationRequired { get; init; }
    public DateTime? InvestigationStartDate { get; init; }
    public DateTime? InvestigationEndDate { get; init; }
    public string? InvestigationNotes { get; init; }
    public string? InvestigationFindings { get; init; }
    public string? Resolution { get; init; }
    public string? ResolutionType { get; init; }
    public string? ActionsTaken { get; init; }
    public string? PreventiveMeasures { get; init; }
    public bool? ComplainantSatisfied { get; init; }
    public string? SatisfactionFeedback { get; init; }
    public int? SatisfactionRating { get; init; }
    public bool WasEscalated { get; init; }
    public DateTime? EscalationDate { get; init; }
    public string? EscalationReason { get; init; }
    public int EscalationLevel { get; init; }
    public string? InternalNotes { get; init; }
    public string? Category { get; init; }
    public string? Subcategory { get; init; }
    public string? Tags { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
