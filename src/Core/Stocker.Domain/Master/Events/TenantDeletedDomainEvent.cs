using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record TenantDeletedDomainEvent(Guid TenantId) : DomainEvent;