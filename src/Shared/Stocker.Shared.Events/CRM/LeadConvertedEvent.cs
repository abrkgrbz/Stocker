namespace Stocker.Shared.Events.CRM;

/// <summary>
/// Published when a lead is converted to a customer in the CRM module
/// </summary>
public record LeadConvertedEvent(
    Guid LeadId,
    Guid CustomerId,
    Guid TenantId,
    DateTime ConvertedAt,
    Guid ConvertedBy,
    string ConversionReason
) : IntegrationEvent, ITenantEvent;
