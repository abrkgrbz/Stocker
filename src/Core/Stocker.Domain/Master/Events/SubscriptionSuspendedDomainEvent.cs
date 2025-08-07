using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record SubscriptionSuspendedDomainEvent(
    Guid SubscriptionId,
    Guid TenantId,
    string Reason) : DomainEvent;