namespace Stocker.Shared.Events.CRM;

/// <summary>
/// Published when an activity (task/meeting/call) is completed in the CRM module
/// </summary>
public record ActivityCompletedEvent(
    Guid ActivityId,
    Guid TenantId,
    string ActivityType,
    string Subject,
    Guid? CustomerId,
    Guid? LeadId,
    Guid? DealId,
    DateTime CompletedAt,
    Guid CompletedBy,
    string? Outcome
) : IntegrationEvent;
