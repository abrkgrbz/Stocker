using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Events;

/// <summary>
/// Domain event raised when a new user is invited to the tenant.
/// This event triggers the invitation email workflow.
/// </summary>
public sealed record TenantUserInvitedDomainEvent(
    Guid TenantId,
    Guid UserId,
    string Username,
    string Email,
    string FirstName,
    string LastName,
    string ActivationToken,
    string InviterName,
    string CompanyName) : DomainEvent;
