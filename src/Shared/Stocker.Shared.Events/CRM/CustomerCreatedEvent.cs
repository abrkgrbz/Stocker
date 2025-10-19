namespace Stocker.Shared.Events.CRM;

/// <summary>
/// Published when a new customer is created in the CRM module
/// </summary>
public record CustomerCreatedEvent(
    Guid CustomerId,
    Guid TenantId,
    string CompanyName,
    string Email,
    string? Phone,
    string? Website,
    string? Industry,
    decimal? AnnualRevenue,
    int? NumberOfEmployees,
    DateTime CreatedAt,
    Guid CreatedBy
) : IntegrationEvent;
