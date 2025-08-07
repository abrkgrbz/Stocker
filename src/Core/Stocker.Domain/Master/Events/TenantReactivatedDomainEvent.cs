using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record TenantReactivatedDomainEvent(Guid TenantId) : DomainEvent;