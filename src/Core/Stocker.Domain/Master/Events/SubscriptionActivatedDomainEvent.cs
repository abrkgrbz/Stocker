using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record SubscriptionActivatedDomainEvent(
    Guid SubscriptionId,
    Guid TenantId) : DomainEvent;