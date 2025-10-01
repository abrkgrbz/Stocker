using MediatR;

namespace Stocker.SharedKernel.Primitives;

public interface IDomainEvent : INotification
{
    Guid Id { get; }
    DateTime OccurredOnUtc { get; }
}