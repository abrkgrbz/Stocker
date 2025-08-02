namespace Stocker.SharedKernel.Primitives;

public interface IDomainEvent
{
    Guid Id { get; }
    DateTime OccurredOnUtc { get; }
}