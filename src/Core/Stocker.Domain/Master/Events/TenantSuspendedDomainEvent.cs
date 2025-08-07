using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record TenantSuspendedDomainEvent(
    Guid TenantId,
    string Reason) : DomainEvent;