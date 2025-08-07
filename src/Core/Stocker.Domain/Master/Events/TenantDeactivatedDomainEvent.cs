using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record TenantDeactivatedDomainEvent(Guid TenantId) : DomainEvent;