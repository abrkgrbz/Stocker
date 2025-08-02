namespace Stocker.SharedKernel.Primitives;

public interface IEntity
{
    public Guid Id { get; }
}

public interface IEntity<TId> where TId : notnull
{
    public TId Id { get; }
}