namespace Stocker.Shared.Events.CRM;

/// <summary>
/// Published when a new contact is created for a customer
/// </summary>
public record ContactCreatedEvent(
    Guid ContactId,
    Guid CustomerId,
    Guid TenantId,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? JobTitle,
    bool IsPrimaryContact,
    DateTime CreatedAt,
    Guid CreatedBy
) : IntegrationEvent;
