using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record MasterUserCreatedDomainEvent(
    Guid UserId,
    string Username,
    string Email,
    UserType UserType) : DomainEvent;