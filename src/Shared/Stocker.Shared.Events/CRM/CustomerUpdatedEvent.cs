namespace Stocker.Shared.Events.CRM;

/// <summary>
/// Published when a customer is updated in the CRM module
/// </summary>
public record CustomerUpdatedEvent(
    Guid CustomerId,
    Guid TenantId,
    string CompanyName,
    string Email,
    string? Phone,
    string? Website,
    string? Industry,
    decimal? AnnualRevenue,
    int? NumberOfEmployees,
    DateTime UpdatedAt,
    Guid UpdatedBy
) : IntegrationEvent;
