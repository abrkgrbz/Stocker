using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record SubscriptionCreatedDomainEvent(
    Guid SubscriptionId,
    Guid TenantId,
    Guid PackageId) : DomainEvent;