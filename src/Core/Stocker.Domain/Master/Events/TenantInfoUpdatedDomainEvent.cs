using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record TenantInfoUpdatedDomainEvent(Guid TenantId) : DomainEvent;