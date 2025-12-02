using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record SubscriptionPackageChangedDomainEvent(
    Guid SubscriptionId,
    Guid TenantId,
    Guid OldPackageId,
    Guid NewPackageId) : DomainEvent;
