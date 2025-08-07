using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record TenantCreatedDomainEvent(
    Guid TenantId,
    string Identifier,
    string Name) : DomainEvent;