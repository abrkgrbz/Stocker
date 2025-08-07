using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record TenantConnectionStringUpdatedDomainEvent(Guid TenantId) : DomainEvent;