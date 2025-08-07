using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record MasterUserSuspendedDomainEvent(
    Guid UserId,
    string Reason) : DomainEvent;