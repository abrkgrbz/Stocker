namespace Stocker.Shared.Events.CRM;

/// <summary>
/// Published when a new lead is created in the CRM module
/// </summary>
public record LeadCreatedEvent(
    Guid LeadId,
    Guid TenantId,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Company,
    string? JobTitle,
    string LeadSource,
    string Status,
    int Score,
    DateTime CreatedAt,
    Guid CreatedBy
) : IntegrationEvent, ITenantEvent;
