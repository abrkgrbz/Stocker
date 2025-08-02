namespace Stocker.SharedKernel.Primitives;

public abstract class AggregateRoot : AggregateRoot<Guid>
{
    protected AggregateRoot() : base()
    {
    }

    protected AggregateRoot(Guid id) : base(id)
    {
    }
}

public abstract class AggregateRoot<TId> : Entity<TId>
    where TId : notnull
{
    protected AggregateRoot() : base()
    {
    }

    protected AggregateRoot(TId id) : base(id)
    {
    }
}