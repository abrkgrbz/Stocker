namespace Stocker.Shared.Events.CRM;

/// <summary>
/// Published when a new opportunity is created in the CRM module
/// </summary>
public record OpportunityCreatedEvent(
    Guid OpportunityId,
    Guid LeadId,
    Guid TenantId,
    string Title,
    string? Description,
    decimal EstimatedValue,
    string Currency,
    decimal Probability,
    DateTime? EstimatedCloseDate,
    DateTime CreatedAt,
    Guid CreatedBy
) : IntegrationEvent;
