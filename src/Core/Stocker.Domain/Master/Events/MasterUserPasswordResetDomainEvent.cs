using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record MasterUserPasswordResetDomainEvent(Guid UserId) : DomainEvent;