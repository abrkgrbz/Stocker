using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record SubscriptionReactivatedDomainEvent(
    Guid SubscriptionId,
    Guid TenantId) : DomainEvent;