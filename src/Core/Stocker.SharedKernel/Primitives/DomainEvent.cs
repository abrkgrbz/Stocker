namespace Stocker.SharedKernel.Primitives;

public abstract record DomainEvent : IDomainEvent
{
    protected DomainEvent()
    {
        Id = Guid.NewGuid();
        OccurredOnUtc = DateTime.UtcNow;
    }

    public Guid Id { get; init; }
    public DateTime OccurredOnUtc { get; init; }
}