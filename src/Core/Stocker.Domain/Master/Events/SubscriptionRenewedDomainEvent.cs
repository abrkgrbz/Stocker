using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record SubscriptionRenewedDomainEvent(
    Guid SubscriptionId,
    Guid TenantId,
    DateTime NextBillingDate) : DomainEvent;