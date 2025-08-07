using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record MasterUserPasswordChangedDomainEvent(Guid UserId) : DomainEvent;