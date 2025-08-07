using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record MasterUserActivatedDomainEvent(Guid UserId) : DomainEvent;