namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Onboarding entity
/// </summary>
public record OnboardingDto
{
    public int Id { get; init; }
    public int EmployeeId { get; init; }
    public string? EmployeeName { get; init; }
    public string Status { get; init; } = string.Empty;
    public int? TemplateId { get; init; }
    public string? TemplateName { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime? PlannedEndDate { get; init; }
    public DateTime? ActualEndDate { get; init; }
    public DateTime FirstDayOfWork { get; init; }
    public int? BuddyId { get; init; }
    public string? BuddyName { get; init; }
    public int? HrResponsibleId { get; init; }
    public string? HrResponsibleName { get; init; }
    public int? ItResponsibleId { get; init; }
    public string? ItResponsibleName { get; init; }
    public decimal CompletionPercentage { get; init; }
    public int TotalTasks { get; init; }
    public int CompletedTasks { get; init; }
    public bool LaptopProvided { get; init; }
    public bool PhoneProvided { get; init; }
    public bool AccessCardProvided { get; init; }
    public string? EquipmentNotes { get; init; }
    public bool EmailAccountCreated { get; init; }
    public bool AdAccountCreated { get; init; }
    public bool SystemAccessGranted { get; init; }
    public bool VpnAccessGranted { get; init; }
    public bool ContractSigned { get; init; }
    public bool NdaSigned { get; init; }
    public bool PoliciesAcknowledged { get; init; }
    public bool BankDetailsReceived { get; init; }
    public bool EmergencyContactReceived { get; init; }
    public bool OrientationCompleted { get; init; }
    public bool SafetyTrainingCompleted { get; init; }
    public bool ComplianceTrainingCompleted { get; init; }
    public bool ProductTrainingCompleted { get; init; }
    public bool Week1FeedbackReceived { get; init; }
    public bool Month1FeedbackReceived { get; init; }
    public bool Month3FeedbackReceived { get; init; }
    public string? EmployeeFeedback { get; init; }
    public string? ManagerFeedback { get; init; }
    public bool WelcomeKitSent { get; init; }
    public bool DeskPrepared { get; init; }
    public bool TeamIntroductionDone { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

